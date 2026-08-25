package com.zoqel.agent;

import com.zoqel.customer.CustomerHistory;
import com.zoqel.risk.RiskScore;
import com.zoqel.transaction.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentGateway agentGateway;

    public AgentDecision recommend(Transaction transaction, CustomerHistory history, RiskScore risk) {
        AgentContext context = AgentContext.builder()
                .transactionId(transaction.getId())
                .amountPaise(transaction.getAmountPaise())
                .failureReason(transaction.getFailureReason() != null ? transaction.getFailureReason().name() : "UNKNOWN")
                .previousSuccessfulPayments(history.getSuccessfulPayments())
                .previousFailures(history.getFailedPayments())
                .successRate(history.getSuccessRate())
                .recoveryProbability(risk.getEstimatedRecoveryProbability())
                .riskScore(risk.getScore())
                .build();

        return agentGateway.recommend(context);
    }
}
