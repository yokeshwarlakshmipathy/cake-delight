package com.cakedelight.catalog.controller;

import com.cakedelight.catalog.dto.CakeRequest;
import com.cakedelight.catalog.dto.CakeResponse;
import com.cakedelight.catalog.service.CakeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/cakes")
@RequiredArgsConstructor
public class CakeController {

    private final CakeService cakeService;

    // Create a new cake
    @PostMapping
    public ResponseEntity<CakeResponse> createCake(
            @Valid @RequestBody CakeRequest request) {

        CakeResponse response = cakeService.createCake(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get all cakes / filter cakes
    @GetMapping
    public ResponseEntity<List<CakeResponse>> getCakes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        List<CakeResponse> cakes = cakeService.searchCakes(
                name,
                category,
                minPrice,
                maxPrice
        );

        return ResponseEntity.ok(cakes);
    }

    // Get cake by ID
    @GetMapping("/{id}")
    public ResponseEntity<CakeResponse> getCakeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                cakeService.getCakeById(id)
        );
    }

    // Update cake
    @PutMapping("/{id}")
    public ResponseEntity<CakeResponse> updateCake(
            @PathVariable Long id,
            @Valid @RequestBody CakeRequest request) {

        return ResponseEntity.ok(
                cakeService.updateCake(id, request)
        );
    }

    // Delete cake
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCake(
            @PathVariable Long id) {

        cakeService.deleteCake(id);

        return ResponseEntity.noContent().build();
    }
}