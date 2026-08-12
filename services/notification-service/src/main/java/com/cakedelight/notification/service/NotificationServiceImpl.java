package com.cakedelight.notification.service;

import com.cakedelight.notification.dto.NotificationResponse;
import com.cakedelight.notification.entity.Notification;
import com.cakedelight.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationResponse createOrderConfirmation(
            Long userId,
            Long orderId) {

        Notification notification = new Notification();

        notification.setUserId(userId);
        notification.setOrderId(orderId);
        notification.setType("ORDER_CONFIRMATION");

        notification.setMessage(
                "Your Cake Delight order #" +
                orderId +
                " has been confirmed successfully."
        );

        notification.setStatus("SENT");

        Notification savedNotification =
                notificationRepository.save(notification);

        return NotificationResponse.fromEntity(
                savedNotification
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUserId(
            Long userId) {

        return notificationRepository
                .findByUserId(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByOrderId(
            Long orderId) {

        return notificationRepository
                .findByOrderId(orderId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }
}