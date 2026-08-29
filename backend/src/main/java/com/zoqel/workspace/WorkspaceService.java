package com.zoqel.workspace;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.zoqel.auth.AppUserRepository;
import com.zoqel.auth.AppUser;
import com.zoqel.policy.PolicyRule;
import com.zoqel.policy.PolicyRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final AppUserRepository userRepository;
    private final PolicyRepository policyRepository;

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

        // Seed default policy rules for the new workspace (Must match all expected V2 rules + auto switch)
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
        
        return ws;
    }
    
    public Workspace getWorkspace(String id) {
        return workspaceRepository.findById(id).orElseThrow(() -> new RuntimeException("Workspace not found"));
    }
}

