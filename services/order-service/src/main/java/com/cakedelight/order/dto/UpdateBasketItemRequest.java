package com.cakedelight.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateBasketItemRequest(

        @NotNull
        @Min(1)
        Integer quantity
) {
}