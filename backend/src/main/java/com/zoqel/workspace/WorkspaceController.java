package com.zoqel.workspace;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkspaceController {
    
    private final WorkspaceService workspaceService;
    
    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(@RequestBody CreateWorkspaceRequest req, Authentication auth) {
        // auth.getName() contains the userId from JWT
        Workspace ws = workspaceService.createWorkspace(req.getName(), req.getBusinessType(), auth.getName());
        // TODO: Update AppUser with the new workspace_id
        return ResponseEntity.ok(ws);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Workspace> getWorkspace(@PathVariable String id) {
        return ResponseEntity.ok(workspaceService.getWorkspace(id));
    }
    
    @Data
    static class CreateWorkspaceRequest {
        private String name;
        private String businessType;
    }
}

