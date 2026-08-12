package com.cakedelight.order.controller;

import com.cakedelight.order.dto.AddBasketItemRequest;
import com.cakedelight.order.dto.BasketResponse;
import com.cakedelight.order.dto.UpdateBasketItemRequest;
import com.cakedelight.order.service.BasketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/baskets")
@RequiredArgsConstructor
public class BasketController {

    private final BasketService basketService;

    // View basket
    @GetMapping("/{userId}")
    public ResponseEntity<BasketResponse> getBasket(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                basketService.getBasket(userId)
        );
    }

    // Add cake to basket
    @PostMapping("/{userId}/items")
    public ResponseEntity<BasketResponse> addItem(
            @PathVariable Long userId,
            @Valid @RequestBody AddBasketItemRequest request) {

        BasketResponse response =
                basketService.addItem(
                        userId,
                        request.cakeId(),
                        request.quantity()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Update basket item quantity
    @PutMapping("/{userId}/items/{itemId}")
    public ResponseEntity<BasketResponse> updateItem(
            @PathVariable Long userId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateBasketItemRequest request) {

        BasketResponse response =
                basketService.updateItem(
                        userId,
                        itemId,
                        request.quantity()
                );

        return ResponseEntity.ok(response);
    }

    // Remove basket item
    @DeleteMapping("/{userId}/items/{itemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long userId,
            @PathVariable Long itemId) {

        basketService.removeItem(userId, itemId);

        return ResponseEntity.noContent().build();
    }
}