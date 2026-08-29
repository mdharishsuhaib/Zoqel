package com.zoqel.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

/**
 * DemoGuardFilter — backend enforcement for demo-workspace isolation.
 *
 * When the authenticated user belongs to the demo-workspace:
 * - All GET requests are allowed (read-only demo experience).
 * - POST /api/transactions/simulate is allowed (demo recovery flow).
 * - POST /api/recovery/process/** is allowed (demo AI pipeline).
 * - All other POST, PUT, PATCH, DELETE requests are blocked with 403.
 *
 * This means: even if a frontend bug or direct API manipulation sends
 * a write to /api/policy or /api/customers from a demo token,
 * the backend will reject it.
 */
@Component
@Order(10)
@RequiredArgsConstructor
public class DemoGuardFilter extends OncePerRequestFilter {

    private static final String DEMO_WORKSPACE_ID = "demo-workspace";

    // Write methods allowed in demo mode (demo recovery simulation flow)
    private static final Set<String> DEMO_ALLOWED_WRITE_PATHS = Set.of(
            "/api/transactions/simulate",
            "/api/simulator/retry"
    );

    private final AppUserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = (String) auth.getPrincipal();
        boolean isDemo = userRepository.findById(userId)
                .map(u -> DEMO_WORKSPACE_ID.equals(u.getWorkspaceId()))
                .orElse(false);

        if (!isDemo) {
            filterChain.doFilter(request, response);
            return;
        }

        // Demo user — allow reads and specifically permitted writes
        String method = request.getMethod().toUpperCase();
        String path = request.getRequestURI();

        boolean isReadRequest = "GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method);
        boolean isAllowedWrite = DEMO_ALLOWED_WRITE_PATHS.stream().anyMatch(path::startsWith);

        // Block /api/recovery/process/* with POST (allow for demo pipeline)
        boolean isRecoveryProcess = "POST".equals(method) && path.startsWith("/api/recovery/process/");

        if (!isReadRequest && !isAllowedWrite && !isRecoveryProcess) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            objectMapper.writeValue(response.getWriter(), Map.of(
                    "status", 403,
                    "error", "Forbidden",
                    "message", "This action is not permitted in Demo Mode. Sign up for a full account to configure policies and workspaces.",
                    "demoMode", true
            ));
            return;
        }

        filterChain.doFilter(request, response);
    }
}
