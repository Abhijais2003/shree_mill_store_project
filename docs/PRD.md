# Product Requirements Document (PRD)
# Shree Mill Store — Inventory Management System

**Version:** 1.0
**Date:** 2026-03-28
**Author:** Product Manager Agent
**Status:** Draft — Awaiting Review

---

## 1. Executive Summary

Shree Mill Store is a flour mill machinery parts shop that currently has no digital inventory tracking. The owner and 1–3 staff members need a simple, mobile-friendly system to track stock levels, manage products, and digitize purchase bills. The MVP focuses on **belt inventory tracking**, with an architecture designed to extend to polishers, pattars, and other machinery parts in subsequent releases.

---

## 2. Problem Statement

- **No visibility into current stock** — the store relies on memory and physical inspection to know what's in stock.
- **No low-stock alerts** — items run out without warning, leading to missed sales.
- **Manual bill processing** — purchase bills (from suppliers) are paper-only; entering items into any system is tedious.
- **No history** — no record of when items were added, sold, or adjusted.

---

## 3. Users & Personas

| Persona | Description | Primary Device | Tech Comfort |
|---------|-------------|----------------|--------------|
| **Store Owner (Father)** | Makes purchasing decisions, needs stock overview | Android phone | Low |
| **Store Staff (1–2)** | Updates inventory when goods arrive or are sold | Android phone | Low–Medium |

### Key User Characteristics
- Non-technical — the UI must be extremely simple with large tap targets
- Primarily mobile (Android phones) — desktop is secondary
- Hindi-speaking, but comfortable with simple English labels
- Will use the app multiple times per day for quick stock updates

---

## 4. User Stories

### 4.1 Dashboard
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|-------------------|
| US-01 | As a store owner, I want to see total inventory count and value at a glance | Must | Dashboard shows total items, total value, and item count by category |
| US-02 | As a store owner, I want to see items that are running low | Must | Dashboard shows a "Low Stock" section listing items where quantity ≤ minStock |
| US-03 | As a store owner, I want to see recent activity | Should | Dashboard shows the last 10 inventory changes (additions, removals, edits) |

### 4.2 Belt Inventory Management
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|-------------------|
| US-04 | As staff, I want to view all belts in a searchable list | Must | Table with search bar; results update as I type |
| US-05 | As staff, I want to filter belts by type, shape, brand, size, and price range | Must | Filter panel with dropdowns and range slider; filters combine with AND logic |
| US-06 | As staff, I want to add a new belt to inventory | Must | Form with validated fields; success toast on save; belt appears in list |
| US-07 | As staff, I want to edit an existing belt's details | Must | Pre-filled edit form; changes reflected immediately in list |
| US-08 | As staff, I want to delete a belt from inventory | Must | Confirmation dialog before delete; belt removed from list |
| US-09 | As staff, I want to quickly adjust stock quantity (+ / −) without opening the full edit form | Should | Inline quantity buttons on list rows; optimistic UI update |

### 4.3 Bill Scanner (OCR)
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|-------------------|
| US-10 | As staff, I want to photograph a purchase bill and have items extracted automatically | Must | Camera opens, captures image, sends to OCR, returns extracted items |
| US-11 | As staff, I want to review and correct extracted data before saving | Must | Editable table of extracted items; user confirms before inventory update |
| US-12 | As staff, I want extracted items to match existing products where possible | Should | System suggests matching products; user can accept or create new |

### 4.4 Activity Log
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|-------------------|
| US-13 | As a store owner, I want to see a full history of all inventory changes | Must | Paginated list showing what changed, who changed it, and when |
| US-14 | As a store owner, I want to filter activity by date range and action type | Should | Date picker and action-type dropdown filter the activity list |

### 4.5 Settings & Configuration
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|-------------------|
| US-15 | As a store owner, I want to manage belt types (add/edit/delete) | Must | CRUD interface for types |
| US-16 | As a store owner, I want to manage brands (add/edit/delete) | Must | CRUD interface for brands |
| US-17 | As a store owner, I want to manage product categories | Should | CRUD interface for categories (prepares for future product types) |

---

## 5. MoSCoW Prioritization

### Must Have (MVP)
- Dashboard with stock overview and low-stock alerts
- Belt CRUD (add, view, edit, delete)
- Search and filter on belt list
- Bill scanner with OCR extraction
- Review/confirm scanned data before saving
- Activity log (basic)
- Belt type and brand management
- Mobile-responsive design
- PWA support (installable on phone)

### Should Have
- Quick quantity adjust (inline +/−)
- Recent activity on dashboard
- Activity log filtering
- Category management (for future extensibility)
- Product matching on OCR results

### Could Have
- Barcode/QR scanning
- Export inventory to CSV/Excel
- Multi-language support (Hindi)
- Dark mode

### Won't Have (This Release)
- User authentication / multi-user roles
- Sales tracking / billing
- Supplier management
- Purchase order management
- Cloud sync / multi-device real-time sync

---

## 6. Data Model

### 6.1 Core Entities

```
Category {
  id:          Long (PK, auto-generated)
  name:        String (unique, required) — e.g., "Belt", "Polisher", "Pattar"
  description: String (optional)
  createdAt:   Timestamp
  updatedAt:   Timestamp
}

Brand {
  id:          Long (PK, auto-generated)
  name:        String (unique, required) — e.g., "Fenner", "Goodyear", "Super"
  createdAt:   Timestamp
  updatedAt:   Timestamp
}

Product {
  id:          Long (PK, auto-generated)
  name:        String (required) — e.g., "Fenner V-Belt A-36"
  category:    Category (FK, required)
  type:        String (required) — e.g., "Flat Belt", "V-Belt", "Round Belt"
  shape:       String — e.g., "Flat", "V-Shape", "Round"
  brand:       Brand (FK)
  size:        String — e.g., "A-36", "B-48", "C-60"
  quantity:    Integer (default 0, >= 0)
  unitPrice:   BigDecimal (>= 0)
  minStock:    Integer (default 5) — low-stock alert threshold
  description: String (optional notes)
  imageUrl:    String (optional)
  createdAt:   Timestamp
  updatedAt:   Timestamp
}

ActivityLog {
  id:          Long (PK, auto-generated)
  productId:   Long (FK to Product, nullable — product may be deleted)
  productName: String — snapshot of product name at time of action
  action:      Enum (CREATED, UPDATED, DELETED, STOCK_ADDED, STOCK_REMOVED)
  details:     String — human-readable change description
  oldValue:    String (JSON, optional) — previous state
  newValue:    String (JSON, optional) — new state
  createdAt:   Timestamp
}
```

### 6.2 Seed Data (Belt Types)

**Types:** Flat Belt, V-Belt, Round Belt, Timing Belt, Link Belt
**Shapes:** Flat, V-Shape, Round, Toothed
**Common Brands:** Fenner, Goodyear, Super, PIX, Bando, Gates, Local/Unbranded
**Common Sizes:** A-section (A-26 to A-100), B-section (B-30 to B-120), C-section (C-50 to C-150)

### 6.3 Default Category
The system ships with a "Belt" category pre-created. Additional categories (Polisher, Pattar, etc.) can be added via Settings.

---

## 7. Bill Scanner — OCR Flow

### Flow:
1. User taps "Scan Bill" button
2. Device camera opens (rear camera preferred)
3. User photographs the purchase bill
4. Image is sent to backend `/api/v1/ocr/scan`
5. Backend uses Tesseract OCR to extract text
6. Backend parses extracted text to identify:
   - Item names (belt types/brands/sizes)
   - Quantities
   - Unit prices
7. Structured JSON is returned to frontend
8. User sees an editable table of extracted items
9. User corrects any errors, maps items to existing products (or creates new)
10. User confirms → inventory is updated in bulk

### OCR Response Structure:
```json
{
  "rawText": "Full extracted text...",
  "items": [
    {
      "name": "Fenner V-Belt A-36",
      "quantity": 10,
      "unitPrice": 150.00,
      "confidence": 0.85
    }
  ],
  "warnings": ["Some text was unclear — please verify quantities"]
}
```

---

## 8. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load time | < 2 seconds on 4G |
| Mobile viewport support | 320px – 1440px |
| Offline capability | Basic PWA caching (view last-loaded data) |
| Data persistence | H2 for dev; PostgreSQL-ready schema |
| API response time | < 500ms for CRUD operations |
| Image upload size | Max 10MB per bill image |
| Browser support | Chrome (Android), Safari (iOS), Chrome/Firefox (desktop) |

---

## 9. UI/UX Guidelines

- **Large touch targets** — minimum 44px × 44px for all interactive elements
- **Simple language** — "Add Item", "Stock Count", not "Create Product Entity"
- **Confirmation dialogs** — before any destructive action (delete, bulk update)
- **Success feedback** — toast notification on every successful action
- **Empty states** — helpful messages when lists are empty ("No belts added yet. Tap + to add your first belt.")
- **Color coding** — Red for low stock, Green for healthy stock, Yellow for approaching threshold

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| All inventory digitized | Within 1 week of deployment |
| Daily active usage | At least 1 session/day by store staff |
| Stock-out incidents | Reduced by 50% within first month |
| Time to enter a purchase bill | < 2 minutes (with OCR) vs. manual entry |

---

## 11. Future Roadmap (Post-MVP)

1. **Phase 2:** Add Polisher and Pattar inventory (using existing category system)
2. **Phase 3:** User authentication and role-based access
3. **Phase 4:** Sales tracking and basic billing
4. **Phase 5:** Supplier management and purchase orders
5. **Phase 6:** Analytics dashboard (sales trends, popular items, reorder suggestions)
6. **Phase 7:** Multi-language support (Hindi)

---

## 12. Open Questions

1. Should we support multiple stores/locations in the future?
2. Do we need barcode support for any products?
3. What is the typical format of purchase bills? (Needed to train OCR parsing)
4. Should deleted products be soft-deleted (hidden but recoverable)?

---

*This PRD is ready for review. Please approve or request changes before proceeding to Phase 2 (Architecture & Build).*
