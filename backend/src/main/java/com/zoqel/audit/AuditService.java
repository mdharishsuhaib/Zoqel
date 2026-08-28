package com.zoqel.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditRepository auditRepository;

    public void record(String transactionId, String workspaceId, AuditEventType type, String description) {
        AuditEvent event = AuditEvent.builder()
                .transactionId(transactionId)
                .workspaceId(workspaceId)
                .eventType(type)
                .description(description)
                .occurredAt(Instant.now())
                .build();
        auditRepository.save(event);
    }

    public List<AuditEvent> getHistoryForTransaction(String transactionId, String workspaceId) {
        return auditRepository.findByTransactionIdAndWorkspaceIdOrderByOccurredAtAsc(transactionId, workspaceId);
    }

    public Page<AuditEvent> getRecentEvents(String workspaceId, Pageable pageable) {
        return auditRepository.findAllByWorkspaceIdOrderByOccurredAtDesc(workspaceId, pageable);
    }
}
