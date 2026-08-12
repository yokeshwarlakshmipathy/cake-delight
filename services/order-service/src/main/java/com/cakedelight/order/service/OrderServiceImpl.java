package com.cakedelight.order.service;

import com.cakedelight.order.dto.CheckoutRequest;
import com.cakedelight.order.dto.OrderItemResponse;
import com.cakedelight.order.dto.OrderResponse;
import com.cakedelight.order.entity.Basket;
import com.cakedelight.order.entity.BasketItem;
import com.cakedelight.order.entity.Order;
import com.cakedelight.order.entity.OrderItem;
import com.cakedelight.order.entity.OrderStatus;
import com.cakedelight.order.repository.BasketRepository;
import com.cakedelight.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final BasketRepository basketRepository;
    private final OrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;

    @Override
    public OrderResponse checkout(CheckoutRequest request) {

        Long userId = request.userId();

        Basket basket = basketRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Basket not found for user: " + userId
                        )
                );

        if (basket.getItems() == null ||
                basket.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Cannot checkout an empty basket"
            );
        }

        Order order = new Order();

        order.setUserId(userId);
        order.setTotalAmount(basket.getTotalAmount());
        order.setStatus(OrderStatus.CREATED);

        for (BasketItem basketItem : basket.getItems()) {

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setCakeId(basketItem.getCakeId());
            orderItem.setQuantity(basketItem.getQuantity());
            orderItem.setUnitPrice(basketItem.getUnitPrice());

            BigDecimal subtotal =
                    basketItem.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            basketItem.getQuantity()
                                    )
                            );

            orderItem.setSubtotal(subtotal);

            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        savedOrder.setStatus(OrderStatus.COMPLETED);

        savedOrder = orderRepository.save(savedOrder);

        orderEventPublisher.publishOrderCompleted(
                savedOrder.getId(),
                savedOrder.getUserId()
        );

        basket.getItems().clear();
        basket.setTotalAmount(BigDecimal.ZERO);

        basketRepository.save(basket);

        return toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + orderId
                        )
                );

        return toResponse(order);
    }

    // NEW: Get all orders belonging to a user
    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {

        List<Order> orders =
                orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return orders.stream()
                .map(this::toResponse)
                .toList();
    }

    private OrderResponse toResponse(Order order) {

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item ->
                                new OrderItemResponse(
                                        item.getId(),
                                        item.getCakeId(),
                                        item.getQuantity(),
                                        item.getUnitPrice(),
                                        item.getSubtotal()
                                )
                        )
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                items
        );
    }
}