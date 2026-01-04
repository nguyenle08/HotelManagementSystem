package com.hotel.auth.client;

import com.hotel.auth.dto.CreateGuestRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class UserClient {

    private final WebClient.Builder webClientBuilder;

    public void createGuest(CreateGuestRequest request) {
        webClientBuilder
                .baseUrl("http://user-service")
                .build()
                .post()
                .uri("/internal/guests")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }
}
