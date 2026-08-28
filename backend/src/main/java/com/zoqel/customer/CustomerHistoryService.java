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
            } else if (t.getStatus() == TransactionStatus.FAILED || t.getStatus() == TransactionStatus.ESCALATED || t.getStatus() == TransactionStatus.IGNORED) {
                failed++;
                if (lastFail == null || t.getInitiatedAt().isAfter(lastFail.getInitiatedAt())) {
                    lastFail = t;
                }
            }
        }

        double rate = total > 0 ? (double) successful / total : 0.0;

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

