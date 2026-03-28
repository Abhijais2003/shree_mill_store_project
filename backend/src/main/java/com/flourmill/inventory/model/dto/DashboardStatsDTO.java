package com.flourmill.inventory.model.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsDTO {

    private long totalProducts;
    private long totalQuantity;
    private BigDecimal totalValue;
    private long lowStockCount;
    private List<ProductDTO> lowStockItems;
    private List<ActivityLogDTO> recentActivity;
    private List<CategoryBreakdown> categoryBreakdown;

    public DashboardStatsDTO() {}

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
    public long getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(long totalQuantity) { this.totalQuantity = totalQuantity; }
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }
    public List<ProductDTO> getLowStockItems() { return lowStockItems; }
    public void setLowStockItems(List<ProductDTO> lowStockItems) { this.lowStockItems = lowStockItems; }
    public List<ActivityLogDTO> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<ActivityLogDTO> recentActivity) { this.recentActivity = recentActivity; }
    public List<CategoryBreakdown> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategoryBreakdown> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public static class CategoryBreakdown {
        private String category;
        private long count;
        private BigDecimal value;

        public CategoryBreakdown() {}

        public CategoryBreakdown(String category, long count, BigDecimal value) {
            this.category = category;
            this.count = count;
            this.value = value;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }
    }
}
