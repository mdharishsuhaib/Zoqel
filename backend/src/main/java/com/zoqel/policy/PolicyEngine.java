package com.zoqel.policy;

import com.zoqel.agent.AgentDecision;
import com.zoqel.agent.RecoveryAction;
import com.zoqel.customer.CustomerHistory;
import com.zoqel.customer.CustomerHistoryService;
import com.zoqel.recovery.RecoveryCase;
import com.zoqel.transaction.FailureReason;
import com.zoqel.transaction.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PolicyEngine {

    private final PolicyRepository policyRepository;
    private final CustomerHistoryService customerHistoryService;

    public PolicyDecision evaluate(Transaction transaction, RecoveryCase recoveryCase, AgentDecision agentDecision) {
        List<String> violations = new ArrayList<>();

        if (recoveryCase.getRetryCount() >= getIntRule("max_retries_per_transaction", 1) && agentDecision.getDecision() == RecoveryAction.RETRY) {
            violations.add("Retry limit exceeded");
        }

        if (agentDecision.getConfidence() != null && agentDecision.getConfidence() < getDoubleRule("min_recovery_confidence", 0.75) 
            && agentDecision.getDecision() != RecoveryAction.ESCALATE && agentDecision.getDecision() != RecoveryAction.IGNORE) {
            violations.add("Confidence below threshold");
        }

        if (transaction.getAmountPaise() > getLongRule("max_auto_amount_paise", 1000000) && (agentDecision.getRequiresHuman() == null || !agentDecision.getRequiresHuman())) {
            violations.add("Amount exceeds automatic limit");
        }

        if (transaction.getFailureReason() == FailureReason.INSUFFICIENT_FUNDS 
            && getBoolRule("block_insufficient_funds_retry", true) 
            && agentDecision.getDecision() == RecoveryAction.RETRY) {
            violations.add("Cannot automatically retry insufficient funds");
        }

        if (transaction.getFailureReason() == FailureReason.DUPLICATE_ATTEMPT 
            && getBoolRule("block_duplicate_attempt_retry", true) 
            && agentDecision.getDecision() == RecoveryAction.RETRY) {
            violations.add("Cannot retry duplicate attempt");
        }

        CustomerHistory history = customerHistoryService.getHistory(transaction.getCustomer().getId());
        if (history.getFailedPayments() >= 3 
            && getBoolRule("require_human_for_repeated_failure", true) 
            && (agentDecision.getRequiresHuman() == null || !agentDecision.getRequiresHuman())) {
            violations.add("High failure count requires human review");
        }

        // Simplistic assumption for interventions for now
        int totalInterventions = recoveryCase.getRetryCount(); // plus notifications if counted
        if (totalInterventions >= getIntRule("max_interventions_per_case", 2)) {
            violations.add("Max interventions per case exceeded");
        }

        boolean allowed = violations.isEmpty();
        return PolicyDecision.builder()
                .allowed(allowed)
                .reason(allowed ? "Policy checks passed" : "Policy violations found")
                .violations(violations)
                .build();
    }

    private int getIntRule(String key, int defaultValue) {
        return policyRepository.findByRuleKey(key).map(r -> Integer.parseInt(r.getRuleValue())).orElse(defaultValue);
    }

    private double getDoubleRule(String key, double defaultValue) {
        return policyRepository.findByRuleKey(key).map(r -> Double.parseDouble(r.getRuleValue())).orElse(defaultValue);
    }

    private boolean getBoolRule(String key, boolean defaultValue) {
        return policyRepository.findByRuleKey(key).map(r -> Boolean.parseBoolean(r.getRuleValue())).orElse(defaultValue);
    }

    private long getLongRule(String key, long defaultValue) {
        return policyRepository.findByRuleKey(key).map(r -> Long.parseLong(r.getRuleValue())).orElse(defaultValue);
    }
}
