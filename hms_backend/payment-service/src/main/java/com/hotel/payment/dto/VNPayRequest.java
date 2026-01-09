package com.hotel.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VNPayRequest {
    private String reservationId;
    private BigDecimal amount;
    private String orderInfo;
    private String returnUrl;
}
