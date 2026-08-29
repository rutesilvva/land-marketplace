package com.landmarketplace.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.landmarketplace.user.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean UserDetailsService userDetailsService(UserRepository repository) {
        return email -> repository.findByEmailIgnoreCase(email)
            .map(account -> User.withUsername(account.getEmail()).password(account.getPasswordHash()).roles("USER").build())
            .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Account not found"));
    }
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper mapper) throws Exception {
        return http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/lands", "/api/lands/search").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults())
            .exceptionHandling(errors -> errors.authenticationEntryPoint((request, response, exception) -> {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); response.setContentType("application/json");
                mapper.writeValue(response.getOutputStream(), Map.of("status", 401, "error", "Unauthorized", "message", "Sign in to continue."));
            })).build();
    }
}
