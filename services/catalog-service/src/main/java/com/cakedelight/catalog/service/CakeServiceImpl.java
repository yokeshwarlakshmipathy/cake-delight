package com.cakedelight.catalog.service;

import com.cakedelight.catalog.dto.CakeRequest;
import com.cakedelight.catalog.dto.CakeResponse;
import com.cakedelight.catalog.entity.Cake;
import com.cakedelight.catalog.exception.CakeNotFoundException;
import com.cakedelight.catalog.repository.CakeRepository;
import com.cakedelight.catalog.repository.CakeSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CakeServiceImpl implements CakeService {

    private final CakeRepository cakeRepository;

    @Override
    public CakeResponse createCake(CakeRequest request) {

        Cake cake = new Cake();

        cake.setName(request.name());
        cake.setDescription(request.description());
        cake.setCategory(request.category());
        cake.setPrice(request.price());
        cake.setAvailable(request.available());
        cake.setImageUrl(request.imageUrl());

        Cake savedCake = cakeRepository.save(cake);

        return CakeResponse.fromEntity(savedCake);
    }

    @Override
    public List<CakeResponse> getAllCakes() {

        return cakeRepository.findAll()
                .stream()
                .map(CakeResponse::fromEntity)
                .toList();
    }

    @Override
    public CakeResponse getCakeById(Long id) {

        Cake cake = cakeRepository.findById(id)
                .orElseThrow(() ->
                        new CakeNotFoundException(
                                "Cake not found with id: " + id
                        )
                );

        return CakeResponse.fromEntity(cake);
    }

    @Override
    public List<CakeResponse> searchCakes(
            String name,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        Specification<Cake> specification = null;

        // Filter by name
        if (name != null && !name.isBlank()) {

            specification = CakeSpecification.hasName(name);
        }

        // Filter by category
        if (category != null && !category.isBlank()) {

            Specification<Cake> categorySpecification =
                    CakeSpecification.hasCategory(category);

            specification = specification == null
                    ? categorySpecification
                    : specification.and(categorySpecification);
        }

        // Filter by minimum price
        if (minPrice != null) {

            Specification<Cake> minPriceSpecification =
                    CakeSpecification.priceGreaterThanOrEqual(minPrice);

            specification = specification == null
                    ? minPriceSpecification
                    : specification.and(minPriceSpecification);
        }

        // Filter by maximum price
        if (maxPrice != null) {

            Specification<Cake> maxPriceSpecification =
                    CakeSpecification.priceLessThanOrEqual(maxPrice);

            specification = specification == null
                    ? maxPriceSpecification
                    : specification.and(maxPriceSpecification);
        }

        // If no filters are provided, return all cakes
        List<Cake> cakes = specification == null
                ? cakeRepository.findAll()
                : cakeRepository.findAll(specification);

        return cakes.stream()
                .map(CakeResponse::fromEntity)
                .toList();
    }

    @Override
    public CakeResponse updateCake(
            Long id,
            CakeRequest request) {

        Cake cake = cakeRepository.findById(id)
                .orElseThrow(() ->
                        new CakeNotFoundException(
                                "Cake not found with id: " + id
                        )
                );

        cake.setName(request.name());
        cake.setDescription(request.description());
        cake.setCategory(request.category());
        cake.setPrice(request.price());
        cake.setAvailable(request.available());
        cake.setImageUrl(request.imageUrl());

        Cake updatedCake = cakeRepository.save(cake);

        return CakeResponse.fromEntity(updatedCake);
    }

    @Override
    public void deleteCake(Long id) {

        Cake cake = cakeRepository.findById(id)
                .orElseThrow(() ->
                        new CakeNotFoundException(
                                "Cake not found with id: " + id
                        )
                );

        cakeRepository.delete(cake);
    }
}