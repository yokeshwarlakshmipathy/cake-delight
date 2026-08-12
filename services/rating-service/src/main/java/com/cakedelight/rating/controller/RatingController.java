package com.cakedelight.rating.controller;

import com.cakedelight.rating.dto.AverageRatingResponse;
import com.cakedelight.rating.dto.RatingRequest;
import com.cakedelight.rating.dto.RatingResponse;
import com.cakedelight.rating.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<RatingResponse> createRating(
            @Valid @RequestBody RatingRequest request) {

        RatingResponse response =
                ratingService.createRating(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/cake/{cakeId}")
    public ResponseEntity<List<RatingResponse>> getRatingsByCakeId(
            @PathVariable Long cakeId) {

        return ResponseEntity.ok(
                ratingService.getRatingsByCakeId(cakeId)
        );
    }

    @GetMapping("/cake/{cakeId}/average")
    public ResponseEntity<AverageRatingResponse> getAverageRating(
            @PathVariable Long cakeId) {

        return ResponseEntity.ok(
                ratingService.getAverageRating(cakeId)
        );
    }

    // ==========================================
    // DUPLICATE RATING / BAD REQUEST HANDLING
    // ==========================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        Map.of(
                                "message",
                                ex.getMessage()
                        )
                );
    }
}