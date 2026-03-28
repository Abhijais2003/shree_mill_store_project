package com.flourmill.inventory.repository;

import com.flourmill.inventory.model.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Query("SELECT p FROM Product p WHERE p.quantity <= p.minStock")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.quantity <= p.minStock")
    Page<Product> findLowStockProducts(Pageable pageable);

    @Query("SELECT SUM(p.quantity) FROM Product p")
    Long sumTotalQuantity();

    @Query("SELECT SUM(p.quantity * p.unitPrice) FROM Product p")
    BigDecimal sumTotalValue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity <= p.minStock")
    long countLowStockProducts();

    long countByCategoryId(Long categoryId);
    long countByBrandId(Long brandId);
}
