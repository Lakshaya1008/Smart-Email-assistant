package com.email.writer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Smart Email Assistant Backend Application
 * 
 * This is the main entry point for the Email Writer backend service.
 * The application provides REST APIs for email generation, user authentication,
 * and saved reply management.
 *
 * @author Smart Email Assistant Team
 * @version 1.0n
 * @since 2024-06-01
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.email.writer.repository")
public class EmailWriterBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmailWriterBackendApplication.class, args);
    }
}
