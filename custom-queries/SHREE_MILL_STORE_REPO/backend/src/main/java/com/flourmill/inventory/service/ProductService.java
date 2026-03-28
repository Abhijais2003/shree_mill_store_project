package com.flourmill.inventory.service;

import com.flourmill.inventory.exception.BadRequestException;
import com.flourmill.inventory.exception.ResourceNotFoundException;
import com.flourmill.inventory.model.dto.*;
import com.flourmill.inventory.model.entity.ActivityLog;
import com.flourmill.inventory.model.entity.Brand;
import com.flourmill.inventory.model.entity.Category;
import com.flourmill.inventory.model.entity.Product;
import com.flourmill.inventory.repository.BrandRepository;
import com.flourmill.inventory.repository.CategoryRepository;
import com.flourmill.inventory.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ActivityService activityService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository,
                          ActivityService activityService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.activityService = activityService;
    }

    public Page<ProductDTO> getAll(String search, Long categoryId, String type, String shape,
                                    Long brandId, BigDecimal minPrice, BigDecimal maxPrice,
                                    Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("type")), like),
                        cb.like(cb.lower(root.get("size")), like)
                ));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (shape != null && !shape.isBlank()) {
                predicates.add(cb.equal(root.get("shape"), shape));
            }
            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), brandId));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("unitPrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("unitPrice"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable).map(ProductDTO::fromEntity);
    }

    public ProductDTO getById(Long id) {
        Product product = findProductOrThrow(id);
        return ProductDTO.fromEntity(product);
    }

    @Transactional
    public ProductDTO create(ProductCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setCategory(category);
        product.setType(request.getType());
        product.setShape(request.getShape());
        product.setBrand(brand);
        product.setSize(request.getSize());
        product.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        product.setUnitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : BigDecimal.ZERO);
        product.setMinStock(request.getMinStock() != null ? request.getMinStock() : 5);
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());

        product = productRepository.save(product);

        activityService.log(product.getId(), product.getName(), ActivityLog.Action.CREATED,
                "Added new product: " + product.getName() + " (qty: " + product.getQuantity() + ")");

        return ProductDTO.fromEntity(product);
    }

    @Transactional
    public ProductDTO update(Long id, ProductUpdateRequest request) {
        Product product = findProductOrThrow(id);
        String oldName = product.getName();
        int oldQty = product.getQuantity();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));
        }

        product.setName(request.getName());
        product.setCategory(category);
        product.setType(request.getType());
        product.setShape(request.getShape());
        product.setBrand(brand);
        product.setSize(request.getSize());
        if (request.getQuantity() != null) product.setQuantity(request.getQuantity());
        if (request.getUnitPrice() != null) product.setUnitPrice(request.getUnitPrice());
        if (request.getMinStock() != null) product.setMinStock(request.getMinStock());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());

        product = productRepository.save(product);

        activityService.log(product.getId(), product.getName(), ActivityLog.Action.UPDATED,
                "Updated product: " + oldName + " → " + product.getName()
                        + " (qty: " + oldQty + " → " + product.getQuantity() + ")");

        return ProductDTO.fromEntity(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = findProductOrThrow(id);
        productRepository.delete(product);

        activityService.log(product.getId(), product.getName(), ActivityLog.Action.DELETED,
                "Deleted product: " + product.getName());
    }

    @Transactional
    public ProductDTO adjustStock(Long id, StockAdjustRequest request) {
        Product product = findProductOrThrow(id);
        int oldQty = product.getQuantity();
        int newQty = oldQty + request.getAdjustment();

        if (newQty < 0) {
            throw new BadRequestException("Stock cannot go below 0. Current: " + oldQty
                    + ", adjustment: " + request.getAdjustment());
        }

        product.setQuantity(newQty);
        product = productRepository.save(product);

        ActivityLog.Action action = request.getAdjustment() > 0
                ? ActivityLog.Action.STOCK_ADDED
                : ActivityLog.Action.STOCK_REMOVED;
        String reason = request.getReason() != null ? " (" + request.getReason() + ")" : "";
        activityService.log(product.getId(), product.getName(), action,
                "Stock adjusted: " + oldQty + " → " + newQty + reason);

        return ProductDTO.fromEntity(product);
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
}
