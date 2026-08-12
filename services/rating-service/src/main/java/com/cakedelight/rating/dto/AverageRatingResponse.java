package com.cakedelight.rating.dto;

import java.math.BigDecimal;

public record AverageRatingResponse(

        Long cakeId,
        BigDecimal averageRating,
        Long totalRatings

) {
}