package com.cakedelight.order.service;

import com.cakedelight.order.dto.BasketResponse;

public interface BasketService {

    BasketResponse getBasket(Long userId);

    BasketResponse addItem(
            Long userId,
            Long cakeId,
            Integer quantity
    );

    BasketResponse updateItem(
            Long userId,
            Long itemId,
            Integer quantity
    );

    void removeItem(
            Long userId,
            Long itemId
    );
}