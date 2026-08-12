package com.cakedelight.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "baskets")
@Getter
@Setter
@NoArgsConstructor
public class Basket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @OneToMany(
            mappedBy = "basket",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<BasketItem> items = new ArrayList<>();
}