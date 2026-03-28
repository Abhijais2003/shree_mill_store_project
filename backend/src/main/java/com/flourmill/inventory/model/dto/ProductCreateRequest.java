package com.flourmill.inventory.model.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProductCreateRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must be under 255 characters")
    private String name;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Type is required")
    @Size(max = 100, message = "Type must be under 100 characters")
    private String type;

    @Size(max = 100, message = "Shape must be under 100 characters")
    private String shape;

    private Long brandId;

    @Size(max = 50, message = "Size must be under 50 characters")
    private String size;

    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity = 0;

    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Min(value = 0, message = "Minimum stock cannot be negative")
    private Integer minStock = 5;

    @Size(max = 1000, message = "Description must be under 1000 characters")
    private String description;

    @Size(max = 500, message = "Image URL must be under 500 characters")
    private String imageUrl;

    public ProductCreateRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getShape() { return shape; }
    public void setShape(String shape) { this.shape = shape; }
    public Long getBrandId() { return brandId; }
    public void setBrandId(Long brandId) { this.brandId = brandId; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Integer getMinStock() { return minStock; }
    public void setMinStock(Integer minStock) { this.minStock = minStock; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
