package com.cakedelight.rating.service;

import com.cakedelight.rating.dto.AverageRatingResponse;
import com.cakedelight.rating.dto.RatingRequest;
import com.cakedelight.rating.dto.RatingResponse;
import com.cakedelight.rating.entity.Rating;
import com.cakedelight.rating.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;

    @Override
    public RatingResponse createRating(RatingRequest request) {

        boolean alreadyRated =
                ratingRepository.existsByUserIdAndCakeId(
                        request.userId(),
                        request.cakeId()
                );

        if (alreadyRated) {
            throw new IllegalArgumentException(
                    "User has already rated this cake"
            );
        }

        Rating rating = new Rating();

        rating.setUserId(request.userId());
        rating.setCakeId(request.cakeId());
        rating.setRating(request.rating());
        rating.setComment(request.comment());

        Rating savedRating = ratingRepository.save(rating);

        return RatingResponse.fromEntity(savedRating);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingResponse> getRatingsByCakeId(Long cakeId) {

        return ratingRepository.findByCakeId(cakeId)
                .stream()
                .map(RatingResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AverageRatingResponse getAverageRating(Long cakeId) {

        List<Rating> ratings =
                ratingRepository.findByCakeId(cakeId);

        if (ratings.isEmpty()) {

            return new AverageRatingResponse(
                    cakeId,
                    BigDecimal.ZERO,
                    0L
            );
        }

        BigDecimal total =
                ratings.stream()
                        .map(rating ->
                                BigDecimal.valueOf(
                                        rating.getRating()
                                )
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal average =
                total.divide(
                        BigDecimal.valueOf(ratings.size()),
                        2,
                        RoundingMode.HALF_UP
                );

        return new AverageRatingResponse(
                cakeId,
                average,
                (long) ratings.size()
        );
    }
}