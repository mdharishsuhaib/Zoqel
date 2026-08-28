package com.zoqel.transaction;

import com.zoqel.customer.Customer;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Column(name = "workspace_id")
    private String workspaceId;

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "amount_paise", nullable = false)
    private Long amountPaise;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "failure_reason")
    private FailureReason failureReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "simulator_seed", nullable = false)
    private Integer simulatorSeed;

    @Column(name = "initiated_at", nullable = false)
    private Instant initiatedAt;

    @Column(name = "settled_at")
    private Instant settledAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (status == null) {
            status = TransactionStatus.PENDING;
        }
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}

