package com.cakedelight.notification.repository;

import com.cakedelight.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    List<Notification> findByOrderId(Long orderId);
}