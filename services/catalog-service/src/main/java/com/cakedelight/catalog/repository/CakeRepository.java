package com.cakedelight.catalog.repository;

import com.cakedelight.catalog.entity.Cake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CakeRepository
        extends JpaRepository<Cake, Long>,
                JpaSpecificationExecutor<Cake> {
}