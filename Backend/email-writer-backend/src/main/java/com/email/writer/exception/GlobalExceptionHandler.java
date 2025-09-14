package com.email.writer.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

/**
 * Global exception handler for controllers — centralizes error responses and logging.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        java.util.Map<String, Object> error = new java.util.HashMap<>();
        error.put("error", "validation_error");
        java.util.List<java.util.Map<String, String>> fieldErrors = new java.util.ArrayList<>();
        ex.getBindingResult().getFieldErrors().forEach(fieldError -> {
            java.util.Map<String, String> err = new java.util.HashMap<>();
            err.put("field", fieldError.getField());
            err.put("message", fieldError.getDefaultMessage());
            fieldErrors.add(err);
        });
        error.put("fieldErrors", fieldErrors);
        error.put("message", "Validation failed for one or more fields");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        log.error("RuntimeException: {}", ex.getMessage(), ex);
        java.util.Map<String, Object> error = new java.util.HashMap<>();
        error.put("error", "runtime_error");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        java.util.Map<String, Object> error = new java.util.HashMap<>();
        error.put("error", "internal_error");
        error.put("message", "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
