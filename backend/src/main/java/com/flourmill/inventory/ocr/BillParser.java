package com.flourmill.inventory.ocr;

import com.flourmill.inventory.model.dto.OcrResultDTO;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses raw OCR text from purchase bills to extract product items.
 * Looks for patterns like: item name, quantity, price per line.
 */
public class BillParser {

    // Pattern: captures lines with a product description followed by numbers (qty, price)
    // Example line: "V-Belt A-36    10    150.00"
    // Or: "Fenner Flat Belt B-48  5  Rs. 250"
    private static final Pattern LINE_PATTERN = Pattern.compile(
            "^(.+?)\\s+(\\d+)\\s+(?:Rs\\.?\\s*)?([\\d,]+\\.?\\d*)\\s*$",
            Pattern.MULTILINE
    );

    // Simpler pattern: "item x qty @ price" or "item - qty - price"
    private static final Pattern ALT_PATTERN = Pattern.compile(
            "^(.+?)\\s*[xX×-]\\s*(\\d+)\\s*[@-]?\\s*(?:Rs\\.?\\s*)?([\\d,]+\\.?\\d*)\\s*$",
            Pattern.MULTILINE
    );

    public static List<OcrResultDTO.OcrItem> parse(String rawText) {
        List<OcrResultDTO.OcrItem> items = new ArrayList<>();

        // Try primary pattern first
        Matcher matcher = LINE_PATTERN.matcher(rawText);
        while (matcher.find()) {
            OcrResultDTO.OcrItem item = extractItem(matcher);
            if (item != null) {
                items.add(item);
            }
        }

        // If no matches, try alternative pattern
        if (items.isEmpty()) {
            matcher = ALT_PATTERN.matcher(rawText);
            while (matcher.find()) {
                OcrResultDTO.OcrItem item = extractItem(matcher);
                if (item != null) {
                    items.add(item);
                }
            }
        }

        return items;
    }

    private static OcrResultDTO.OcrItem extractItem(Matcher matcher) {
        try {
            String name = matcher.group(1).trim();
            int quantity = Integer.parseInt(matcher.group(2).trim());
            String priceStr = matcher.group(3).trim().replace(",", "");
            BigDecimal price = new BigDecimal(priceStr);

            // Filter out likely header/footer lines
            if (name.length() < 2 || name.matches("(?i)^(total|subtotal|tax|gst|s\\.?no|sr|amount|qty|rate).*")) {
                return null;
            }

            // Confidence is based on name length and reasonable values
            double confidence = 0.7;
            if (name.length() > 5) confidence += 0.1;
            if (quantity > 0 && quantity < 1000) confidence += 0.1;
            if (price.compareTo(BigDecimal.ZERO) > 0) confidence += 0.1;

            return new OcrResultDTO.OcrItem(name, quantity, price, Math.min(confidence, 1.0));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
