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
    private final org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    public RecoveryCase process(String transactionId, String workspaceId) {
        Transaction t = transactionRepository.findByIdAndWorkspaceId(transactionId, workspaceId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        // Check idempotency FIRST — if a closed case already exists, return it without re-processing.
        // This must come before the transaction status check because after a successful recovery
        // the transaction status changes to RECOVERED, and a naive second call would throw 500.
        RecoveryCase existingRc = recoveryCaseRepository.findByTransactionIdAndWorkspaceId(transactionId, workspaceId)
                .orElse(null);
        if (existingRc != null && (
                existingRc.getStatus() == RecoveryCaseStatus.RECOVERED ||
                existingRc.getStatus() == RecoveryCaseStatus.FAILED ||
                existingRc.getStatus() == RecoveryCaseStatus.ESCALATED ||
                existingRc.getStatus() == RecoveryCaseStatus.IGNORED)) {
            return existingRc;
        }

        if (t.getStatus() != TransactionStatus.FAILED) {
            throw new IllegalStateException("Can only process FAILED transactions");
        }

        RecoveryCase initialRc = (existingRc != null) ? existingRc :
                RecoveryCase.builder().transactionId(transactionId).workspaceId(workspaceId).build();

        initialRc.setStatus(RecoveryCaseStatus.IN_PROGRESS);
        final RecoveryCase rc = recoveryCaseRepository.save(initialRc);

        auditService.record(transactionId, workspaceId, AuditEventType.RECOVERY_CASE_OPENED, "Opened recovery case");

        RiskScore risk = riskDetectionService.assess(transactionId, workspaceId);
        rc.setRecoveryProbability(risk.getEstimatedRecoveryProbability());
        auditService.record(transactionId, workspaceId, AuditEventType.PROBABILITY_CALCULATED, "score=" + risk.getScore() + " probability=" + risk.getEstimatedRecoveryProbability());

        CustomerHistory history = customerHistoryService.getHistory(t.getCustomer().getId(), workspaceId);
        
        // AI Call (Slow, outside transaction)
        AgentDecision agentDecision = agentService.recommend(t, history, risk);
        
        // Policy Check
        PolicyDecision policyDecision = policyEngine.evaluate(t, rc, agentDecision, workspaceId);
        
        // Prepare immutable variables for the lambda
        final boolean isAllowed = policyDecision.isAllowed();
        final RecoveryAction recommendedAction = agentDecision.getDecision();
        
        final SimulationResult simResult;
        final int nextAttempt;
        if (isAllowed && recommendedAction == RecoveryAction.RETRY) {
            nextAttempt = rc.getRetryCount() + 1;
            simResult = paymentSimulator.simulate(t, nextAttempt);
        } else {
            nextAttempt = rc.getRetryCount();
            simResult = null;
        }

        // Final Persistence (Short, inside transaction)
        return transactionTemplate.execute(status -> {
            rc.setAgentDecision(agentDecision.getDecision());
            rc.setAgentReason(agentDecision.getReason());
            rc.setAgentConfidence(agentDecision.getConfidence());
            
            auditService.record(transactionId, workspaceId, AuditEventType.AGENT_DECISION, agentDecision.getDecision() + " (confidence=" + agentDecision.getConfidence() + "): " + agentDecision.getReason());

            rc.setPolicyDecision(isAllowed ? "ALLOWED" : "BLOCKED");
            rc.setPolicyReason(policyDecision.getReason());

            if (isAllowed) {
                auditService.record(transactionId, workspaceId, AuditEventType.POLICY_VALIDATED, "Action allowed by policy");

                rc.setLastAction(recommendedAction.name());
                rc.setLastActionAt(Instant.now());

                if (recommendedAction == RecoveryAction.RETRY) {
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
                    
                    auditService.record(transactionId, workspaceId, AuditEventType.ACTION_EXECUTED, "Executed RETRY");
                    auditService.record(transactionId, workspaceId, AuditEventType.OUTCOME_RECORDED, "Retry outcome: " + simResult.getOutcome());
                } else if (recommendedAction == RecoveryAction.NOTIFY) {
                    rc.setStatus(RecoveryCaseStatus.IN_PROGRESS);
                    auditService.record(transactionId, workspaceId, AuditEventType.ACTION_EXECUTED, "Executed NOTIFY");
                    auditService.record(transactionId, workspaceId, AuditEventType.OUTCOME_RECORDED, "Notification sent");
                } else if (recommendedAction == RecoveryAction.ESCALATE) {
                    rc.setStatus(RecoveryCaseStatus.ESCALATED);
                    t.setStatus(TransactionStatus.ESCALATED);
                    transactionRepository.save(t);
                    auditService.record(transactionId, workspaceId, AuditEventType.ACTION_EXECUTED, "Executed ESCALATE");
                    auditService.record(transactionId, workspaceId, AuditEventType.HUMAN_ESCALATED, "Escalated to human agent");
                } else if (recommendedAction == RecoveryAction.IGNORE) {
                    rc.setStatus(RecoveryCaseStatus.IGNORED);
                    t.setStatus(TransactionStatus.IGNORED);
                    transactionRepository.save(t);
                    auditService.record(transactionId, workspaceId, AuditEventType.ACTION_EXECUTED, "Executed IGNORE");
                    auditService.record(transactionId, workspaceId, AuditEventType.OUTCOME_RECORDED, "Case ignored");
                }

            } else {
                auditService.record(transactionId, workspaceId, AuditEventType.POLICY_BLOCKED, "Action blocked by policy: " + String.join(", ", policyDecision.getViolations()));
                if (agentDecision.getRequiresHuman() != null && agentDecision.getRequiresHuman()) {
                    rc.setStatus(RecoveryCaseStatus.ESCALATED);
                    t.setStatus(TransactionStatus.ESCALATED);
                    auditService.record(transactionId, workspaceId, AuditEventType.HUMAN_ESCALATED, "Escalated due to policy block");
                } else {
                    rc.setStatus(RecoveryCaseStatus.IGNORED);
                    t.setStatus(TransactionStatus.IGNORED);
                }
                transactionRepository.save(t);
            }

            if (rc.getStatus() == RecoveryCaseStatus.RECOVERED || rc.getStatus() == RecoveryCaseStatus.FAILED || rc.getStatus() == RecoveryCaseStatus.ESCALATED || rc.getStatus() == RecoveryCaseStatus.IGNORED) {
                rc.setClosedAt(Instant.now());
                auditService.record(transactionId, workspaceId, AuditEventType.RECOVERY_CASE_CLOSED, "Closed case with status: " + rc.getStatus());
            }

            RecoveryCase result = recoveryCaseRepository.save(rc);
            return result;
        });
    }
}






