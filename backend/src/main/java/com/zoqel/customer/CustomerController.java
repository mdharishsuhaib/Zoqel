package com.zoqel.customer;

import com.zoqel.exception.NotFoundException;
import com.zoqel.workspace.CurrentUserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CurrentUserService currentUserService;
    private final CustomerRepository customerRepository;
    private final CustomerHistoryService customerHistoryService;

    @PostMapping
    public Customer createCustomer(@RequestBody CreateCustomerRequest req) {
        Customer c = Customer.builder()
            .name(req.getName())
            .email(req.getEmail())
            .phone(req.getPhone())
            .riskTier(RiskTier.LOW)
            .joinedAt(java.time.Instant.now())
            .workspaceId(currentUserService.getCurrentWorkspaceId())
            .build();
        return customerRepository.save(c);
    }

    @GetMapping
    public Page<Customer> getAllCustomers(Pageable pageable) {
        return customerRepository.findByWorkspaceId(currentUserService.getCurrentWorkspaceId(), pageable);
    }

    @GetMapping("/{id}")
    public Customer getCustomer(@PathVariable String id) {
        return customerRepository.findByIdAndWorkspaceId(id, currentUserService.getCurrentWorkspaceId())
                .orElseThrow(() -> new NotFoundException("Customer not found with id: " + id));
    }

    @GetMapping("/{id}/history")
    public CustomerHistory getCustomerHistory(@PathVariable String id) {
        if (customerRepository.findByIdAndWorkspaceId(id, currentUserService.getCurrentWorkspaceId()).isEmpty()) {
            throw new NotFoundException("Customer not found with id: " + id);
        }
        return customerHistoryService.getHistory(id, currentUserService.getCurrentWorkspaceId());
    }

    @Data
    static class CreateCustomerRequest {
        private String name;
        private String email;
        private String phone;
    }
}
