package com.zoqel.dashboard;

import com.zoqel.recovery.RecoveryCaseRepository;
import com.zoqel.recovery.RecoveryCaseStatus;
import com.zoqel.transaction.TransactionRepository;
import com.zoqel.transaction.TransactionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final TransactionRepository transactionRepository;
    private final RecoveryCaseRepository recoveryCaseRepository;

    @GetMapping("/metrics")
    public DashboardMetrics getMetrics() {
        long totalTx = transactionRepository.count();
        long failedTx = transactionRepository.countByStatus(TransactionStatus.FAILED)
                + transactionRepository.countByStatus(TransactionStatus.RECOVERED)
                + transactionRepository.countByStatus(TransactionStatus.ESCALATED)
                + transactionRepository.countByStatus(TransactionStatus.IGNORED);

        long revenueAtRisk = transactionRepository.sumAmountByStatusIn(List.of(
                TransactionStatus.FAILED, TransactionStatus.ESCALATED, TransactionStatus.IGNORED, TransactionStatus.RECOVERED
        ));
        
        long revenueRecovered = transactionRepository.sumAmountByStatus(TransactionStatus.RECOVERED);
        long failedOnlyAmount = transactionRepository.sumAmountByStatus(TransactionStatus.FAILED);
        long recoverableRevenue = revenueRecovered + (long)(failedOnlyAmount * 0.70);

        long recoveryCandidates = recoveryCaseRepository.count();
        long successfulRecoveries = recoveryCaseRepository.countByStatus(RecoveryCaseStatus.RECOVERED);
        double recoveryRate = recoveryCandidates > 0 ? ((double) successfulRecoveries / recoveryCandidates) * 100 : 0.0;

        long interventions = recoveryCaseRepository.countByStatus(RecoveryCaseStatus.IN_PROGRESS)
                + successfulRecoveries
                + recoveryCaseRepository.countByStatus(RecoveryCaseStatus.FAILED)
                + recoveryCaseRepository.countByStatus(RecoveryCaseStatus.ESCALATED)
                + recoveryCaseRepository.countByStatus(RecoveryCaseStatus.IGNORED);

        long humanEscalations = recoveryCaseRepository.countByStatus(RecoveryCaseStatus.ESCALATED);
        long ignoredCases = recoveryCaseRepository.countByStatus(RecoveryCaseStatus.IGNORED);

        return DashboardMetrics.builder()
                .totalTransactionsAnalyzed(totalTx)
                .failedTransactions(failedTx)
                .revenueAtRiskPaise(revenueAtRisk)
                .recoverableRevenuePaise(recoverableRevenue)
                .revenueRecoveredPaise(revenueRecovered)
                .recoveryRate(recoveryRate)
                .recoveryCandidates(recoveryCandidates)
                .interventionsExecuted(interventions)
                .successfulRecoveries(successfulRecoveries)
                .humanEscalations(humanEscalations)
                .blockedActions(ignoredCases) // Using ignoredCases for blockedActions as requested
                .ignoredCases(ignoredCases)
                .build();
    }
}
