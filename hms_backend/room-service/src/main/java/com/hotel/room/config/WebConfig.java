package com.hotel.room.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS hiện được cấu hình tại API Gateway.
        // Không cấu hình lại ở room-service để tránh trùng Access-Control-Allow-Origin.
    }
}