package com.cakedelight.notification.controller;

import com.cakedelight.notification.dto.NotificationResponse;
import com.cakedelight.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/order-confirmation")
    public ResponseEntity<NotificationResponse> createOrderConfirmation(
            @RequestParam Long userId,
            @RequestParam Long orderId) {

        NotificationResponse response =
                notificationService.createOrderConfirmation(
                        userId,
                        orderId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService
                        .getNotificationsByUserId(userId)
        );
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<NotificationResponse>> getByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                notificationService
                        .getNotificationsByOrderId(orderId)
        );
    }
}