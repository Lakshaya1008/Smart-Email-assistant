package com.email.writer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for login.
 */
@Data
public class LoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}
