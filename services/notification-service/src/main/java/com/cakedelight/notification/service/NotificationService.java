package com.cakedelight.notification.service;

import com.cakedelight.notification.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse createOrderConfirmation(
            Long userId,
            Long orderId
    );

    List<NotificationResponse> getNotificationsByUserId(
            Long userId
    );

    List<NotificationResponse> getNotificationsByOrderId(
            Long orderId
    );
}