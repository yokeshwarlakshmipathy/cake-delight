package com.cakedelight.order.controller;

import com.cakedelight.order.dto.CheckoutRequest;
import com.cakedelight.order.dto.OrderResponse;
import com.cakedelight.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @Valid @RequestBody CheckoutRequest request) {

        OrderResponse response =
                orderService.checkout(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId)
        );
    }

    // NEW: Get order history for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                orderService.getOrdersByUserId(userId)
        );
    }
}