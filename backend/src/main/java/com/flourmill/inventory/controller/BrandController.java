package com.flourmill.inventory.controller;

import com.flourmill.inventory.model.dto.BrandDTO;
import com.flourmill.inventory.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@Tag(name = "Brands", description = "Brand management")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    @Operation(summary = "List all brands")
    public List<BrandDTO> getAll() {
        return brandService.getAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public BrandDTO getById(@PathVariable Long id) {
        return brandService.getById(id);
    }

    @PostMapping
    @Operation(summary = "Create a new brand")
    public ResponseEntity<BrandDTO> create(@Valid @RequestBody BrandDTO dto) {
        BrandDTO created = brandService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a brand")
    public BrandDTO update(@PathVariable Long id, @Valid @RequestBody BrandDTO dto) {
        return brandService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a brand")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        brandService.delete(id);
    }
}
