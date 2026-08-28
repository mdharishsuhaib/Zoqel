package com.zoqel.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    org.springframework.data.domain.Page<Customer> findByWorkspaceId(String workspaceId, org.springframework.data.domain.Pageable pageable);
    Optional<Customer> findByEmailAndWorkspaceId(String email, String workspaceId);
    Optional<Customer> findByIdAndWorkspaceId(String id, String workspaceId);
}

