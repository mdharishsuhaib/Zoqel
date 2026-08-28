package com.zoqel.workspace;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.zoqel.auth.AppUserRepository;
import com.zoqel.auth.AppUser;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final AppUserRepository userRepository;

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
        
        return ws;
    }
    
    public Workspace getWorkspace(String id) {
        return workspaceRepository.findById(id).orElseThrow(() -> new RuntimeException("Workspace not found"));
    }
}

