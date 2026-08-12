package com.cakedelight.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CakeRequest(

        @NotBlank(message = "Cake name is required")
        String name,

        String description,

        @NotBlank(message = "Category is required")
        String category,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        BigDecimal price,

        @NotNull(message = "Availability is required")
        Boolean available,

        String imageUrl
) {
}