package com.cakedelight.rating.dto;

import com.cakedelight.rating.entity.Rating;

import java.time.LocalDateTime;

public record RatingResponse(

        Long id,
        Long userId,
        Long cakeId,
        Integer rating,
        String comment,
        LocalDateTime createdAt

) {

    public static RatingResponse fromEntity(Rating rating) {

        return new RatingResponse(
                rating.getId(),
                rating.getUserId(),
                rating.getCakeId(),
                rating.getRating(),
                rating.getComment(),
                rating.getCreatedAt()
        );
    }
}