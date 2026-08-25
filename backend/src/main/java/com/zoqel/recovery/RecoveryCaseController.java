package com.zoqel.recovery;

import com.zoqel.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recovery")
@RequiredArgsConstructor
public class RecoveryCaseController {

    private final RecoveryCaseRepository recoveryCaseRepository;
    private final RecoveryCaseService recoveryCaseService;

    @GetMapping
    public Page<RecoveryCase> getAllCases(Pageable pageable) {
        return recoveryCaseRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public RecoveryCase getCase(@PathVariable String id) {
        return recoveryCaseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Recovery case not found"));
    }

    @GetMapping("/transaction/{transactionId}")
    public RecoveryCase getCaseByTransaction(@PathVariable String transactionId) {
        return recoveryCaseRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new NotFoundException("Recovery case not found for transaction"));
    }

    @PostMapping("/process/{transactionId}")
    public RecoveryCase process(@PathVariable String transactionId) {
        return recoveryCaseService.process(transactionId);
    }
}
