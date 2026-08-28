package com.zoqel.audit;

import com.zoqel.workspace.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public Page<AuditEvent> getRecentEvents(Pageable pageable) {
        return auditService.getRecentEvents(currentUserService.getCurrentWorkspaceId(), pageable);
    }
}
