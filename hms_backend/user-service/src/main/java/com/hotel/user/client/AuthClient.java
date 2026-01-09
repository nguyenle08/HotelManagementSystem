package com.hotel.user.client;

import com.hotel.user.dto.AuthUpdateProfileRequest;
import com.hotel.user.dto.AuthUserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class AuthClient {

        // Base URL to Auth service
        private final WebClient webClient = WebClient.builder()
            .baseUrl("http://localhost:8081")
            .build();

    public AuthUserDTO getUserById(String userId) {
        return webClient.get()
                .uri("/api/internal/users/{userId}", userId)
                .retrieve()
                .onStatus(status -> status.isError(), res -> {
                    System.err.println("Lỗi gọi Auth Service: " + res.statusCode());
                    return res.createException();
                })
                .bodyToMono(AuthUserDTO.class)
                .block();
    }

    public void updateProfile(String userId, String firstName, String lastName, String phone) {

        AuthUpdateProfileRequest req = new AuthUpdateProfileRequest();
        req.setFirstName(firstName);
        req.setLastName(lastName);
        req.setPhone(phone);

        webClient.put()
            .uri("/api/internal/{userId}", userId)
                .bodyValue(req)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public void lockUser(String userId) {
        webClient.post()
            .uri("/api/internal/users/{userId}/lock", userId)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public void unlockUser(String userId) {
        webClient.post()
                .uri("/api/internal/users/{userId}/unlock", userId)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public AuthResponseDTO createUser(CreateAdminUserRequest req) {
        var resp = webClient.post()
                .uri("/api/auth/admin/create-user")
                .bodyValue(req)
                .retrieve()
                .onStatus(status -> status.isError(), res -> {
                    System.err.println("Failed to create user: " + res.statusCode());
                    return res.createException();
                })
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {})
                .block();

        if (resp == null) return null;
        Object data = resp.get("data");
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(data, AuthResponseDTO.class);
    }

    public java.util.List<com.hotel.user.dto.AuthUserDTO> getAllUsers() {
        var resp = webClient.get()
                .uri("/api/internal/users")
                .retrieve()
                .onStatus(status -> status.isError(), res -> {
                    System.err.println("Failed to fetch all users: " + res.statusCode());
                    return res.createException();
                })
                .bodyToFlux(com.hotel.user.dto.AuthUserDTO.class)
                .collectList()
                .block();

        return resp != null ? resp : new java.util.ArrayList<>();
    }
    public void updateRole(String userId, String role) {
        java.util.Map<String, String> body = new java.util.HashMap<>();
        body.put("role", role);
        webClient.put()
                .uri("/api/internal/users/{userId}/role", userId)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }
}
