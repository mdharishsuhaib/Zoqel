package com.zoqel.policy;

import com.zoqel.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/policy")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyRepository policyRepository;

    @GetMapping
    public List<PolicyRule> getRules() {
        return policyRepository.findAll();
    }

    @PutMapping("/{key}")
    public PolicyRule updateRule(@PathVariable String key, @RequestBody Map<String, String> body) {
        PolicyRule rule = policyRepository.findByRuleKey(key)
                .orElseThrow(() -> new NotFoundException("Policy rule not found: " + key));
        
        if (body.containsKey("value")) {
            rule.setRuleValue(body.get("value"));
            return policyRepository.save(rule);
        }
        return rule;
    }
}
