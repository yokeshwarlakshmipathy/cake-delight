package com.cakedelight.order.dto;

public record OrderCompletedEvent(
        Long orderId,
        Long userId
) {
}