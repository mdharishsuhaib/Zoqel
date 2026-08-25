package com.zoqel.simulator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResult {
    private String transactionId;
    private SimulationOutcome outcome;
    private int attemptNumber;
    private Instant simulatedAt;
    private String message;
}
