package com.cakedelight.order.service;

import com.cakedelight.order.client.CatalogClient;
import com.cakedelight.order.dto.BasketItemResponse;
import com.cakedelight.order.dto.BasketResponse;
import com.cakedelight.order.dto.CatalogCakeResponse;
import com.cakedelight.order.entity.Basket;
import com.cakedelight.order.entity.BasketItem;
import com.cakedelight.order.repository.BasketItemRepository;
import com.cakedelight.order.repository.BasketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BasketServiceImpl implements BasketService {

    private final BasketRepository basketRepository;
    private final BasketItemRepository basketItemRepository;
    private final CatalogClient catalogClient;

    @Override
    public BasketResponse getBasket(Long userId) {

        Basket basket = basketRepository.findByUserId(userId)
                .orElseGet(() -> createBasket(userId));

        return toResponse(basket);
    }

    @Override
    public BasketResponse addItem(
            Long userId,
            Long cakeId,
            Integer quantity) {

        Basket basket = basketRepository.findByUserId(userId)
                .orElseGet(() -> createBasket(userId));

        BasketItem item = basketItemRepository
                .findByBasketIdAndCakeId(basket.getId(), cakeId)
                .orElse(null);

        if (item != null) {

            // Cake already exists in basket.
            // Increase the existing quantity.
            item.setQuantity(item.getQuantity() + quantity);

        } else {

            // Get cake information from Catalog Service.
            CatalogCakeResponse cake =
                    catalogClient.getCakeById(cakeId);

            if (cake == null) {
                throw new IllegalArgumentException(
                        "Cake not found: " + cakeId
                );
            }

            if (!Boolean.TRUE.equals(cake.available())) {
                throw new IllegalArgumentException(
                        "Cake is currently unavailable: " + cakeId
                );
            }

            item = new BasketItem();

            item.setBasket(basket);
            item.setCakeId(cakeId);
            item.setQuantity(quantity);
            item.setUnitPrice(cake.price());

            item.setSubtotal(
                    cake.price()
                            .multiply(
                                    BigDecimal.valueOf(quantity)
                            )
            );

            basket.getItems().add(item);
        }

        calculateBasketTotal(basket);

        basketRepository.save(basket);

        return toResponse(basket);
    }

    @Override
    public BasketResponse updateItem(
            Long userId,
            Long itemId,
            Integer quantity) {

        Basket basket = basketRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Basket not found for user: " + userId
                        )
                );

        BasketItem item = basketItemRepository.findById(itemId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Basket item not found: " + itemId
                        )
                );

        if (!item.getBasket().getId().equals(basket.getId())) {
            throw new IllegalArgumentException(
                    "Basket item does not belong to this user's basket"
            );
        }

        item.setQuantity(quantity);

        calculateBasketTotal(basket);

        basketRepository.save(basket);

        return toResponse(basket);
    }

    @Override
    public void removeItem(
            Long userId,
            Long itemId) {

        Basket basket = basketRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Basket not found for user: " + userId
                        )
                );

        BasketItem item = basketItemRepository.findById(itemId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Basket item not found: " + itemId
                        )
                );

        if (!item.getBasket().getId().equals(basket.getId())) {
            throw new IllegalArgumentException(
                    "Basket item does not belong to this user's basket"
            );
        }

        basket.getItems().remove(item);

        basketItemRepository.delete(item);

        calculateBasketTotal(basket);

        basketRepository.save(basket);
    }

    private Basket createBasket(Long userId) {

        Basket basket = new Basket();

        basket.setUserId(userId);
        basket.setTotalAmount(BigDecimal.ZERO);
        basket.setItems(new ArrayList<>());

        return basketRepository.save(basket);
    }

    private void calculateBasketTotal(Basket basket) {

        BigDecimal total = basket.getItems()
                .stream()
                .map(item ->
                        item.getUnitPrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                item.getQuantity()
                                        )
                                )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        basket.setTotalAmount(total);

        basket.getItems().forEach(item ->
                item.setSubtotal(
                        item.getUnitPrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                item.getQuantity()
                                        )
                                )
                )
        );
    }

    private BasketResponse toResponse(Basket basket) {

        List<BasketItemResponse> items =
                basket.getItems()
                        .stream()
                        .map(item ->
                                new BasketItemResponse(
                                        item.getId(),
                                        item.getCakeId(),
                                        item.getQuantity(),
                                        item.getUnitPrice(),
                                        item.getSubtotal()
                                )
                        )
                        .toList();

        return new BasketResponse(
                basket.getId(),
                basket.getUserId(),
                items,
                basket.getTotalAmount()
        );
    }
}