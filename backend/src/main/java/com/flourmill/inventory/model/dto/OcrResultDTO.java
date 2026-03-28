package com.flourmill.inventory.model.dto;

import java.math.BigDecimal;
import java.util.List;

public class OcrResultDTO {

    private String rawText;
    private List<OcrItem> items;
    private List<String> warnings;

    public OcrResultDTO() {}

    public OcrResultDTO(String rawText, List<OcrItem> items, List<String> warnings) {
        this.rawText = rawText;
        this.items = items;
        this.warnings = warnings;
    }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }
    public List<OcrItem> getItems() { return items; }
    public void setItems(List<OcrItem> items) { this.items = items; }
    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }

    public static class OcrItem {
        private String name;
        private Integer quantity;
        private BigDecimal unitPrice;
        private Double confidence;

        public OcrItem() {}

        public OcrItem(String name, Integer quantity, BigDecimal unitPrice, Double confidence) {
            this.name = name;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.confidence = confidence;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
    }
}
