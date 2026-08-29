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

    // Runs every 10 seconds to generate a live transaction per workspace, starting 30s after boot
    @Scheduled(initialDelay = 30000, fixedRate = 10000)
    public void generateLiveTransaction() {
        if (!enabled) return;

        List<Customer> allCustomers = customerRepository.findAll();
        if (allCustomers.isEmpty()) return;

        // Group customers by workspace
        java.util.Map<String, List<Customer>> customersByWorkspace = allCustomers.stream()
            .collect(java.util.stream.Collectors.groupingBy(Customer::getWorkspaceId));

        for (List<Customer> workspaceCustomers : customersByWorkspace.values()) {
            if (workspaceCustomers.isEmpty()) continue;

            Customer randomCustomer = workspaceCustomers.get(ThreadLocalRandom.current().nextInt(workspaceCustomers.size()));
            
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
                log.info("Live data generated for workspace {}: FAILED transaction {}", randomCustomer.getWorkspaceId(), transaction.getId());
                
                // Immediately run the AI agent on it!
                recoveryCaseService.process(transaction.getId(), randomCustomer.getWorkspaceId());
            } catch (Exception e) {
                log.error("Failed to process live transaction for workspace {}", randomCustomer.getWorkspaceId(), e);
            }
        }
    }
}

