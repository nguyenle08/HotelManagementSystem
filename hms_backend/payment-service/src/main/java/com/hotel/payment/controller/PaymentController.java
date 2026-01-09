package com.hotel.payment.controller;

import com.hotel.payment.dto.ApiResponse;
import com.hotel.payment.dto.VNPayRequest;
import com.hotel.payment.dto.VNPayResponse;
import com.hotel.payment.service.VNPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final RestTemplate restTemplate;

    @PostMapping("/vnpay/create")
    public ResponseEntity<ApiResponse<VNPayResponse>> createPayment(@RequestBody VNPayRequest request) {
        try {
            VNPayResponse response = vnPayService.createPayment(request);
            return ResponseEntity.ok(
                new ApiResponse<VNPayResponse>(true, "Tạo link thanh toán thành công", response)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<VNPayResponse>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<ApiResponse<Map<String, String>>> handleCallback(@RequestParam Map<String, String> params) {
        try {
            // TODO: Tạm bỏ qua verify để test - CHỈ DÙNG KHI DEVELOPMENT
            boolean isValid = true; // vnPayService.verifyPayment(params);
            
            if (isValid) {
                String responseCode = params.get("vnp_ResponseCode");
                String reservationId = extractReservationIdFromCallback(params);
                
                if ("00".equals(responseCode)) {
                    // Payment successful - update reservation payment status
                    if (reservationId != null) {
                        updateReservationPaymentStatus(reservationId, "PAID");
                    }
                    
                    return ResponseEntity.ok(
                        new ApiResponse<Map<String, String>>(true, "Thanh toán thành công", params)
                    );
                } else {
                    // Payment failed
                    if (reservationId != null) {
                        updateReservationPaymentStatus(reservationId, "FAILED");
                    }
                    
                    return ResponseEntity.ok(
                        new ApiResponse<Map<String, String>>(false, "Thanh toán thất bại", params)
                    );
                }
            } else {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<Map<String, String>>(false, "Chữ ký không hợp lệ", null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<Map<String, String>>(false, e.getMessage(), null));
        }
    }
    
    private String extractReservationIdFromCallback(Map<String, String> params) {
        // Extract from vnp_OrderInfo or custom param
        String orderInfo = params.get("vnp_OrderInfo");
        if (orderInfo != null && orderInfo.contains("reservationId=")) {
            return orderInfo.split("reservationId=")[1].split("&")[0];
        }
        // Or from query param if you passed it
        return params.get("reservationId");
    }
    
    private void updateReservationPaymentStatus(String reservationId, String status) {
        try {
            String url = "http://reservation-service/api/reservations/" + reservationId + "/payment?status=" + status;
            System.out.println("Updating payment status: " + url);
            restTemplate.put(url, null);
            System.out.println("Payment status updated successfully");
        } catch (Exception e) {
            System.err.println("Failed to update payment status: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
