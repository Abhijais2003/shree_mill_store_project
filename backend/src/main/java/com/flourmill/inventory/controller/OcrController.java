package com.flourmill.inventory.controller;

import com.flourmill.inventory.model.dto.OcrResultDTO;
import com.flourmill.inventory.service.OcrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ocr")
@Tag(name = "OCR", description = "Bill scanning and text extraction")
public class OcrController {

    private final OcrService ocrService;

    public OcrController(OcrService ocrService) {
        this.ocrService = ocrService;
    }

    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Scan a bill image and extract items")
    public OcrResultDTO scanBill(@RequestParam("file") MultipartFile file) {
        return ocrService.scanBill(file);
    }
}
