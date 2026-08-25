package com.zoqel.recovery;

import com.zoqel.agent.RecoveryAction;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recovery_cases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecoveryCase {

    @Id
    private String id;

    @Column(name = "transaction_id", unique = true, nullable = false)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecoveryCaseStatus status;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "agent_decision")
    private RecoveryAction agentDecision;

    @Column(name = "agent_reason")
    private String agentReason;

    @Column(name = "agent_confidence")
    private Double agentConfidence;

    @Column(name = "policy_decision")
    private String policyDecision;

    @Column(name = "policy_reason")
    private String policyReason;

    @Column(name = "recovery_probability")
    private Double recoveryProbability;

    @Column(name = "last_action")
    private String lastAction;

    @Column(name = "last_action_at")
    private Instant lastActionAt;

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

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
        if (openedAt == null) {
            openedAt = Instant.now();
        }
        if (retryCount == null) {
            retryCount = 0;
        }
        if (status == null) {
            status = RecoveryCaseStatus.OPEN;
        }
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
