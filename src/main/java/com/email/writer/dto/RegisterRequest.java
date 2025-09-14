package com.email.writer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for registration.
 * <p>
 * Field requirements:
 * <ul>
 *   <li><b>username</b>: Required, 3-50 characters, must be unique.</li>
 *   <li><b>email</b>: Required, must be a valid email, must be unique.</li>
 *   <li><b>password</b>: Required, minimum 6 characters.</li>
 *   <li><b>firstName</b>: Optional.</li>
 *   <li><b>lastName</b>: Optional.</li>
 * </ul>
 */
@Data
public class RegisterRequest {
    /**
     * Username (required, 3-50 characters, unique)
     */
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    /**
     * Email (required, valid format, unique)
     */
    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    /**
     * Password (required, min 6 characters)
     */
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    /**
     * First name (optional)
     */
    private String firstName;

    /**
     * Last name (optional)
     */
    private String lastName;
}
