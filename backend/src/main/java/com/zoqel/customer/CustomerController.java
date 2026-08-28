package com.zoqel.customer;

import com.zoqel.exception.NotFoundException;
import com.zoqel.workspace.CurrentUserService;
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
        if (!customerRepository.findByIdAndWorkspaceId(id, currentUserService.getCurrentWorkspaceId()).isPresent()) {
            throw new NotFoundException("Customer not found with id: " + id);
        }
        return customerHistoryService.getHistory(id, currentUserService.getCurrentWorkspaceId());
    }
}

