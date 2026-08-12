package com.cakedelight.order.service;

import com.cakedelight.order.dto.CheckoutRequest;
import com.cakedelight.order.dto.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse checkout(CheckoutRequest request);

    OrderResponse getOrderById(Long orderId);

    List<OrderResponse> getOrdersByUserId(Long userId);
}