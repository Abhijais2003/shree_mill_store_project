package com.flourmill.inventory.model.dto;

import com.flourmill.inventory.model.entity.Brand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class BrandDTO {

    private Long id;

    @NotBlank(message = "Brand name is required")
    @Size(max = 100, message = "Brand name must be under 100 characters")
    private String name;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BrandDTO() {}

    public static BrandDTO fromEntity(Brand entity) {
        BrandDTO dto = new BrandDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
