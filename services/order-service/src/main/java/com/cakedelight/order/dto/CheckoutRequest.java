package com.cakedelight.order.dto;

import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(

        @NotNull
        Long userId
) {
}