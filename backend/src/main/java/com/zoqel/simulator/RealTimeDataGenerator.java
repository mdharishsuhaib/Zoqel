package com.zoqel.simulator;

import com.zoqel.transaction.FailureReason;
import com.zoqel.transaction.PaymentMethod;
import com.zoqel.transaction.SimulateTransactionRequest;
import com.zoqel.transaction.TransactionService;
import com.zoqel.customer.Customer;
import com.zoqel.customer.CustomerRepository;
import com.zoqel.recovery.RecoveryCaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeDataGenerator {

    private final TransactionService transactionService;
    private final CustomerRepository customerRepository;
    private final RecoveryCaseService recoveryCaseService;

    private boolean enabled = true;

    // Runs every 10 seconds to generate a live transaction, starting 30s after boot
    @Scheduled(initialDelay = 30000, fixedRate = 10000)
    public void generateLiveTransaction() {
        if (!enabled) return;
        log.info("RealTimeDataGenerator first execution (or scheduled execution) started");

        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) return;

        Customer randomCustomer = customers.get(ThreadLocalRandom.current().nextInt(customers.size()));
        
        FailureReason[] reasons = FailureReason.values();
        FailureReason reason = reasons[ThreadLocalRandom.current().nextInt(reasons.length)];
        
        long amountPaise = ThreadLocalRandom.current().nextLong(50000, 500000); // 500 to 5000 INR

        SimulateTransactionRequest req = SimulateTransactionRequest.builder()
                .customerId(randomCustomer.getId())
                .amountPaise(amountPaise)
                .failureReason(reason)
                .paymentMethod(PaymentMethod.UPI)
                .build();

        try {
            var transaction = transactionService.simulate(req, randomCustomer.getWorkspaceId());
            log.info("Live data generated: FAILED transaction {}", transaction.getId());
            
            // Immediately run the AI agent on it!
            recoveryCaseService.process(transaction.getId(), randomCustomer.getWorkspaceId());
            log.info("Live AI processing complete for {}", transaction.getId());
        } catch (Exception e) {
            log.error("Failed to process live transaction", e);
        }
    }
}

