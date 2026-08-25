package com.zoqel.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/{transactionId}")
    public List<AuditEvent> getTimeline(@PathVariable String transactionId) {
        return auditService.getTimeline(transactionId);
    }

    @GetMapping
    public Page<AuditEvent> getRecentEvents(Pageable pageable) {
        return auditService.getRecentEvents(pageable);
    }
}
