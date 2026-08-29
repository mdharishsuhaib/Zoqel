package com.zoqel.dashboard;

import com.zoqel.recovery.RecoveryCaseRepository;
import com.zoqel.recovery.RecoveryCaseStatus;
import com.zoqel.transaction.TransactionRepository;
import com.zoqel.transaction.TransactionStatus;
import com.zoqel.workspace.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final CurrentUserService currentUserService;

    private final TransactionRepository transactionRepository;
    private final RecoveryCaseRepository recoveryCaseRepository;

    @GetMapping("/metrics")
    public DashboardMetrics getMetrics() {
        long totalTx = transactionRepository.countByWorkspaceId(currentUserService.getCurrentWorkspaceId());
        long failedTx = transactionRepository.countByStatusAndWorkspaceId(TransactionStatus.FAILED, currentUserService.getCurrentWorkspaceId())
                + transactionRepository.countByStatusAndWorkspaceId(TransactionStatus.RECOVERED, currentUserService.getCurrentWorkspaceId())
                + transactionRepository.countByStatusAndWorkspaceId(TransactionStatus.ESCALATED, currentUserService.getCurrentWorkspaceId())
                + transactionRepository.countByStatusAndWorkspaceId(TransactionStatus.IGNORED, currentUserService.getCurrentWorkspaceId());

        long revenueAtRisk = transactionRepository.sumAmountByStatusInAndWorkspaceId(List.of(
                TransactionStatus.FAILED, TransactionStatus.ESCALATED, TransactionStatus.IGNORED, TransactionStatus.RECOVERED
        ), currentUserService.getCurrentWorkspaceId());
        
        long revenueRecovered = transactionRepository.sumAmountByStatusAndWorkspaceId(TransactionStatus.RECOVERED, currentUserService.getCurrentWorkspaceId());
        long failedOnlyAmount = transactionRepository.sumAmountByStatusAndWorkspaceId(TransactionStatus.FAILED, currentUserService.getCurrentWorkspaceId());
        long recoverableRevenue = revenueRecovered + (long)(failedOnlyAmount * 0.70);

        long recoveryCandidates = recoveryCaseRepository.countByWorkspaceId(currentUserService.getCurrentWorkspaceId());
        long successfulRecoveries = recoveryCaseRepository.countByStatusAndWorkspaceId(RecoveryCaseStatus.RECOVERED, currentUserService.getCurrentWorkspaceId());
        double recoveryRate = recoveryCandidates > 0 ? ((double) successfulRecoveries / recoveryCandidates) * 100 : 0.0;

        long interventions = recoveryCaseRepository.countByStatusAndWorkspaceId(RecoveryCaseStatus.IN_PROGRESS, currentUserService.getCurrentWorkspaceId())
                + successfulRecoveries
                + recoveryCaseRepository.countByStatusAndWorkspaceId(RecoveryCaseStatus.FAILED, currentUserService.getCurrentWorkspaceId())
                + recoveryCaseRepository.countByStatusAndWorkspaceId(RecoveryCaseStatus.ESCALATED, currentUserService.getCurrentWorkspaceId())
                + recoveryCaseRepository.countByStatusAndWorkspaceId(RecoveryCaseStatus.IGNORED, currentUserService.getCurrentWorkspaceId());

        long humanEscalations = recoveryCaseRepository.countByStatusAndWorkspaceId(RecoveryCaseStatus.ESCALATED, currentUserService.getCurrentWorkspaceId());
        long ignoredCases = recoveryCaseRepository.countByStatusAndWorkspaceId(RecoveryCaseStatus.IGNORED, currentUserService.getCurrentWorkspaceId());

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
    @GetMapping("/chart")
    public List<java.util.Map<String, Object>> getChartData() {
        String wid = currentUserService.getCurrentWorkspaceId();
        List<com.zoqel.transaction.Transaction> txs = transactionRepository.findByWorkspaceId(wid);
        
        java.util.Map<String, java.util.Map<String, Long>> dailyData = new java.util.TreeMap<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        
        for (int i = 29; i >= 0; i--) {
            String d = today.minusDays(i).format(java.time.format.DateTimeFormatter.ofPattern("MMM d"));
            java.util.Map<String, Long> metrics = new java.util.HashMap<>();
            metrics.put("atRisk", 0L);
            metrics.put("recoverable", 0L);
            metrics.put("recovered", 0L);
            dailyData.put(d, metrics);
        }
        
        for (com.zoqel.transaction.Transaction t : txs) {
            String d = t.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().format(java.time.format.DateTimeFormatter.ofPattern("MMM d"));
            if (dailyData.containsKey(d)) {
                java.util.Map<String, Long> metrics = dailyData.get(d);
                long amount = t.getAmountPaise() / 100;
                
                if (t.getStatus() == com.zoqel.transaction.TransactionStatus.RECOVERED) {
                    metrics.put("recovered", metrics.get("recovered") + amount);
                } else if (t.getStatus() == com.zoqel.transaction.TransactionStatus.FAILED || t.getStatus() == com.zoqel.transaction.TransactionStatus.ESCALATED || t.getStatus() == com.zoqel.transaction.TransactionStatus.IGNORED) {
                    metrics.put("atRisk", metrics.get("atRisk") + amount);
                    metrics.put("recoverable", metrics.get("recoverable") + (long)(amount * 0.7));
                }
            }
        }
        
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (java.util.Map.Entry<String, java.util.Map<String, Long>> entry : dailyData.entrySet()) {
            java.util.Map<String, Object> point = new java.util.HashMap<>();
            point.put("date", entry.getKey());
            point.put("atRisk", entry.getValue().get("atRisk"));
            point.put("recoverable", entry.getValue().get("recoverable"));
            point.put("recovered", entry.getValue().get("recovered"));
            result.add(point);
        }
        return result;
    }
}

