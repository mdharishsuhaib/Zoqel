package com.zoqel.audit;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "audit_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false)
    private String transactionId;

    @Column(name = "recovery_case_id")
    private String recoveryCaseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private AuditEventType eventType;

    @Column(name = "event_detail")
    private String eventDetail;

    private String metadata;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @PrePersist
    public void prePersist() {
        if (occurredAt == null) {
            occurredAt = Instant.now();
        }
    }
}
