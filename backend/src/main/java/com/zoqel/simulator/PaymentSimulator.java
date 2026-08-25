package com.zoqel.simulator;

import com.zoqel.transaction.FailureReason;
import com.zoqel.transaction.Transaction;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Random;

@Service
public class PaymentSimulator {

    public SimulationResult simulate(Transaction transaction, int attemptNumber) {
        long seed = transaction.getSimulatorSeed() + attemptNumber * 31337L;
        Random random = new Random(seed);
        double roll = random.nextDouble();

        boolean success = false;
        FailureReason reason = transaction.getFailureReason();

        if (reason == null) {
            success = roll < 0.50;
        } else {
            switch (reason) {
                case BANK_TIMEOUT:
                    success = roll < 0.80;
                    break;
                case NETWORK_ERROR:
                    success = roll < 0.75;
                    break;
                case INSUFFICIENT_FUNDS:
                    success = roll < 0.05;
                    break;
                case EXPIRED_CARD:
                    success = roll < 0.10;
                    break;
                case DUPLICATE_ATTEMPT:
                    success = false;
                    break;
                case REPEATED_FAILURE:
                    success = roll < 0.15;
                    break;
                case UNKNOWN:
                    success = roll < 0.30;
                    break;
                default:
                    success = roll < 0.50;
            }
        }

        SimulationOutcome outcome = success ? SimulationOutcome.SUCCESS : SimulationOutcome.FAILED;

        return SimulationResult.builder()
                .transactionId(transaction.getId())
                .outcome(outcome)
                .attemptNumber(attemptNumber)
                .simulatedAt(Instant.now())
                .message(success ? "Payment succeeded" : "Payment failed again")
                .build();
    }
}
