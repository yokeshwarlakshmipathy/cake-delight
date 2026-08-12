package com.cakedelight.notification.dto;

public record OrderCompletedEvent(
        Long orderId,
        Long userId
) {
}