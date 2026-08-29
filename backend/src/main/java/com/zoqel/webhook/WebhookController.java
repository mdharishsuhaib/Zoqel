package com.zoqel.webhook;

import com.zoqel.customer.Customer;
import com.zoqel.customer.CustomerRepository;
import com.zoqel.customer.RiskTier;
import com.zoqel.recovery.RecoveryCaseService;
import com.zoqel.transaction.FailureReason;
import com.zoqel.transaction.PaymentMethod;
import com.zoqel.transaction.SimulateTransactionRequest;
import com.zoqel.transaction.Transaction;
import com.zoqel.transaction.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {
    
    private static final Logger logger = Logger.getLogger(WebhookController.class.getName());
    
    private final TransactionService transactionService;
    private final RecoveryCaseService recoveryCaseService;
    private final CustomerRepository customerRepository;

    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(@RequestBody Map<String, Object> payload, 
                                                        @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        
        logger.info("Received Razorpay Webhook Event: " + payload.get("event"));
        
        // In a real production scenario, you would verify the X-Razorpay-Signature here using your webhook secret.
        // For the hackathon demo, we accept the payload and log it.
        
        String eventType = (String) payload.get("event");
        
        if ("payment.failed".equals(eventType)) {
            logger.info("Processing failed payment event...");
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> payloadMap = (Map<String, Object>) payload.get("payload");
                @SuppressWarnings("unchecked")
                Map<String, Object> paymentMap = (Map<String, Object>) payloadMap.get("payment");
                @SuppressWarnings("unchecked")
                Map<String, Object> entityMap = (Map<String, Object>) paymentMap.get("entity");
                
                Integer amount = (Integer) entityMap.get("amount");
                String errorReason = (String) entityMap.get("error_reason");
                if (errorReason == null) errorReason = "NETWORK_ERROR";

                String email = (String) entityMap.get("email");
                if (email == null) email = "unknown@example.com";

                @SuppressWarnings("unchecked")
                Map<String, String> notes = (Map<String, String>) entityMap.get("notes");
                String workspaceId = (notes != null && notes.containsKey("workspaceId")) ? notes.get("workspaceId") : "demo-workspace";

                // Find or create customer
                Customer customer = customerRepository.findByEmailAndWorkspaceId(email, workspaceId).orElseGet(() -> {
                    Customer c = Customer.builder()
                        .name("Webhook Customer")
                        .email(email)
                        .phone((String) entityMap.get("contact"))
                        .riskTier(RiskTier.LOW)
                        .joinedAt(Instant.now())
                        .workspaceId(workspaceId)
                        .build();
                    return customerRepository.save(c);
                });

                SimulateTransactionRequest simReq = new SimulateTransactionRequest();
                simReq.setCustomerId(customer.getId());
                simReq.setAmountPaise(amount != null ? amount.longValue() : 50000L);
                
                FailureReason reasonEnum;
                try {
                    reasonEnum = FailureReason.valueOf(errorReason);
                } catch (IllegalArgumentException | NullPointerException e) {
                    reasonEnum = FailureReason.UNKNOWN;
                }
                simReq.setFailureReason(reasonEnum);
                
                simReq.setPaymentMethod(PaymentMethod.UPI);

                // Create the failed transaction
                Transaction t = transactionService.simulate(simReq, workspaceId);

                // Pipe directly into the Zoqel Intelligence Engine
                recoveryCaseService.process(t.getId(), workspaceId);

                logger.info("Webhook successfully processed and piped into Intelligence Engine for transaction: " + t.getId());

            } catch (Exception e) {
                logger.severe("Error parsing webhook payload: " + e.getMessage());
                return ResponseEntity.badRequest().body("Invalid payload format");
            }
        }

        return ResponseEntity.ok("Webhook received successfully");
    }
}

