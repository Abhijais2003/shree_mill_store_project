package com.flourmill.inventory.service;

import com.flourmill.inventory.exception.BadRequestException;
import com.flourmill.inventory.exception.ResourceNotFoundException;
import com.flourmill.inventory.model.dto.BrandDTO;
import com.flourmill.inventory.model.entity.Brand;
import com.flourmill.inventory.repository.BrandRepository;
import com.flourmill.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    public BrandService(BrandRepository brandRepository, ProductRepository productRepository) {
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
    }

    public List<BrandDTO> getAll() {
        return brandRepository.findAll().stream()
                .map(BrandDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public BrandDTO getById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        return BrandDTO.fromEntity(brand);
    }

    public BrandDTO create(BrandDTO dto) {
        if (brandRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Brand with name '" + dto.getName() + "' already exists");
        }
        Brand brand = new Brand(dto.getName());
        return BrandDTO.fromEntity(brandRepository.save(brand));
    }

    public BrandDTO update(Long id, BrandDTO dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        brandRepository.findByNameIgnoreCase(dto.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Brand with name '" + dto.getName() + "' already exists");
            }
        });
        brand.setName(dto.getName());
        return BrandDTO.fromEntity(brandRepository.save(brand));
    }

    public void delete(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        long productCount = productRepository.countByBrandId(id);
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete brand '" + brand.getName()
                    + "' — it has " + productCount + " products");
        }
        brandRepository.delete(brand);
    }
}
