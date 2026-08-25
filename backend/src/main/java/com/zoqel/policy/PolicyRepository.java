package com.zoqel.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<PolicyRule, Long> {
    Optional<PolicyRule> findByRuleKey(String ruleKey);
}
