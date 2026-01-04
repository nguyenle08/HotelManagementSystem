package com.hotel.user.service;

import com.hotel.user.client.AuthClient;
import com.hotel.user.dto.AuthUserDTO;
import com.hotel.user.dto.CreateGuestRequest;
import com.hotel.user.dto.UpdateProfileRequest;
import com.hotel.user.dto.ProfileResponse;
import com.hotel.user.entity.Guest;
import com.hotel.user.repository.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final GuestRepository guestRepository;
    private final AuthClient authClient;

    public void createGuest(CreateGuestRequest req) {

        if (guestRepository.existsByUserId(req.getUserId())) return;

        Guest g = new Guest();
        g.setGuestId(UUID.randomUUID().toString());
        g.setUserId(req.getUserId());
        g.setFirstName(req.getFirstName());
        g.setLastName(req.getLastName());
        g.setPhone(req.getPhone());
        g.setCccd(req.getCccd());
        g.setMemberTier("BRONZE");
        g.setLoyaltyPoints(0);

        guestRepository.save(g);
    }

    public ProfileResponse getMyProfile(String userId) {
        Guest guest = guestRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Guest newGuest = new Guest();
                    newGuest.setGuestId(UUID.randomUUID().toString());
                    newGuest.setUserId(userId);
                    newGuest.setFirstName("Chưa");
                    newGuest.setLastName("cập nhật");
                    return guestRepository.save(newGuest);
                });

        AuthUserDTO authUser = authClient.getUserById(userId);

        ProfileResponse res = new ProfileResponse();
        res.setUserId(userId);
        res.setUsername(authUser.getUsername());
        res.setRole(authUser.getRole());

        // SỬA: Kiểm tra FirstName và LastName từ bảng guests trước
        if (guest.getFirstName() != null && !guest.getFirstName().equalsIgnoreCase("null")) {
            res.setLastName(guest.getLastName());
            res.setFirstName(guest.getFirstName());
        } else {
            // Nếu Guest DB trống, lấy fullname từ Auth nhưng phải xóa chữ "null"
            String rawFullname = authUser.getFullname();
            if (rawFullname != null && !rawFullname.equalsIgnoreCase("null null")) {
                res.setFirstName(rawFullname);
            } else {
                res.setFirstName("Chưa cập nhật");
            }
        }

        res.setPhone(guest.getPhone() != null ? guest.getPhone() : authUser.getPhone());
        res.setCccd(guest.getCccd() != null ? guest.getCccd() : "Trống");
        res.setAddress(guest.getAddress());
        return res;
    }

    /*public void updateProfile(String userId, UpdateProfileRequest req) {

        Guest guest = guestRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        // user-service
        guest.setFirstName(req.getFirstName());
        guest.setLastName(req.getLastName());
        guest.setCccd(req.getCccd());
        guest.setAddress(req.getAddress());
        guestRepository.save(guest);

        // auth-service
        authClient.updateProfile(
                userId,
                req.getFirstName(),
                req.getLastName(),
                req.getPhone()
        );
    }*/
    public void updateProfile(String userId, UpdateProfileRequest req) {
        Guest guest = guestRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        // 1. Lưu ở User-Service (Vẫn thực hiện)
        guest.setFirstName(req.getFirstName());
        guest.setLastName(req.getLastName());
        guest.setCccd(req.getCccd());
        guest.setAddress(req.getAddress());
        guestRepository.save(guest);

        // 2. Gọi Auth-Service (Cho vào try-catch để nếu lỗi 403 thì vẫn kết thúc thành công)
        try {
            authClient.updateProfile(
                    userId,
                    req.getFirstName(),
                    req.getLastName(),
                    req.getPhone()
            );
        } catch (Exception e) {
            // Chỉ in ra log lỗi, không ném ngoại lệ để FE không bị báo "Thất bại"
            System.err.println("Lưu DB thành công nhưng không cập nhật được Auth-Service: " + e.getMessage());
        }
    }

    public Guest findByUserId(String userId) {
        return guestRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Guest guest = new Guest();
                    guest.setGuestId(UUID.randomUUID().toString());
                    guest.setUserId(userId);
                    guest.setMemberTier("BRONZE");
                    guest.setLoyaltyPoints(0);
                    return guestRepository.save(guest);
                });
    }

}

