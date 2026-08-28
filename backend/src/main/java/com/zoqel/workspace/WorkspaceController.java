package com.zoqel.workspace;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor

public class WorkspaceController {
    
    private final WorkspaceService workspaceService;
    private final CurrentUserService currentUserService;
    
    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(@RequestBody CreateWorkspaceRequest req) {
        if (currentUserService.getCurrentUser().getWorkspaceId() != null) { return ResponseEntity.badRequest().build(); } Workspace ws = workspaceService.createWorkspace(req.getName(), req.getBusinessType(), currentUserService.getAuthenticatedUserId());
        return ResponseEntity.ok(ws);
    }
    
    @GetMapping("/me")
    public ResponseEntity<Workspace> getWorkspace() {
        return ResponseEntity.ok(workspaceService.getWorkspace(currentUserService.getCurrentWorkspaceId()));
    }
    
    @Data
    static class CreateWorkspaceRequest {
        private String name;
        private String businessType;
    }
}


