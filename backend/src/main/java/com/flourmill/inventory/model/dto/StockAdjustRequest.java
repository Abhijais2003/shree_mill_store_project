package com.flourmill.inventory.model.dto;

import jakarta.validation.constraints.NotNull;

public class StockAdjustRequest {

    @NotNull(message = "Adjustment amount is required")
    private Integer adjustment;

    private String reason;

    public StockAdjustRequest() {}

    public Integer getAdjustment() { return adjustment; }
    public void setAdjustment(Integer adjustment) { this.adjustment = adjustment; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
