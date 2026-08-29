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
            new PolicyRule(UUID.randomUUID().toString(), ws.getId(), "max_auto_amount_paise", "500000", "Maximum transaction amount allowed for autonomous recovery"),
            new PolicyRule(UUID.randomUUID().toString(), ws.getId(), "min_recovery_confidence", "0.75", "Minimum AI confidence required to execute recovery"),
            new PolicyRule(UUID.randomUUID().toString(), ws.getId(), "max_retries_per_transaction", "3", "Maximum number of autonomous retry attempts per transaction"),
            new PolicyRule(UUID.randomUUID().toString(), ws.getId(), "require_human_for_repeated_failure", "true", "Escalate if the same failure reason occurs consecutively"),
            new PolicyRule(UUID.randomUUID().toString(), ws.getId(), "auto_recovery_enabled", "false", "Master switch for autonomous recovery actions")
        ));
        
        return ws;
    }
    
    public Workspace getWorkspace(String id) {
        return workspaceRepository.findById(id).orElseThrow(() -> new RuntimeException("Workspace not found"));
    }
}

