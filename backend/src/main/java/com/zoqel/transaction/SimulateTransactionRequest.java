package com.zoqel.transaction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulateTransactionRequest {

    @NotBlank
    private String customerId;

    @NotNull
    @Positive
    private Long amountPaise;

    private FailureReason failureReason;
    private PaymentMethod paymentMethod;
}
