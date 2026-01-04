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

    // Sửa port thành 8081 để khớp với thực tế log báo
    private final WebClient webClient = WebClient.builder()
            .baseUrl("http://localhost:8081/api/internal/users")
            .build();

    public AuthUserDTO getUserById(String userId) {
        return webClient.get()
                .uri("/{userId}", userId)
                .retrieve()
                // Thêm log để debug nếu lỗi
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
                .uri("/{userId}", userId)
                .bodyValue(req)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }
}
