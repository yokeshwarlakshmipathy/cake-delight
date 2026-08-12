package com.cakedelight.order.dto;

import java.math.BigDecimal;

public record OrderItemResponse(

        Long id,
        Long cakeId,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}