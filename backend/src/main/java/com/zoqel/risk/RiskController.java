package com.zoqel.risk;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskDetectionService riskDetectionService;

    @GetMapping("/{transactionId}")
    public RiskScore getRiskScore(@PathVariable String transactionId) {
        return riskDetectionService.assess(transactionId);
    }
}
