package com.cakedelight.catalog.repository;

import com.cakedelight.catalog.entity.Cake;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class CakeSpecification {

    private CakeSpecification() {
    }

    public static Specification<Cake> hasName(String name) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"
                );
    }

    public static Specification<Cake> hasCategory(String category) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("category")),
                        category.toLowerCase()
                );
    }

    public static Specification<Cake> priceGreaterThanOrEqual(
            BigDecimal minPrice) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("price"),
                        minPrice
                );
    }

    public static Specification<Cake> priceLessThanOrEqual(
            BigDecimal maxPrice) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("price"),
                        maxPrice
                );
    }
}