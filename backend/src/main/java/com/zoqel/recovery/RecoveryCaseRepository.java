package com.zoqel.recovery;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RecoveryCaseRepository extends JpaRepository<RecoveryCase, String> {
    org.springframework.data.domain.Page<RecoveryCase> findByWorkspaceId(String workspaceId, org.springframework.data.domain.Pageable pageable);
    java.util.List<RecoveryCase> findByWorkspaceId(String workspaceId);
    Optional<RecoveryCase> findByIdAndWorkspaceId(String id, String workspaceId);
    Optional<RecoveryCase> findByTransactionIdAndWorkspaceId(String transactionId, String workspaceId);
    List<RecoveryCase> findByStatusAndWorkspaceId(RecoveryCaseStatus status, String workspaceId);
    long countByStatusAndWorkspaceId(RecoveryCaseStatus status, String workspaceId);
    long countByWorkspaceId(String workspaceId);
}


