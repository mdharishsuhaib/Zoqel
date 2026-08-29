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
                String rawErrorReason = (String) entityMap.get("error_reason");
                final String errorReason = rawErrorReason != null ? rawErrorReason : "NETWORK_ERROR";

                String rawEmail = (String) entityMap.get("email");
                final String email = rawEmail != null ? rawEmail : "unknown@example.com";

                @SuppressWarnings("unchecked")
                Map<String, String> notes = (Map<String, String>) entityMap.get("notes");
                if (notes == null || !notes.containsKey("workspaceId")) {
                    logger.warning("Rejected webhook: missing workspaceId in notes");
                    return ResponseEntity.badRequest().body("Missing workspaceId in notes");
                }
                String workspaceId = notes.get("workspaceId");

                // Protect the demo workspace from unauthenticated webhook flooding
                if ("demo-workspace".equals(workspaceId)) {
                    logger.warning("Rejected webhook: targeted demo-workspace");
                    return ResponseEntity.status(403).body("Webhooks are disabled for the demo workspace. Use the simulator UI.");
                }

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

