package com.zoqel.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerHistory {
    private String customerId;
    private int totalTransactions;
    private int successfulPayments;
    private int failedPayments;
    private double successRate;
    private long totalAmountPaise;
    private Instant lastPaymentAt;
    private Instant lastFailureAt;
}
