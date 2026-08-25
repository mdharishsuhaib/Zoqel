package com.zoqel.policy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PolicyDecision {
    private boolean allowed;
    private String reason;
    private List<String> violations;
}
