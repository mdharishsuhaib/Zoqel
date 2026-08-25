package com.zoqel.agent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AgentDecision {
    private RecoveryAction decision;
    private String reason;
    private Double confidence;
    private Boolean requiresHuman;
}
