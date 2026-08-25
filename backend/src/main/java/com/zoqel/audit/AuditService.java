package com.zoqel.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditRepository auditRepository;

    public AuditEvent record(String transactionId, AuditEventType type, String detail) {
        return record(transactionId, null, type, detail);
    }

    public AuditEvent record(String transactionId, String recoveryCaseId, AuditEventType type, String detail) {
        AuditEvent event = AuditEvent.builder()
                .transactionId(transactionId)
                .recoveryCaseId(recoveryCaseId)
                .eventType(type)
                .eventDetail(detail)
                .build();
        return auditRepository.save(event);
    }

    public List<AuditEvent> getTimeline(String transactionId) {
        return auditRepository.findByTransactionIdOrderByOccurredAtAsc(transactionId);
    }

    public Page<AuditEvent> getRecentEvents(Pageable pageable) {
        return auditRepository.findAllByOrderByOccurredAtDesc(pageable);
    }
}
