package com.cakedelight.rating.repository;

import com.cakedelight.rating.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByCakeId(Long cakeId);

    List<Rating> findByUserId(Long userId);

    boolean existsByUserIdAndCakeId(Long userId, Long cakeId);
}