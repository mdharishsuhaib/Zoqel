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

        // Seed default policy rules for the new workspace
        policyRepository.saveAll(List.of(
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("max_auto_amount_paise").ruleValue("500000").description("Maximum transaction amount allowed for autonomous recovery").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("min_recovery_confidence").ruleValue("0.75").description("Minimum AI confidence required to execute recovery").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("max_retries_per_transaction").ruleValue("3").description("Maximum number of autonomous retry attempts per transaction").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("require_human_for_repeated_failure").ruleValue("true").description("Escalate if the same failure reason occurs consecutively").build(),
            PolicyRule.builder().workspaceId(ws.getId()).ruleKey("auto_recovery_enabled").ruleValue("false").description("Master switch for autonomous recovery actions").build()
        ));
        
        return ws;
    }
    
    public Workspace getWorkspace(String id) {
        return workspaceRepository.findById(id).orElseThrow(() -> new RuntimeException("Workspace not found"));
    }
}

