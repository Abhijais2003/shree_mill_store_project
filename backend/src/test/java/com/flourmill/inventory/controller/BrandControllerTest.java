package com.flourmill.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flourmill.inventory.model.entity.Brand;
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
class BrandControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        // Keep seeded brands (Fenner=1, Goodyear=2, PIX=3, Bando=4, Gates=5, Super=6, Local/Unbranded=7)
        // Remove any test-created brands
        brandRepository.findAll().stream()
                .filter(b -> b.getId() > 7L)
                .forEach(brandRepository::delete);
    }

    // ---- CREATE ----

    @Test
    void createBrand_withValidData_returns201() throws Exception {
        Map<String, Object> request = Map.of("name", "Continental");

        mockMvc.perform(post("/api/v1/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Continental"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    void createBrand_missingName_returns400() throws Exception {
        String json = "{}";

        mockMvc.perform(post("/api/v1/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    void createBrand_duplicateName_returns400() throws Exception {
        Map<String, Object> request = Map.of("name", "Fenner");

        mockMvc.perform(post("/api/v1/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    void createBrand_duplicateNameCaseInsensitive_returns400() throws Exception {
        Map<String, Object> request = Map.of("name", "fenner");

        mockMvc.perform(post("/api/v1/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    // ---- LIST ----

    @Test
    void listBrands_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(7))))
                .andExpect(jsonPath("$[0].name").value("Fenner"));
    }

    // ---- GET BY ID ----

    @Test
    void getBrandById_existing_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/brands/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Fenner"));
    }

    @Test
    void getBrandById_goodyear_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/brands/{id}", 2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("Goodyear"));
    }

    @Test
    void getBrandById_nonExistent_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/brands/{id}", 99999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Brand not found")));
    }

    // ---- UPDATE ----

    @Test
    void updateBrand_withValidData_returns200() throws Exception {
        Brand brand = brandRepository.save(new Brand("TestBrand"));

        Map<String, Object> request = Map.of("name", "TestBrandRenamed");

        mockMvc.perform(put("/api/v1/brands/{id}", brand.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("TestBrandRenamed"));
    }

    @Test
    void updateBrand_nonExistent_returns404() throws Exception {
        Map<String, Object> request = Map.of("name", "Ghost");

        mockMvc.perform(put("/api/v1/brands/{id}", 99999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateBrand_duplicateName_returns400() throws Exception {
        Brand brand = brandRepository.save(new Brand("UniqueBrand"));

        // Try to rename to "Fenner" which already exists
        Map<String, Object> request = Map.of("name", "Fenner");

        mockMvc.perform(put("/api/v1/brands/{id}", brand.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    // ---- DELETE ----

    @Test
    void deleteBrand_withNoProducts_returns204() throws Exception {
        Brand brand = brandRepository.save(new Brand("Disposable"));

        mockMvc.perform(delete("/api/v1/brands/{id}", brand.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/brands/{id}", brand.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteBrand_withProducts_returns400() throws Exception {
        Brand fenner = brandRepository.findById(1L).orElseThrow();

        Product product = new Product();
        product.setName("Fenner V-Belt for Delete Test");
        product.setCategory(categoryRepository.findById(1L).orElseThrow());
        product.setType("V-Belt");
        product.setBrand(fenner);
        product.setQuantity(1);
        product.setUnitPrice(BigDecimal.TEN);
        product.setMinStock(1);
        productRepository.save(product);

        mockMvc.perform(delete("/api/v1/brands/{id}", fenner.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("has")))
                .andExpect(jsonPath("$.message", containsString("products")));
    }

    @Test
    void deleteBrand_nonExistent_returns404() throws Exception {
        mockMvc.perform(delete("/api/v1/brands/{id}", 99999))
                .andExpect(status().isNotFound());
    }
}
