package com.cakedelight.order.repository;

import com.cakedelight.order.entity.BasketItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BasketItemRepository extends JpaRepository<BasketItem, Long> {

    Optional<BasketItem> findByBasketIdAndCakeId(
            Long basketId,
            Long cakeId
    );
}