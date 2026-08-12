package com.cakedelight.notification.dto;

import com.cakedelight.notification.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long userId,
        Long orderId,
        String type,
        String message,
        String status,
        LocalDateTime createdAt
) {

    public static NotificationResponse fromEntity(
            Notification notification) {

        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getOrderId(),
                notification.getType(),
                notification.getMessage(),
                notification.getStatus(),
                notification.getCreatedAt()
        );
    }
}