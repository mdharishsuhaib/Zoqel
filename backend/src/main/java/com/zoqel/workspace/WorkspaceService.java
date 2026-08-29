package com.zoqel.workspace;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.zoqel.auth.AppUserRepository;
import com.zoqel.auth.AppUser;
import com.zoqel.policy.PolicyRule;
import com.zoqel.policy.PolicyRepository;
import com.zoqel.customer.Customer;
import com.zoqel.customer.CustomerRepository;
import com.zoqel.customer.RiskTier;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final AppUserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final CustomerRepository customerRepository;

    public Workspace createWorkspace(String name, String businessType, String userId) {
        Workspace ws = Workspace.builder()
            .id(UUID.randomUUID().toString())
            .name(name)
            .businessType(businessType)
            .currency("INR")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        ws = workspaceRepository.save(ws);
        
        AppUser user = userRepository.findById(userId).orElseThrow();
        user.setWorkspaceId(ws.getId());
        userRepository.save(user);

        // Seed default policy rules for the new workspace
        policyRepository.saveAll(List.of(
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("max_retries_per_transaction").ruleValue("1").description("Maximum number of automatic retry attempts per transaction").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("min_recovery_confidence").ruleValue("0.75").description("Minimum agent confidence score required for automatic action").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("max_auto_amount_paise").ruleValue("1000000").description("Maximum transaction amount (paise) for automatic recovery (=INR 10,000)").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("block_insufficient_funds_retry").ruleValue("true").description("Block automatic retry for insufficient_funds failure reason").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("block_duplicate_attempt_retry").ruleValue("true").description("Block automatic retry for duplicate_attempt failure reason").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("require_human_for_repeated_failure").ruleValue("true").description("Escalate to human if customer has 3+ previous failures").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("max_interventions_per_case").ruleValue("2").description("Maximum total interventions (retries + notifications) per recovery case").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("auto_recovery_enabled").ruleValue("false").description("Master switch for autonomous recovery actions").build()
        ));

        // Seed default customers so the simulator works out of the box for real users
        customerRepository.saveAll(List.of(
            Customer.builder().id(UUID.randomUUID().toString()).workspaceId(ws.getId()).name("Acme Corp").email("billing@acme.com").phone("+919876543210").riskTier(RiskTier.LOW).joinedAt(Instant.now()).build(),
            Customer.builder().id(UUID.randomUUID().toString()).workspaceId(ws.getId()).name("Jane Doe").email("jane@example.com").phone("+919876543211").riskTier(RiskTier.MEDIUM).joinedAt(Instant.now()).build(),
            Customer.builder().id(UUID.randomUUID().toString()).workspaceId(ws.getId()).name("Global Tech").email("finance@globaltech.in").phone("+919876543212").riskTier(RiskTier.HIGH).joinedAt(Instant.now()).build()
        ));
        
        return ws;
    }
    
    public Workspace getWorkspace(String id) {
        return workspaceRepository.findById(id).orElseThrow(() -> new RuntimeException("Workspace not found"));
    }
}

