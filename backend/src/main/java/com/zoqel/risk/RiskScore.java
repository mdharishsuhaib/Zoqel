package com.zoqel.risk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class RiskScore {
    private String transactionId;
    private int score;
    private boolean atRisk;
    private String riskLevel;
    private String primaryReason;
    private double estimatedRecoveryProbability;
}
