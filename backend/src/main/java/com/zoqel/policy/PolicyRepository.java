package com.zoqel.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<PolicyRule, Long> {
    java.util.List<PolicyRule> findByWorkspaceId(String workspaceId); extends JpaRepository<PolicyRule, Long> {
    Optional<PolicyRule> findByRuleKeyAndWorkspaceId(String ruleKey, String workspaceId);
}

