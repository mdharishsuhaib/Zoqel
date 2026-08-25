package com.zoqel.agent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zoqel.config.OpenRouterConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class OpenRouterAgentGateway implements AgentGateway {

    private final OpenRouterConfig config;
    private final RestClient openRouterClient;
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
                    )
            );

            Map response = openRouterClient.post()
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

        // Fallback
        boolean highProb = context.getRecoveryProbability() != null && context.getRecoveryProbability() > 0.7;
        boolean isNetworkOrTimeout = "BANK_TIMEOUT".equals(context.getFailureReason()) || "NETWORK_ERROR".equals(context.getFailureReason());

        if (isNetworkOrTimeout && highProb) {
            return AgentDecision.builder()
                    .decision(RecoveryAction.RETRY)
                    .reason("Fallback: High probability network issue")
                    .confidence(0.75)
                    .requiresHuman(false)
                    .build();
        } else {
            return AgentDecision.builder()
                    .decision(RecoveryAction.ESCALATE)
                    .reason("Fallback: Unknown or complex issue requires review")
                    .confidence(0.6)
                    .requiresHuman(true)
                    .build();
        }
    }
}
