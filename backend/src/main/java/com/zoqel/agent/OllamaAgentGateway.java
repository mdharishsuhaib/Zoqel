package com.zoqel.agent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zoqel.config.OllamaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class OllamaAgentGateway implements AgentGateway {

    private final OllamaConfig config;
    private final RestClient ollamaClient;
    private final ObjectMapper objectMapper;

    @Override
    public AgentDecision recommend(AgentContext context) {
        String systemPrompt = "You are Zoqel, an AI-powered payment recovery agent. Analyze the following failed payment context and recommend the single best recovery action. Respond with ONLY a valid JSON object, no markdown, no explanation outside the JSON.";
        
        try {
            String contextJson = objectMapper.writeValueAsString(context);
            String userPrompt = contextJson + "\n\nAvailable actions: RETRY (retry the payment), NOTIFY (send recovery communication to customer), ESCALATE (escalate to human agent), IGNORE (no action needed). Choose the most appropriate action. Respond with exactly this JSON structure: {\"decision\": \"RETRY|NOTIFY|ESCALATE|IGNORE\", \"reason\": \"brief explanation\", \"confidence\": 0.00-1.00, \"requiresHuman\": true|false}";

            Map<String, Object> requestBody = Map.of(
                    "model", config.getModel(),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    ),
                    "response_format", Map.of("type", "json_object")
            );

            Map response = ollamaClient.post()
                    .uri("/chat/completions")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    
                    if (content.startsWith("```json")) {
                        content = content.substring(7);
                    }
                    if (content.endsWith("```")) {
                        content = content.substring(0, content.length() - 3);
                    }
                    
                    JsonNode jsonNode = objectMapper.readTree(content.trim());
                    String decisionStr = jsonNode.has("decision") ? jsonNode.get("decision").asText() : "ESCALATE";
                    String reason = jsonNode.has("reason") ? jsonNode.get("reason").asText() : "Fallback reason";
                    double confidence = jsonNode.has("confidence") ? jsonNode.get("confidence").asDouble() : 0.6;
                    boolean requiresHuman = false;
                    
                    if (jsonNode.has("requiresHuman")) {
                        requiresHuman = jsonNode.get("requiresHuman").asBoolean();
                    } else if (jsonNode.has("requires_human")) {
                        requiresHuman = jsonNode.get("requires_human").asBoolean();
                    }

                    return AgentDecision.builder()
                            .decision(RecoveryAction.valueOf(decisionStr))
                            .reason(reason)
                            .confidence(confidence)
                            .requiresHuman(requiresHuman)
                            .build();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get recommendation from LLM, returning fallback decision.", e);
        }

        // Smart fallback: use recovery probability + failure type to decide action.
        // This runs when the LLM is unavailable (e.g. API key not configured).
        double prob = context.getRecoveryProbability() != null ? context.getRecoveryProbability() : 0.0;
        String failReason = context.getFailureReason() != null ? context.getFailureReason() : "UNKNOWN";

        // Inherently unrecoverable by retry
        boolean unrecoverable = "INSUFFICIENT_FUNDS".equals(failReason) || "DUPLICATE_ATTEMPT".equals(failReason);
        // Clearly transient errors
        boolean transientError = "BANK_TIMEOUT".equals(failReason) || "NETWORK_ERROR".equals(failReason);

        if ("INSUFFICIENT_FUNDS".equals(failReason)) {
            return AgentDecision.builder()
                    .decision(RecoveryAction.IGNORE)
                    .reason("Fallback: Insufficient funds — not recoverable by retry.")
                    .confidence(0.90)
                    .requiresHuman(false)
                    .build();
        }

        if ("DUPLICATE_ATTEMPT".equals(failReason)) {
            return AgentDecision.builder()
                    .decision(RecoveryAction.ESCALATE)
                    .reason("Fallback: Duplicate attempt requires human review to avoid double charge.")
                    .confidence(0.85)
                    .requiresHuman(true)
                    .build();
        }

        if (prob >= 0.70) {
            return AgentDecision.builder()
                    .decision(RecoveryAction.RETRY)
                    .reason("Fallback: Recovery probability " + String.format("%.0f", prob * 100) + "% — retrying " + failReason)
                    .confidence(prob)
                    .requiresHuman(false)
                    .build();
        } else if (prob >= 0.40 && transientError) {
            return AgentDecision.builder()
                    .decision(RecoveryAction.RETRY)
                    .reason("Fallback: Transient error with moderate probability " + String.format("%.0f", prob * 100) + "% — retrying.")
                    .confidence(prob)
                    .requiresHuman(false)
                    .build();
        } else {
            return AgentDecision.builder()
                    .decision(RecoveryAction.ESCALATE)
                    .reason("Fallback: Low recovery probability " + String.format("%.0f", prob * 100) + "% — escalating to human agent.")
                    .confidence(Math.max(prob, 0.50))
                    .requiresHuman(true)
                    .build();
        }
    }
}
