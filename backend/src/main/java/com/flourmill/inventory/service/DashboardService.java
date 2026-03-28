package com.flourmill.inventory.service;

import com.flourmill.inventory.model.dto.ActivityLogDTO;
import com.flourmill.inventory.model.dto.DashboardStatsDTO;
import com.flourmill.inventory.model.dto.ProductDTO;
import com.flourmill.inventory.model.entity.Product;
import com.flourmill.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final ActivityService activityService;

    public DashboardService(ProductRepository productRepository, ActivityService activityService) {
        this.productRepository = productRepository;
        this.activityService = activityService;
    }

    public DashboardStatsDTO getStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalProducts(productRepository.count());

        Long totalQty = productRepository.sumTotalQuantity();
        stats.setTotalQuantity(totalQty != null ? totalQty : 0L);

        BigDecimal totalValue = productRepository.sumTotalValue();
        stats.setTotalValue(totalValue != null ? totalValue : BigDecimal.ZERO);

        stats.setLowStockCount(productRepository.countLowStockProducts());

        List<ProductDTO> lowStockItems = productRepository.findLowStockProducts().stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
        stats.setLowStockItems(lowStockItems);

        List<ActivityLogDTO> recentActivity = activityService.getRecentActivity();
        stats.setRecentActivity(recentActivity);

        // Category breakdown
        List<Product> allProducts = productRepository.findAll();
        Map<String, List<Product>> byCategory = allProducts.stream()
                .collect(Collectors.groupingBy(p -> p.getCategory().getName()));
        List<DashboardStatsDTO.CategoryBreakdown> breakdown = byCategory.entrySet().stream()
                .map(entry -> {
                    long count = entry.getValue().size();
                    BigDecimal value = entry.getValue().stream()
                            .map(p -> p.getUnitPrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new DashboardStatsDTO.CategoryBreakdown(entry.getKey(), count, value);
                })
                .collect(Collectors.toList());
        stats.setCategoryBreakdown(breakdown);

        return stats;
    }
}
