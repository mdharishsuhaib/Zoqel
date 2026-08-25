package com.zoqel.recovery;

import com.zoqel.agent.AgentDecision;
import com.zoqel.agent.AgentService;
import com.zoqel.agent.RecoveryAction;
import com.zoqel.audit.AuditService;
import com.zoqel.audit.AuditEventType;
import com.zoqel.customer.CustomerHistory;
import com.zoqel.customer.CustomerHistoryService;
import com.zoqel.exception.NotFoundException;
import com.zoqel.policy.PolicyDecision;
import com.zoqel.policy.PolicyEngine;
import com.zoqel.risk.RiskDetectionService;
import com.zoqel.risk.RiskScore;
import com.zoqel.simulator.PaymentSimulator;
import com.zoqel.simulator.SimulationOutcome;
import com.zoqel.simulator.SimulationResult;
import com.zoqel.transaction.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RecoveryCaseService {

    private final RecoveryCaseRepository recoveryCaseRepository;
    private final TransactionRepository transactionRepository;
    private final RiskDetectionService riskDetectionService;
    private final AgentService agentService;
    private final PolicyEngine policyEngine;
    private final PaymentSimulator paymentSimulator;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final AuditService auditService;
    private final CustomerHistoryService customerHistoryService;

    @Transactional
    public RecoveryCase process(String transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (t.getStatus() != TransactionStatus.FAILED) {
            throw new IllegalStateException("Can only process FAILED transactions");
        }

        RecoveryCase rc = recoveryCaseRepository.findByTransactionId(transactionId)
                .orElseGet(() -> RecoveryCase.builder().transactionId(transactionId).build());

        if (rc.getStatus() == RecoveryCaseStatus.RECOVERED || rc.getStatus() == RecoveryCaseStatus.FAILED || rc.getStatus() == RecoveryCaseStatus.ESCALATED || rc.getStatus() == RecoveryCaseStatus.IGNORED) {
            return rc;
        }

        rc.setStatus(RecoveryCaseStatus.IN_PROGRESS);
        rc = recoveryCaseRepository.save(rc);

        auditService.record(transactionId, rc.getId(), AuditEventType.RECOVERY_CASE_OPENED, "Opened recovery case");

        RiskScore risk = riskDetectionService.assess(transactionId);
        rc.setRecoveryProbability(risk.getEstimatedRecoveryProbability());
        auditService.record(transactionId, rc.getId(), AuditEventType.PROBABILITY_CALCULATED, "score=" + risk.getScore() + " probability=" + risk.getEstimatedRecoveryProbability());

        CustomerHistory history = customerHistoryService.getHistory(t.getCustomer().getId());
        AgentDecision agentDecision = agentService.recommend(t, history, risk);

        rc.setAgentDecision(agentDecision.getDecision());
        rc.setAgentReason(agentDecision.getReason());
        rc.setAgentConfidence(agentDecision.getConfidence());
        
        auditService.record(transactionId, rc.getId(), AuditEventType.AGENT_DECISION, agentDecision.getDecision() + " (confidence=" + agentDecision.getConfidence() + "): " + agentDecision.getReason());

        PolicyDecision policyDecision = policyEngine.evaluate(t, rc, agentDecision);
        rc.setPolicyDecision(policyDecision.isAllowed() ? "ALLOWED" : "BLOCKED");
        rc.setPolicyReason(policyDecision.getReason());

        if (policyDecision.isAllowed()) {
            auditService.record(transactionId, rc.getId(), AuditEventType.POLICY_VALIDATED, "Action allowed by policy");

            RecoveryAction action = agentDecision.getDecision();
            rc.setLastAction(action.name());
            rc.setLastActionAt(Instant.now());

            if (action == RecoveryAction.RETRY) {
                int nextAttempt = rc.getRetryCount() + 1;
                SimulationResult simResult = paymentSimulator.simulate(t, nextAttempt);
                rc.setRetryCount(nextAttempt);
                
                PaymentAttempt attempt = PaymentAttempt.builder()
                        .transactionId(t.getId())
                        .attemptNumber(nextAttempt)
                        .outcome(simResult.getOutcome())
                        .failureReason(simResult.getOutcome() == SimulationOutcome.FAILED ? t.getFailureReason() : null)
                        .attemptedAt(simResult.getSimulatedAt())
                        .resolvedAt(simResult.getSimulatedAt())
                        .build();
                paymentAttemptRepository.save(attempt);

                if (simResult.getOutcome() == SimulationOutcome.SUCCESS) {
                    t.setStatus(TransactionStatus.RECOVERED);
                    t.setSettledAt(simResult.getSimulatedAt());
                    rc.setStatus(RecoveryCaseStatus.RECOVERED);
                } else {
                    t.setStatus(TransactionStatus.FAILED);
                    rc.setStatus(RecoveryCaseStatus.FAILED); 
                }
                transactionRepository.save(t);
                
                auditService.record(transactionId, rc.getId(), AuditEventType.ACTION_EXECUTED, "Executed RETRY");
                auditService.record(transactionId, rc.getId(), AuditEventType.OUTCOME_RECORDED, "Retry outcome: " + simResult.getOutcome());
            } else if (action == RecoveryAction.NOTIFY) {
                rc.setStatus(RecoveryCaseStatus.IN_PROGRESS);
                auditService.record(transactionId, rc.getId(), AuditEventType.ACTION_EXECUTED, "Executed NOTIFY");
                auditService.record(transactionId, rc.getId(), AuditEventType.OUTCOME_RECORDED, "Notification sent");
            } else if (action == RecoveryAction.ESCALATE) {
                rc.setStatus(RecoveryCaseStatus.ESCALATED);
                t.setStatus(TransactionStatus.ESCALATED);
                transactionRepository.save(t);
                auditService.record(transactionId, rc.getId(), AuditEventType.ACTION_EXECUTED, "Executed ESCALATE");
                auditService.record(transactionId, rc.getId(), AuditEventType.HUMAN_ESCALATED, "Escalated to human agent");
            } else if (action == RecoveryAction.IGNORE) {
                rc.setStatus(RecoveryCaseStatus.IGNORED);
                t.setStatus(TransactionStatus.IGNORED);
                transactionRepository.save(t);
                auditService.record(transactionId, rc.getId(), AuditEventType.ACTION_EXECUTED, "Executed IGNORE");
                auditService.record(transactionId, rc.getId(), AuditEventType.OUTCOME_RECORDED, "Case ignored");
            }

        } else {
            auditService.record(transactionId, rc.getId(), AuditEventType.POLICY_BLOCKED, "Action blocked by policy: " + String.join(", ", policyDecision.getViolations()));
            if (agentDecision.getRequiresHuman() != null && agentDecision.getRequiresHuman()) {
                rc.setStatus(RecoveryCaseStatus.ESCALATED);
                t.setStatus(TransactionStatus.ESCALATED);
                auditService.record(transactionId, rc.getId(), AuditEventType.HUMAN_ESCALATED, "Escalated due to policy block");
            } else {
                rc.setStatus(RecoveryCaseStatus.IGNORED);
                t.setStatus(TransactionStatus.IGNORED);
            }
            transactionRepository.save(t);
        }

        if (rc.getStatus() == RecoveryCaseStatus.RECOVERED || rc.getStatus() == RecoveryCaseStatus.FAILED || rc.getStatus() == RecoveryCaseStatus.ESCALATED || rc.getStatus() == RecoveryCaseStatus.IGNORED) {
            rc.setClosedAt(Instant.now());
            auditService.record(transactionId, rc.getId(), AuditEventType.RECOVERY_CASE_CLOSED, "Closed case with status: " + rc.getStatus());
        }

        return recoveryCaseRepository.save(rc);
    }
}
