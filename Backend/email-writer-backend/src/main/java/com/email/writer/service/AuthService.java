package com.email.writer.service;

import com.email.writer.dto.AuthResponse;
import com.email.writer.dto.LoginRequest;
import com.email.writer.dto.RegisterRequest;
import com.email.writer.entity.User;
import com.email.writer.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles registration and authentication logic.
 * - Passwords are encoded with BCrypt
 * - JWT tokens are generated on success
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userService.existsByUsername(request.getUsername()))
            throw new RuntimeException("Username already exists");
        if (userService.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already exists");

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setIsActive(true);

        User saved = userService.save(user);

        String token = jwtUtil.generateToken(saved);

        return new AuthResponse(token, saved.getId(), saved.getUsername(), saved.getEmail(), saved.getFirstName(), saved.getLastName());
    }

    public AuthResponse login(LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );
            User user = (User) auth.getPrincipal();
            String token = jwtUtil.generateToken(user);
            return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getFirstName(), user.getLastName());
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    /**
     * Helper to get currently authenticated user from Spring Security context
     */
    public User getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();
        return userService.findByUsername(username);
    }
}
