package com.zoqel.customer;

import com.zoqel.transaction.Transaction;
import com.zoqel.transaction.TransactionRepository;
import com.zoqel.transaction.TransactionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerHistoryService {

    private final TransactionRepository transactionRepository;

    public CustomerHistory getHistory(String customerId, String workspaceId) {
        List<Transaction> transactions = transactionRepository.findByCustomerIdAndWorkspaceId(customerId, workspaceId);
        
        int total = transactions.size();
        int successful = 0;
        int failed = 0;
        long totalAmount = 0;
        Transaction lastSuccess = null;
        Transaction lastFail = null;

        for (Transaction t : transactions) {
            totalAmount += t.getAmountPaise();

            if (t.getStatus() == TransactionStatus.SUCCESS || t.getStatus() == TransactionStatus.RECOVERED) {
                successful++;
                if (lastSuccess == null || t.getInitiatedAt().isAfter(lastSuccess.getInitiatedAt())) {
                    lastSuccess = t;
                }
            } else if (t.getStatus() == TransactionStatus.FAILED) {
                // Only count genuine payment failures — NOT IGNORED or ESCALATED.
                // IGNORED = AI correctly determined not recoverable (e.g. insufficient funds).
                // ESCALATED = AI correctly routed to human review.
                // Counting those as "failed payments" inflates the failure count and causes the
                // PolicyEngine to block all future retries for this customer.
                failed++;
                if (lastFail == null || t.getInitiatedAt().isAfter(lastFail.getInitiatedAt())) {
                    lastFail = t;
                }
            }
        }

        // Success rate = successful / (successful + genuinely failed). Pending/Ignored/Escalated are excluded.
        int ratedTotal = successful + failed;
        double rate = ratedTotal > 0 ? (double) successful / ratedTotal : 0.0;

        return CustomerHistory.builder()
                .customerId(customerId)
                .totalTransactions(total)
                .successfulPayments(successful)
                .failedPayments(failed)
                .successRate(rate)
                .totalAmountPaise(totalAmount)
                .lastPaymentAt(lastSuccess != null ? lastSuccess.getInitiatedAt() : null)
                .lastFailureAt(lastFail != null ? lastFail.getInitiatedAt() : null)
                .build();
    }
}

