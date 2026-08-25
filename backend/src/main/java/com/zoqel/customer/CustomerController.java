package com.zoqel.customer;

import com.zoqel.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final CustomerHistoryService customerHistoryService;

    @GetMapping
    public Page<Customer> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public Customer getCustomer(@PathVariable String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Customer not found with id: " + id));
    }

    @GetMapping("/{id}/history")
    public CustomerHistory getCustomerHistory(@PathVariable String id) {
        if (!customerRepository.existsById(id)) {
            throw new NotFoundException("Customer not found with id: " + id);
        }
        return customerHistoryService.getHistory(id);
    }
}
