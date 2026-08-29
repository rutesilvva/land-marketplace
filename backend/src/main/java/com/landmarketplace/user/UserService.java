package com.landmarketplace.user;

import java.time.Instant;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder encoder;
    public UserService(UserRepository repository, PasswordEncoder encoder) { this.repository = repository; this.encoder = encoder; }

    @Transactional
    public User register(String name, String email, String password) {
        String normalized = email.trim().toLowerCase();
        if (repository.existsByEmailIgnoreCase(normalized)) throw new IllegalStateException("An account with this email already exists.");
        return repository.save(new User(UUID.randomUUID(), name.trim(), normalized, encoder.encode(password), Instant.now()));
    }

    @Transactional(readOnly = true)
    public User require(String email) {
        return repository.findByEmailIgnoreCase(email).orElseThrow(() -> new IllegalArgumentException("User account was not found."));
    }
}
