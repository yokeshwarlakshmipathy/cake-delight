package com.cakedelight.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddBasketItemRequest(

        @NotNull
        Long cakeId,

        @NotNull
        @Min(1)
        Integer quantity
) {
}