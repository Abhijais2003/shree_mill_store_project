package com.flourmill.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flourmill.inventory.model.entity.Brand;
import com.flourmill.inventory.model.entity.Category;
import com.flourmill.inventory.model.entity.Product;
import com.flourmill.inventory.repository.BrandRepository;
import com.flourmill.inventory.repository.CategoryRepository;
import com.flourmill.inventory.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    private Category beltCategory;
    private Brand fennerBrand;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        // Seeded by Flyway: Belt (id=1), Fenner (id=1), Goodyear (id=2), etc.
        beltCategory = categoryRepository.findById(1L).orElseThrow();
        fennerBrand = brandRepository.findById(1L).orElseThrow();
    }

    // ---- CREATE ----

    @Test
    void createProduct_withValidData_returns201() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "V-Belt A68",
                "categoryId", beltCategory.getId(),
                "type", "V-Belt",
                "shape", "V",
                "brandId", fennerBrand.getId(),
                "size", "A68",
                "quantity", 10,
                "unitPrice", 250.00,
                "minStock", 3
        );

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("V-Belt A68"))
                .andExpect(jsonPath("$.categoryId").value(beltCategory.getId()))
                .andExpect(jsonPath("$.categoryName").value("Belt"))
                .andExpect(jsonPath("$.type").value("V-Belt"))
                .andExpect(jsonPath("$.brandId").value(fennerBrand.getId()))
                .andExpect(jsonPath("$.brandName").value("Fenner"))
                .andExpect(jsonPath("$.quantity").value(10))
                .andExpect(jsonPath("$.unitPrice").value(250.00))
                .andExpect(jsonPath("$.minStock").value(3));
    }

    @Test
    void createProduct_withoutBrand_returns201() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Flat Belt 4 inch",
                "categoryId", beltCategory.getId(),
                "type", "Flat Belt"
        );

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.brandId").isEmpty())
                .andExpect(jsonPath("$.brandName").isEmpty());
    }

    @Test
    void createProduct_missingName_returns400() throws Exception {
        Map<String, Object> request = Map.of(
                "categoryId", beltCategory.getId(),
                "type", "V-Belt"
        );

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    void createProduct_missingCategory_returns400() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Test Belt",
                "type", "V-Belt"
        );

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.categoryId").exists());
    }

    @Test
    void createProduct_missingType_returns400() throws Exception {
        String json = "{\"name\": \"Test Belt\", \"categoryId\": " + beltCategory.getId() + "}";

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.type").exists());
    }

    @Test
    void createProduct_nonExistentCategory_returns404() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Test Belt",
                "categoryId", 9999,
                "type", "V-Belt"
        );

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Category not found")));
    }

    // ---- GET BY ID ----

    @Test
    void getProductById_existing_returns200() throws Exception {
        Product product = createTestProduct("V-Belt B60", 5);

        mockMvc.perform(get("/api/v1/products/{id}", product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(product.getId()))
                .andExpect(jsonPath("$.name").value("V-Belt B60"))
                .andExpect(jsonPath("$.quantity").value(5));
    }

    @Test
    void getProductById_nonExistent_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/products/{id}", 99999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Product not found")));
    }

    // ---- LIST WITH PAGINATION ----

    @Test
    void listProducts_withPagination_returns200() throws Exception {
        for (int i = 1; i <= 25; i++) {
            createTestProduct("Belt-" + String.format("%02d", i), i);
        }

        mockMvc.perform(get("/api/v1/products")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(3));
    }

    @Test
    void listProducts_withSearchFilter_returns200() throws Exception {
        createTestProduct("Fenner V-Belt A68", 10);
        createTestProduct("Goodyear Flat Belt", 5);

        mockMvc.perform(get("/api/v1/products")
                        .param("search", "fenner"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Fenner V-Belt A68"));
    }

    @Test
    void listProducts_withCategoryFilter_returns200() throws Exception {
        createTestProduct("Test Belt", 10);

        mockMvc.perform(get("/api/v1/products")
                        .param("categoryId", String.valueOf(beltCategory.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[*].categoryId", everyItem(is(beltCategory.getId().intValue()))));
    }

    // ---- UPDATE ----

    @Test
    void updateProduct_withValidData_returns200() throws Exception {
        Product product = createTestProduct("Old Name", 10);

        Map<String, Object> request = Map.of(
                "name", "New Name",
                "categoryId", beltCategory.getId(),
                "type", "Flat Belt",
                "quantity", 20,
                "unitPrice", 500.00,
                "minStock", 5
        );

        mockMvc.perform(put("/api/v1/products/{id}", product.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"))
                .andExpect(jsonPath("$.type").value("Flat Belt"))
                .andExpect(jsonPath("$.quantity").value(20))
                .andExpect(jsonPath("$.unitPrice").value(500.00));
    }

    @Test
    void updateProduct_nonExistent_returns404() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Does Not Exist",
                "categoryId", beltCategory.getId(),
                "type", "V-Belt"
        );

        mockMvc.perform(put("/api/v1/products/{id}", 99999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    // ---- DELETE ----

    @Test
    void deleteProduct_existing_returns204() throws Exception {
        Product product = createTestProduct("To Delete", 1);

        mockMvc.perform(delete("/api/v1/products/{id}", product.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/products/{id}", product.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteProduct_nonExistent_returns404() throws Exception {
        mockMvc.perform(delete("/api/v1/products/{id}", 99999))
                .andExpect(status().isNotFound());
    }

    // ---- STOCK ADJUST ----

    @Test
    void adjustStock_positiveAdjustment_returns200() throws Exception {
        Product product = createTestProduct("Stock Belt", 10);

        Map<String, Object> request = Map.of(
                "adjustment", 5,
                "reason", "Received shipment"
        );

        mockMvc.perform(patch("/api/v1/products/{id}/stock", product.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(15));
    }

    @Test
    void adjustStock_negativeAdjustment_returns200() throws Exception {
        Product product = createTestProduct("Stock Belt", 10);

        Map<String, Object> request = Map.of(
                "adjustment", -3,
                "reason", "Sold to customer"
        );

        mockMvc.perform(patch("/api/v1/products/{id}/stock", product.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(7));
    }

    @Test
    void adjustStock_belowZero_returns400() throws Exception {
        Product product = createTestProduct("Low Stock Belt", 2);

        Map<String, Object> request = Map.of(
                "adjustment", -5,
                "reason", "Over-sell attempt"
        );

        mockMvc.perform(patch("/api/v1/products/{id}/stock", product.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Stock cannot go below 0")));
    }

    @Test
    void adjustStock_missingAdjustment_returns400() throws Exception {
        Product product = createTestProduct("Stock Belt", 10);

        String json = "{\"reason\": \"no adjustment value\"}";

        mockMvc.perform(patch("/api/v1/products/{id}/stock", product.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.adjustment").exists());
    }

    @Test
    void adjustStock_nonExistentProduct_returns404() throws Exception {
        Map<String, Object> request = Map.of("adjustment", 1);

        mockMvc.perform(patch("/api/v1/products/{id}/stock", 99999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    // ---- Helper ----

    private Product createTestProduct(String name, int quantity) {
        Product product = new Product();
        product.setName(name);
        product.setCategory(beltCategory);
        product.setType("V-Belt");
        product.setBrand(fennerBrand);
        product.setSize("A68");
        product.setQuantity(quantity);
        product.setUnitPrice(new BigDecimal("150.00"));
        product.setMinStock(5);
        return productRepository.save(product);
    }
}
