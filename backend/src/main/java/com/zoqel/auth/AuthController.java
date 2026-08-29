package com.zoqel.auth;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final JwtService jwtService;
    private final AppUserRepository userRepository;

    // Fixed demo account — always maps to the seeded demo-workspace
    private static final String DEMO_EMAIL    = "demo@zoqel.internal";
    private static final String DEMO_WORKSPACE = "demo-workspace";

    @PostMapping("/demo")
    public ResponseEntity<?> demo() {
        AppUser demoUser = userRepository.findByEmail(DEMO_EMAIL).orElseGet(() -> {
            AppUser u = AppUser.builder()
                    .id(UUID.randomUUID().toString())
                    .fullName("Zoqel Demo")
                    .email(DEMO_EMAIL)
                    .passwordHash(BCrypt.hashpw(UUID.randomUUID().toString(), BCrypt.gensalt(4)))
                    .workspaceId(DEMO_WORKSPACE)
                    .createdAt(LocalDateTime.now())
                    .build();
            return userRepository.save(u);
        });

        // Ensure the demo user always has the demo workspace (idempotent fix)
        if (!DEMO_WORKSPACE.equals(demoUser.getWorkspaceId())) {
            demoUser.setWorkspaceId(DEMO_WORKSPACE);
            userRepository.save(demoUser);
        }

        String token = jwtService.generateToken(demoUser);
        return ResponseEntity.ok(new DemoAuthResponse(
                demoUser.getId(), demoUser.getFullName(), token, DEMO_WORKSPACE, true
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (DEMO_EMAIL.equalsIgnoreCase(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Reserved email address");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }

        // --- BACKEND VALIDATION RULES ---
        if (!request.isTermsAccepted() || !request.isPrivacyAccepted()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please agree to the Terms of Service and Privacy Policy.");
        }

        String pw = request.getPassword();
        if (pw == null || pw.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password is required");
        }
        if (!pw.equals(request.getConfirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords do not match.");
        }
        if (pw.length() < 8 || pw.length() > 128) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be between 8 and 128 characters");
        }
        if (pw.startsWith(" ") || pw.endsWith(" ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password cannot contain leading or trailing spaces");
        }
        if (!pw.matches(".*[A-Z].*") || !pw.matches(".*[a-z].*") || !pw.matches(".*[0-9].*") || !pw.matches(".*[^A-Za-z0-9].*")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character");
        }
        // --------------------------------

        String hashedPassword = BCrypt.hashpw(pw, BCrypt.gensalt(12));

        AppUser user = AppUser.builder()
                .id(UUID.randomUUID().toString())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), jwtService.generateToken(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (DEMO_EMAIL.equalsIgnoreCase(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Use POST /api/auth/demo instead");
        }

        Optional<AppUser> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        AppUser user = userOpt.get();
        if (!BCrypt.checkpw(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        return ResponseEntity.ok(new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), jwtService.generateToken(user)));
    }

    @Data
    static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private String confirmPassword;
        private boolean termsAccepted;
        private boolean privacyAccepted;
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @RequiredArgsConstructor
    static class AuthResponse {
        private final String id;
        private final String fullName;
        private final String email;
        private final String token;
    }

    @Data
    @RequiredArgsConstructor
    static class DemoAuthResponse {
        private final String id;
        private final String fullName;
        private final String token;
        private final String workspaceId;
        private final boolean demoMode;
    }
}
