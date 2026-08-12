package com.cakedelight.order.dto;

import java.math.BigDecimal;

public record CatalogCakeResponse(
        Long id,
        String name,
        String description,
        String category,
        BigDecimal price,
        Boolean available,
        String imageUrl
) {
}