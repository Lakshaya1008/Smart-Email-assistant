package com.email.writer.service;

import com.email.writer.entity.User;
import com.email.writer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * UserService implements UserDetailsService to integrate with Spring Security.
 * Also offers helper methods used by AuthService.
 */
@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public boolean existsByUsername(String username) { return userRepository.existsByUsername(username); }

    public boolean existsByEmail(String email) { return userRepository.existsByEmail(email); }

    public User save(User user) { return userRepository.save(user); }
}
