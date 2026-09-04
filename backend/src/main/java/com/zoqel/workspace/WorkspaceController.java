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
    
    /**
     * Idempotent workspace creation.
     * - If the current user already has a workspace, return it (200) instead of 400.
     *   This is safe because a lost network response could cause the client to retry.
     * - If name is blank after trimming, reject with 400.
     */
    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(@RequestBody CreateWorkspaceRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String existingWorkspaceId = currentUserService.getCurrentUser().getWorkspaceId();
        if (existingWorkspaceId != null) {
            // Idempotent: return the existing workspace instead of erroring out.
            // This handles the case where the client retried after a lost response.
            try {
                return ResponseEntity.ok(workspaceService.getWorkspace(existingWorkspaceId));
            } catch (Exception e) {
                // Workspace record missing despite user pointing to it — fall through to create
            }
        }

        Workspace ws = workspaceService.createWorkspace(
            req.getName().trim(),
            req.getBusinessType(),
            currentUserService.getAuthenticatedUserId()
        );
        return ResponseEntity.ok(ws);
    }
    
    @GetMapping("/me")
    public ResponseEntity<Workspace> getWorkspace() {
        String wid = currentUserService.getCurrentUser().getWorkspaceId();
        if (wid == null) {
            // Explicit 404 so the frontend can distinguish "no workspace" from server errors
            return ResponseEntity.notFound().build();
        }
        try {
            return ResponseEntity.ok(workspaceService.getWorkspace(wid));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @Data
    static class CreateWorkspaceRequest {
        private String name;
        private String businessType;
    }
}
