package com.cakedelight.order.dto;

import java.math.BigDecimal;
import java.util.List;

public record BasketResponse(

        Long id,
        Long userId,
        List<BasketItemResponse> items,
        BigDecimal totalAmount
) {
}