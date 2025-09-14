package com.email.writer.controller;

import com.email.writer.dto.AuthResponse;
import com.email.writer.dto.LoginRequest;
import com.email.writer.dto.RegisterRequest;
import com.email.writer.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication endpoints (register/login).
 * Returns JWT tokens on success.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user.
     *
     * Request Body (JSON):
     * {
     *   "username": "string (3-50 chars, required, unique)",
     *   "email": "string (valid email, required, unique)",
     *   "password": "string (min 6 chars, required)",
     *   "firstName": "string (optional)",
     *   "lastName": "string (optional)"
     * }
     *
     * Field requirements:
     * - username: Required, 3-50 characters, must be unique.
     * - email: Required, must be a valid email, must be unique.
     * - password: Required, minimum 6 characters.
     * - firstName: Optional.
     * - lastName: Optional.
     *
     * @param request RegisterRequest JSON body
     * @return 200 OK with AuthResponse on success, 400 Bad Request with error details on failure
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse res = authService.register(request);
            return ResponseEntity.ok(res);
        } catch (Exception ex) {
            log.warn("Registration failed: {}", ex.getMessage());
            // Error: Registration failed (validation, duplicate, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "registration_failed",
                "message", "Registration failed.",
                "reason", ex.getMessage()
            ));
        }
    }

    /**
     * Login with username and password.
     *
     * Request Body (JSON):
     * {
     *   "username": "string (required)",
     *   "password": "string (required)"
     * }
     *
     * Field requirements:
     * - username: Required.
     * - password: Required.
     *
     * @param request LoginRequest JSON body
     * @return 200 OK with AuthResponse on success, 400 Bad Request with error details on failure
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse res = authService.login(request);
            return ResponseEntity.ok(res);
        } catch (Exception ex) {
            log.warn("Login failed for {}: {}", request.getUsername(), ex.getMessage());
            // Error: Login failed (invalid credentials, user not found, etc.)
            return ResponseEntity.badRequest().body(Map.of(
                "error", "login_failed",
                "message", "Login failed.",
                "reason", ex.getMessage()
            ));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "Auth service running"));
    }
}
