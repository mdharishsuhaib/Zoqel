package com.zoqel.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface PolicyRepository extends JpaRepository<PolicyRule, Long> {
    List<PolicyRule> findByWorkspaceId(String workspaceId);
    Optional<PolicyRule> findByRuleKeyAndWorkspaceId(String ruleKey, String workspaceId);
}
