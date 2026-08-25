package com.zoqel.transaction;

import com.zoqel.exception.NotFoundException;
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

    @GetMapping
    public Page<Transaction> getTransactions(@RequestParam(required = false) TransactionStatus status, Pageable pageable) {
        if (status != null) {
            return transactionService.findByStatus(status, pageable);
        }
        return transactionService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public Transaction getTransaction(@PathVariable String id) {
        return transactionService.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));
    }

    @PostMapping("/simulate")
    public Transaction simulate(@Valid @RequestBody SimulateTransactionRequest req) {
        return transactionService.simulate(req);
    }
}
