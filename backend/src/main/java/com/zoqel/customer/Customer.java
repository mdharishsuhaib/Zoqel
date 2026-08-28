package com.zoqel.customer;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Column(name = "workspace_id")
    private String workspaceId;

    @Id
    private String id;

    private String name;
    private String email;
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_tier")
    private RiskTier riskTier;

    @Column(name = "joined_at")
    private Instant joinedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}

