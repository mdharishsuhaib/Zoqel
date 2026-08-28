package com.zoqel.policy;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "policy_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyRule {

    @Column(name = "workspace_id")
    private String workspaceId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_key", unique = true, nullable = false)
    private String ruleKey;

    @Column(name = "rule_value", nullable = false)
    private String ruleValue;

    private String description;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
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

