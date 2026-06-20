package com.gurukulam.school.auth;

import com.gurukulam.school.common.ApiResponse;
import com.gurukulam.school.security.JwtUtil;
import com.gurukulam.school.user.Role;
import com.gurukulam.school.user.User;
import com.gurukulam.school.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    // ── POST /api/auth/login ────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password())
        );

        String token = jwtUtil.generateToken(auth);

        UserDetails principal = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByUsername(principal.getUsername()).orElseThrow();

        LoginResponse body = new LoginResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getEmail()
        );
        return ResponseEntity.ok(ApiResponse.success("Login successful", body));
    }

    // ── DTOs ────────────────────────────────────────────────────────────
    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record LoginResponse(
            String token,
            Long userId,
            String username,
            Role role,
            String email
    ) {}
}
