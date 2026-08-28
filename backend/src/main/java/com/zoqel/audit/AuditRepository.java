package com.zoqel.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByTransactionIdAndWorkspaceIdOrderByOccurredAtAsc(String transactionId, String workspaceId);
    List<AuditEvent> findAllByWorkspaceIdOrderByOccurredAtDesc(String workspaceId);
    Page<AuditEvent> findAllByWorkspaceIdOrderByOccurredAtDesc(String workspaceId, Pageable pageable);
}
