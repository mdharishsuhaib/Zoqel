package com.zoqel.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    Optional<Transaction> findByIdAndWorkspaceId(String id, String workspaceId);
    Page<Transaction> findByStatusAndWorkspaceId(TransactionStatus status, String workspaceId, Pageable pageable);
    Page<Transaction> findByCustomerIdAndWorkspaceId(String customerId, String workspaceId, Pageable pageable);
    List<Transaction> findByCustomerIdAndWorkspaceId(String customerId, String workspaceId);
    List<Transaction> findByStatusAndWorkspaceId(TransactionStatus status, String workspaceId);
    Page<Transaction> findByWorkspaceId(String workspaceId, Pageable pageable);
    long countByWorkspaceId(String workspaceId);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = :status AND t.workspaceId = :workspaceId")
    long countByStatusAndWorkspaceId(@Param("status") TransactionStatus status, @Param("workspaceId") String workspaceId);

    @Query("SELECT COALESCE(SUM(t.amountPaise), 0) FROM Transaction t WHERE t.status = :status AND t.workspaceId = :workspaceId")
    long sumAmountByStatusAndWorkspaceId(@Param("status") TransactionStatus status, @Param("workspaceId") String workspaceId);

    @Query("SELECT COALESCE(SUM(t.amountPaise), 0) FROM Transaction t WHERE t.status IN :statuses AND t.workspaceId = :workspaceId")
    long sumAmountByStatusInAndWorkspaceId(@Param("statuses") List<TransactionStatus> statuses, @Param("workspaceId") String workspaceId);
}

