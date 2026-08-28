package com.zoqel.workspace;

import com.zoqel.auth.AppUser;
import com.zoqel.auth.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final AppUserRepository userRepository;

    public String getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException("Not authenticated");
        }
        return (String) authentication.getPrincipal();
    }

    public AppUser getCurrentUser() {
        return userRepository.findById(getAuthenticatedUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public String getCurrentWorkspaceId() {
        AppUser user = getCurrentUser();
        if (user.getWorkspaceId() == null) {
            throw new org.springframework.security.access.AccessDeniedException("User has no workspace assigned");
        }
        return user.getWorkspaceId();
    }
}

