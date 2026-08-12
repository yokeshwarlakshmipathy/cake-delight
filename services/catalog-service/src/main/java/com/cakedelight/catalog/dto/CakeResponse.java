package com.cakedelight.catalog.dto;

import com.cakedelight.catalog.entity.Cake;

import java.math.BigDecimal;

public record CakeResponse(
        Long id,
        String name,
        String description,
        String category,
        BigDecimal price,
        Boolean available,
        String imageUrl
) {

    public static CakeResponse fromEntity(Cake cake) {
        return new CakeResponse(
                cake.getId(),
                cake.getName(),
                cake.getDescription(),
                cake.getCategory(),
                cake.getPrice(),
                cake.getAvailable(),
                cake.getImageUrl()
        );
    }
}