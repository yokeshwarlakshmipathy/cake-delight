package com.cakedelight.order.service;

import com.cakedelight.order.config.RabbitMQConfig;
import com.cakedelight.order.dto.OrderCompletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCompleted(
            Long orderId,
            Long userId) {

        OrderCompletedEvent event =
                new OrderCompletedEvent(
                        orderId,
                        userId
                );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_COMPLETED_QUEUE,
                event
        );
    }
}