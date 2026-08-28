package com.zoqel.transaction;

import com.zoqel.exception.NotFoundException;
import com.zoqel.workspace.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public Page<Transaction> getTransactions(@RequestParam(required = false) TransactionStatus status, Pageable pageable) {
        String workspaceId = currentUserService.getCurrentWorkspaceId();
        if (status != null) {
            return transactionService.findByStatus(workspaceId, status, pageable);
        }
        return transactionService.findAll(workspaceId, pageable);
    }

    @GetMapping("/{id}")
    public Transaction getTransaction(@PathVariable String id) {
        return transactionService.findById(currentUserService.getCurrentWorkspaceId(), id)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));
    }

    @PostMapping("/simulate")
    public Transaction simulate(@Valid @RequestBody SimulateTransactionRequest req) {
        return transactionService.simulate(req, currentUserService.getCurrentWorkspaceId());
    }
}
