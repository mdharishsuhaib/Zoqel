package com.zoqel.agent;

import com.zoqel.customer.CustomerHistory;
import com.zoqel.customer.CustomerHistoryService;
import com.zoqel.exception.NotFoundException;
import com.zoqel.risk.RiskDetectionService;
import com.zoqel.risk.RiskScore;
import com.zoqel.transaction.Transaction;
import com.zoqel.transaction.TransactionRepository;
import com.zoqel.workspace.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {

    private final CurrentUserService currentUserService;

    private final AgentService agentService;
    private final TransactionRepository transactionRepository;
    private final CustomerHistoryService customerHistoryService;
    private final RiskDetectionService riskDetectionService;

    @PostMapping("/recommend/{transactionId}")
    public AgentDecision recommend(@PathVariable String transactionId) {
        Transaction t = transactionRepository.findByIdAndWorkspaceId(transactionId, currentUserService.getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        CustomerHistory history = customerHistoryService.getHistory(t.getCustomer().getId(), currentUserService.getCurrentWorkspaceId());
        RiskScore risk = riskDetectionService.assess(transactionId, currentUserService.getCurrentWorkspaceId());

        return agentService.recommend(t, history, risk);
    }
}



