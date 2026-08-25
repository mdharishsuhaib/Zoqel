package com.zoqel.agent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AgentContext {
    private String transactionId;
    private Long amountPaise;
    private String failureReason;
    private Integer previousSuccessfulPayments;
    private Integer previousFailures;
    private Double successRate;
    private Double recoveryProbability;
    private Integer riskScore;
}
