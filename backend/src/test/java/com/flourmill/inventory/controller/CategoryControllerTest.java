package com.flourmill.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flourmill.inventory.model.entity.Category;
import com.flourmill.inventory.model.entity.Product;
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
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        // Delete all categories except the seeded "Belt" (id=1)
        categoryRepository.findAll().stream()
                .filter(c -> c.getId() != 1L)
                .forEach(categoryRepository::delete);
    }

    // ---- CREATE ----

    @Test
    void createCategory_withValidData_returns201() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Polisher",
                "description", "Polishing equipment and parts"
        );

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Polisher"))
                .andExpect(jsonPath("$.description").value("Polishing equipment and parts"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    void createCategory_missingName_returns400() throws Exception {
        String json = "{\"description\": \"No name provided\"}";

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    void createCategory_duplicateName_returns400() throws Exception {
        // "Belt" is seeded by migration
        Map<String, Object> request = Map.of("name", "Belt");

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    void createCategory_duplicateNameCaseInsensitive_returns400() throws Exception {
        Map<String, Object> request = Map.of("name", "belt");

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    // ---- LIST ----

    @Test
    void listCategories_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name").value("Belt"));
    }

    // ---- GET BY ID ----

    @Test
    void getCategoryById_existing_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/categories/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Belt"));
    }

    @Test
    void getCategoryById_nonExistent_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/categories/{id}", 99999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Category not found")));
    }

    // ---- UPDATE ----

    @Test
    void updateCategory_withValidData_returns200() throws Exception {
        // Create a category to update
        Category category = categoryRepository.save(new Category("Sieve", "Sieve parts"));

        Map<String, Object> request = Map.of(
                "name", "Sieve Updated",
                "description", "Updated sieve description"
        );

        mockMvc.perform(put("/api/v1/categories/{id}", category.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Sieve Updated"))
                .andExpect(jsonPath("$.description").value("Updated sieve description"));
    }

    @Test
    void updateCategory_nonExistent_returns404() throws Exception {
        Map<String, Object> request = Map.of("name", "Ghost");

        mockMvc.perform(put("/api/v1/categories/{id}", 99999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateCategory_duplicateName_returns400() throws Exception {
        Category other = categoryRepository.save(new Category("Motor", "Motor parts"));

        // Try to rename "Motor" to "Belt" which already exists
        Map<String, Object> request = Map.of("name", "Belt");

        mockMvc.perform(put("/api/v1/categories/{id}", other.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    // ---- DELETE ----

    @Test
    void deleteCategory_withNoProducts_returns204() throws Exception {
        Category category = categoryRepository.save(new Category("Temporary", "To be deleted"));

        mockMvc.perform(delete("/api/v1/categories/{id}", category.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/categories/{id}", category.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCategory_withProducts_returns400() throws Exception {
        Category beltCategory = categoryRepository.findById(1L).orElseThrow();

        // Create a product under "Belt" category
        Product product = new Product();
        product.setName("Test Belt for Delete");
        product.setCategory(beltCategory);
        product.setType("V-Belt");
        product.setQuantity(1);
        product.setUnitPrice(BigDecimal.TEN);
        product.setMinStock(1);
        productRepository.save(product);

        mockMvc.perform(delete("/api/v1/categories/{id}", beltCategory.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("has")))
                .andExpect(jsonPath("$.message", containsString("products")));
    }

    @Test
    void deleteCategory_nonExistent_returns404() throws Exception {
        mockMvc.perform(delete("/api/v1/categories/{id}", 99999))
                .andExpect(status().isNotFound());
    }
}
