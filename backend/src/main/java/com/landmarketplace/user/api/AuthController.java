package com.landmarketplace.user.api;

import com.landmarketplace.user.User;
import com.landmarketplace.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService service;
    public AuthController(UserService service) { this.service = service; }

    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return UserResponse.from(service.register(request.name(), request.email(), request.password()));
    }
    @GetMapping("/me") public UserResponse me(Principal principal) { return UserResponse.from(service.require(principal.getName())); }

    public record RegisterRequest(@NotBlank @Size(max=120) String name, @NotBlank @Email @Size(max=255) String email,
                                  @NotBlank @Size(min=8,max=72) String password) {}
    public record UserResponse(java.util.UUID id, String name, String email) {
        static UserResponse from(User user) { return new UserResponse(user.getId(), user.getName(), user.getEmail()); }
    }
}
