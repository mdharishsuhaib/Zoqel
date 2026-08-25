package com.zoqel.agent;

import com.zoqel.customer.CustomerHistory;
import com.zoqel.customer.CustomerHistoryService;
import com.zoqel.exception.NotFoundException;
import com.zoqel.risk.RiskDetectionService;
import com.zoqel.risk.RiskScore;
import com.zoqel.transaction.Transaction;
import com.zoqel.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;
    private final TransactionRepository transactionRepository;
    private final CustomerHistoryService customerHistoryService;
    private final RiskDetectionService riskDetectionService;

    @PostMapping("/recommend/{transactionId}")
    public AgentDecision recommend(@PathVariable String transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        CustomerHistory history = customerHistoryService.getHistory(t.getCustomer().getId());
        RiskScore risk = riskDetectionService.assess(transactionId);

        return agentService.recommend(t, history, risk);
    }
}
