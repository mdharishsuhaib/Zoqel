package com.zoqel.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardMetrics {
    private long totalTransactionsAnalyzed;
    private long failedTransactions;
    private long revenueAtRiskPaise;
    private long recoverableRevenuePaise;
    private long revenueRecoveredPaise;
    private double recoveryRate;
    private long recoveryCandidates;
    private long interventionsExecuted;
    private long successfulRecoveries;
    private long humanEscalations;
    private long blockedActions;
    private long ignoredCases;
}
