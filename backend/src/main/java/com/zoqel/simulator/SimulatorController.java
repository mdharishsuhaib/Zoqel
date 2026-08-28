package com.zoqel.simulator;

import com.zoqel.audit.AuditService;
import com.zoqel.audit.AuditEventType;
import com.zoqel.exception.NotFoundException;
import com.zoqel.transaction.PaymentAttempt;
import com.zoqel.transaction.PaymentAttemptRepository;
import com.zoqel.transaction.Transaction;
import com.zoqel.transaction.TransactionRepository;
import com.zoqel.transaction.TransactionStatus;
import com.zoqel.workspace.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/simulator")
@RequiredArgsConstructor
public class SimulatorController {

    private final CurrentUserService currentUserService;

    private final PaymentSimulator paymentSimulator;
    private final TransactionRepository transactionRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final AuditService auditService;

    @PostMapping("/retry/{transactionId}")
    public SimulationResult retry(@PathVariable String transactionId) {
        Transaction t = transactionRepository.findByIdAndWorkspaceId(transactionId, currentUserService.getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        long attemptCount = paymentAttemptRepository.countByTransactionId(transactionId);
        int nextAttemptNumber = (int) attemptCount + 1;

        SimulationResult result = paymentSimulator.simulate(t, nextAttemptNumber);

        PaymentAttempt attempt = PaymentAttempt.builder()
                .transactionId(t.getId())
                .attemptNumber(nextAttemptNumber)
                .outcome(result.getOutcome())
                .failureReason(result.getOutcome() == SimulationOutcome.FAILED ? t.getFailureReason() : null)
                .attemptedAt(result.getSimulatedAt())
                .resolvedAt(result.getSimulatedAt())
                .build();
        paymentAttemptRepository.save(attempt);

        if (result.getOutcome() == SimulationOutcome.SUCCESS) {
            t.setStatus(TransactionStatus.RECOVERED);
            t.setSettledAt(result.getSimulatedAt());
        }
        transactionRepository.save(t);

        auditService.record(t.getId(), currentUserService.getCurrentWorkspaceId(), AuditEventType.ACTION_EXECUTED, "Manual retry triggered. Outcome: " + result.getOutcome());

        return result;
    }
}


