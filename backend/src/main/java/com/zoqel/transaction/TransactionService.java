package com.zoqel.transaction;

import com.zoqel.audit.AuditService;
import com.zoqel.audit.AuditEventType;
import com.zoqel.customer.Customer;
import com.zoqel.customer.CustomerRepository;
import com.zoqel.exception.NotFoundException;
import com.zoqel.simulator.SimulationOutcome;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final AuditService auditService;

    @Transactional
    public Transaction simulate(SimulateTransactionRequest req, String workspaceId) {
        Customer customer = customerRepository.findByIdAndWorkspaceId(req.getCustomerId(), workspaceId)
                .orElseThrow(() -> new NotFoundException("Customer not found"));

        int seed = ThreadLocalRandom.current().nextInt(1000, 999999);
        Instant now = Instant.now();

        Transaction t = Transaction.builder()
                .customer(customer)
                .amountPaise(req.getAmountPaise())
                .status(TransactionStatus.FAILED)
                .failureReason(req.getFailureReason())
                .paymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.UPI)
                .simulatorSeed(seed)
                .initiatedAt(now)
                .workspaceId(workspaceId)
                .build();
        
        t = transactionRepository.save(t);

        PaymentAttempt attempt = PaymentAttempt.builder()
                .transactionId(t.getId())
                .attemptNumber(1)
                .outcome(SimulationOutcome.FAILED)
                .failureReason(req.getFailureReason())
                .attemptedAt(now)
                .resolvedAt(now)
                .build();
        
        paymentAttemptRepository.save(attempt);

        auditService.record(t.getId(), workspaceId, AuditEventType.RISK_DETECTED, "Initial transaction failed with reason: " + req.getFailureReason());

        return t;
    }

    public Page<Transaction> findAll(String workspaceId, Pageable pageable) {
        return transactionRepository.findByWorkspaceId(workspaceId, pageable);
    }

    public Page<Transaction> findByStatus(String workspaceId, TransactionStatus status, Pageable pageable) {
        return transactionRepository.findByStatusAndWorkspaceId(status, workspaceId, pageable);
    }

    public Optional<Transaction> findById(String workspaceId, String id) {
        return transactionRepository.findByIdAndWorkspaceId(id, workspaceId);
    }
}
