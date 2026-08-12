package com.cakedelight.notification.service;

import com.cakedelight.notification.config.RabbitMQConfig;
import com.cakedelight.notification.dto.OrderCompletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderCompletedListener {

    private final NotificationService notificationService;

    @RabbitListener(
            queues = RabbitMQConfig.ORDER_COMPLETED_QUEUE
    )
    public void handleOrderCompleted(
            OrderCompletedEvent event) {

        notificationService.createOrderConfirmation(
                event.userId(),
                event.orderId()
        );
    }
}