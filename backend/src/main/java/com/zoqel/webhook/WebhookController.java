package com.zoqel.webhook;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/v1/webhooks")
@CrossOrigin(origins = "*")
public class WebhookController {
    
    private static final Logger logger = Logger.getLogger(WebhookController.class.getName());

    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(@RequestBody Map<String, Object> payload, 
                                                        @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        
        logger.info("Received Razorpay Webhook Event: " + payload.get("event"));
        
        // In a real production scenario, you would verify the X-Razorpay-Signature here using your webhook secret.
        // For the hackathon demo, we accept the payload and log it.
        
        String eventType = (String) payload.get("event");
        
        if ("payment.failed".equals(eventType)) {
            logger.info("Processing failed payment event...");
            // Extract transaction details and pass to Zoqel ML / Policy engine
            // Map<String, Object> payloadEntity = (Map<String, Object>) payload.get("payload");
            // Map<String, Object> paymentEntity = (Map<String, Object>) payloadEntity.get("payment");
            // Map<String, Object> entity = (Map<String, Object>) paymentEntity.get("entity");
            // String txnId = (String) entity.get("id");
            // ...
        }

        return ResponseEntity.ok("Webhook received successfully");
    }
}
