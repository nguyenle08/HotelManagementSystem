package com.hotel.reservation.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter; // inject filter

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(auth -> auth
        // Swagger UI endpoints
        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
        .requestMatchers("/reservation/api/reservations/all").hasAnyRole("STAFF", "ADMIN", "MANAGER")
        .requestMatchers("/reservation/api/reservations/*/check-in").hasAnyRole("STAFF", "ADMIN", "MANAGER")
        .requestMatchers("/reservation/api/reservations/*/check-out").hasAnyRole("STAFF", "ADMIN", "MANAGER")
        .requestMatchers("/reservation/api/reservations/**").hasAnyRole("USER", "STAFF", "ADMIN", "MANAGER")
        .anyRequest().authenticated()
      )
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      // Thêm filter trước UsernamePasswordAuthenticationFilter
      .addFilterBefore(jwtAuthenticationFilter,
        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
