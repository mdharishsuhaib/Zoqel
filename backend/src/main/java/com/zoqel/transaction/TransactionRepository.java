package com.zoqel.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    Page<Transaction> findByStatus(TransactionStatus status, Pageable pageable);
    Page<Transaction> findByCustomerId(String customerId, Pageable pageable);
    List<Transaction> findByCustomerId(String customerId);
    List<Transaction> findByStatus(TransactionStatus status);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = :status")
    long countByStatus(@Param("status") TransactionStatus status);

    @Query("SELECT COALESCE(SUM(t.amountPaise), 0) FROM Transaction t WHERE t.status = :status")
    long sumAmountByStatus(@Param("status") TransactionStatus status);

    @Query("SELECT COALESCE(SUM(t.amountPaise), 0) FROM Transaction t WHERE t.status IN :statuses")
    long sumAmountByStatusIn(@Param("statuses") List<TransactionStatus> statuses);
}
