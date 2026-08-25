package com.zoqel.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {
    List<PaymentAttempt> findByTransactionIdOrderByAttemptNumberAsc(String transactionId);
    long countByTransactionId(String transactionId);
}
