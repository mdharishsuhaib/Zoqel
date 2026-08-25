package com.zoqel.recovery;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RecoveryCaseRepository extends JpaRepository<RecoveryCase, String> {
    Optional<RecoveryCase> findByTransactionId(String transactionId);
    List<RecoveryCase> findByStatus(RecoveryCaseStatus status);
    long countByStatus(RecoveryCaseStatus status);
}
