package com.flourmill.inventory.service;

import com.flourmill.inventory.model.dto.OcrResultDTO;
import com.flourmill.inventory.ocr.BillParser;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class OcrService {

    @Value("${ocr.tessdata-path:}")
    private String tessdataPath;

    @Value("${ocr.language:eng}")
    private String language;

    public OcrResultDTO scanBill(MultipartFile file) {
        List<String> warnings = new ArrayList<>();
        String rawText;

        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IOException("Could not read image from uploaded file");
            }

            Tesseract tesseract = new Tesseract();
            if (tessdataPath != null && !tessdataPath.isBlank()) {
                tesseract.setDatapath(tessdataPath);
            }
            tesseract.setLanguage(language);
            tesseract.setPageSegMode(6); // Assume uniform block of text

            rawText = tesseract.doOCR(image);

        } catch (TesseractException e) {
            // If Tesseract is not installed, return a helpful message
            rawText = "";
            warnings.add("OCR engine not available. Please install Tesseract OCR. Error: " + e.getMessage());
        } catch (IOException e) {
            rawText = "";
            warnings.add("Could not read uploaded image: " + e.getMessage());
        }

        List<OcrResultDTO.OcrItem> items = new ArrayList<>();
        if (!rawText.isBlank()) {
            items = BillParser.parse(rawText);
            if (items.isEmpty()) {
                warnings.add("Could not extract any items from the bill. Please verify manually.");
            } else {
                warnings.add("Please verify all extracted data before saving.");
            }
        }

        return new OcrResultDTO(rawText, items, warnings);
    }
}
