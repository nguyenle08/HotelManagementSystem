package com.hotel.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/*@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
}*/

@Entity
@Table(name = "guests")
@Data
public class Guest {

    @Id
    @Column(name = "guest_id", length = 36)
    private String guestId;

    @Column(name = "user_id", length = 36, unique = true, nullable = false)
    private String userId;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(length = 20)
    private String phone;

    @Column(length = 20)
    private String cccd;

    @Column(length = 255)
    private String address;

    private Integer loyaltyPoints = 0;

    private String memberTier = "BRONZE";

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
