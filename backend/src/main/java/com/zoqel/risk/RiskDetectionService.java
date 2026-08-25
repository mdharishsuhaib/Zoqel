package com.zoqel.risk;

import com.zoqel.customer.CustomerHistory;
import com.zoqel.customer.CustomerHistoryService;
import com.zoqel.exception.NotFoundException;
import com.zoqel.transaction.FailureReason;
import com.zoqel.transaction.Transaction;
import com.zoqel.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RiskDetectionService {

    private final TransactionRepository transactionRepository;
    private final CustomerHistoryService customerHistoryService;

    public RiskScore assess(String transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        CustomerHistory history = customerHistoryService.getHistory(t.getCustomer().getId());
        FailureReason reason = t.getFailureReason();

        int score = 50;
        double prob = 0.5;

        if (reason != null) {
            switch (reason) {
                case BANK_TIMEOUT: score = 80; prob = 0.80; break;
                case NETWORK_ERROR: score = 75; prob = 0.75; break;
                case REPEATED_FAILURE: score = 55; prob = 0.15; break;
                case UNKNOWN: score = 50; prob = 0.30; break;
                case INSUFFICIENT_FUNDS: score = 25; prob = 0.05; break;
                case EXPIRED_CARD: score = 35; prob = 0.10; break;
                case DUPLICATE_ATTEMPT: score = 5; prob = 0.0; break;
            }
        }

        if (history.getSuccessRate() > 0.9) score += 10;
        else if (history.getSuccessRate() > 0.7) score += 5;
        else if (history.getSuccessRate() < 0.3) score -= 15;
        else if (history.getSuccessRate() < 0.5) score -= 10;

        if (history.getFailedPayments() >= 3) {
            score -= 10;
        }

        if (t.getAmountPaise() > 5000000) score += 5;
        else if (t.getAmountPaise() < 50000) score -= 5;

        score = Math.max(0, Math.min(100, score));

        String riskLevel = "LOW";
        if (score >= 70) riskLevel = "HIGH";
        else if (score >= 40) riskLevel = "MEDIUM";

        return RiskScore.builder()
                .transactionId(transactionId)
                .score(score)
                .atRisk(score >= 50)
                .riskLevel(riskLevel)
                .primaryReason(reason != null ? reason.name() : "UNKNOWN")
                .estimatedRecoveryProbability(prob)
                .build();
    }
}
