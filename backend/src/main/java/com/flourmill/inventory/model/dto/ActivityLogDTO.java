package com.flourmill.inventory.model.dto;

import com.flourmill.inventory.model.entity.ActivityLog;
import java.time.LocalDateTime;

public class ActivityLogDTO {

    private Long id;
    private Long productId;
    private String productName;
    private String action;
    private String details;
    private String oldValue;
    private String newValue;
    private LocalDateTime createdAt;

    public ActivityLogDTO() {}

    public static ActivityLogDTO fromEntity(ActivityLog entity) {
        ActivityLogDTO dto = new ActivityLogDTO();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProductName());
        dto.setAction(entity.getAction().name());
        dto.setDetails(entity.getDetails());
        dto.setOldValue(entity.getOldValue());
        dto.setNewValue(entity.getNewValue());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
