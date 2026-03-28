# Architecture Document
# Shree Mill Store — Inventory Management System

**Version:** 1.0
**Date:** 2026-03-28

---

## 1. System Overview

A monorepo containing a Spring Boot REST API backend and a React SPA frontend. The backend serves data via JSON APIs; the frontend consumes them. Both run independently during development and can be deployed separately.

```
┌─────────────────┐         ┌─────────────────────┐
│   React SPA     │  HTTP   │  Spring Boot API     │
│   (Vite/TS)     │◄───────►│  (Java 17)           │
│   Port 5173     │  JSON   │  Port 8080           │
└─────────────────┘         └──────────┬───────────┘
                                       │ JPA
                                       ▼
                            ┌─────────────────────┐
                            │  H2 (dev) /          │
                            │  PostgreSQL (prod)   │
                            └─────────────────────┘
```

---

## 2. Project Structure

```
flour-mill-inventory/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── CODE-REVIEW.md
│   ├── TEST-REPORT.md
│   └── UAT-REPORT.md
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/flourmill/inventory/
│       │   │   ├── InventoryApplication.java
│       │   │   ├── config/
│       │   │   │   ├── CorsConfig.java
│       │   │   │   └── SwaggerConfig.java
│       │   │   ├── controller/
│       │   │   │   ├── ProductController.java
│       │   │   │   ├── CategoryController.java
│       │   │   │   ├── BrandController.java
│       │   │   │   ├── OcrController.java
│       │   │   │   ├── ActivityController.java
│       │   │   │   └── DashboardController.java
│       │   │   ├── service/
│       │   │   │   ├── ProductService.java
│       │   │   │   ├── CategoryService.java
│       │   │   │   ├── BrandService.java
│       │   │   │   ├── OcrService.java
│       │   │   │   ├── ActivityService.java
│       │   │   │   └── DashboardService.java
│       │   │   ├── repository/
│       │   │   │   ├── ProductRepository.java
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   ├── BrandRepository.java
│       │   │   │   └── ActivityLogRepository.java
│       │   │   ├── model/
│       │   │   │   ├── entity/
│       │   │   │   │   ├── Product.java
│       │   │   │   │   ├── Category.java
│       │   │   │   │   ├── Brand.java
│       │   │   │   │   └── ActivityLog.java
│       │   │   │   └── dto/
│       │   │   │       ├── ProductDTO.java
│       │   │   │       ├── ProductCreateRequest.java
│       │   │   │       ├── ProductUpdateRequest.java
│       │   │   │       ├── CategoryDTO.java
│       │   │   │       ├── BrandDTO.java
│       │   │   │       ├── OcrResultDTO.java
│       │   │   │       ├── ActivityLogDTO.java
│       │   │   │       ├── DashboardStatsDTO.java
│       │   │   │       └── StockAdjustRequest.java
│       │   │   ├── exception/
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   ├── ResourceNotFoundException.java
│       │   │   │   └── BadRequestException.java
│       │   │   └── ocr/
│       │   │       └── BillParser.java
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-dev.yml
│       │       ├── application-prod.yml
│       │       └── db/migration/
│       │           └── V1__init_schema.sql
│       └── test/
│           └── java/com/flourmill/inventory/
│               ├── controller/
│               └── service/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   │   └── manifest.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── Sidebar.tsx
│       │   ├── Header.tsx
│       │   ├── StockBadge.tsx
│       │   ├── ConfirmDialog.tsx
│       │   └── Toast.tsx
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── ProductList.tsx
│       │   ├── ProductForm.tsx
│       │   ├── BillScanner.tsx
│       │   ├── ActivityLog.tsx
│       │   └── Settings.tsx
│       ├── hooks/
│       │   ├── useProducts.ts
│       │   ├── useCategories.ts
│       │   ├── useBrands.ts
│       │   └── useActivity.ts
│       ├── services/
│       │   └── api.ts
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           └── format.ts
└── README.md
```

---

## 3. Database Schema

### ERD

```
┌───────────────┐       ┌───────────────┐
│   Category    │       │    Brand      │
├───────────────┤       ├───────────────┤
│ id (PK)       │       │ id (PK)       │
│ name (UQ)     │       │ name (UQ)     │
│ description   │       │ created_at    │
│ created_at    │       │ updated_at    │
│ updated_at    │       └───────┬───────┘
└───────┬───────┘               │
        │ 1:N                   │ 1:N
        ▼                       ▼
┌─────────────────────────────────────┐
│              Product                │
├─────────────────────────────────────┤
│ id (PK)                             │
│ name (NOT NULL)                     │
│ category_id (FK → Category)         │
│ type (NOT NULL)                     │
│ shape                               │
│ brand_id (FK → Brand, nullable)     │
│ size                                │
│ quantity (DEFAULT 0, >= 0)          │
│ unit_price (DEFAULT 0)              │
│ min_stock (DEFAULT 5)               │
│ description                         │
│ image_url                           │
│ created_at                          │
│ updated_at                          │
└─────────────────┬───────────────────┘
                  │ 1:N
                  ▼
┌─────────────────────────────────────┐
│           ActivityLog               │
├─────────────────────────────────────┤
│ id (PK)                             │
│ product_id (nullable)               │
│ product_name                        │
│ action (ENUM)                       │
│ details                             │
│ old_value (JSON)                    │
│ new_value (JSON)                    │
│ created_at                          │
└─────────────────────────────────────┘
```

### Indexes
- `idx_product_category` on `product.category_id`
- `idx_product_brand` on `product.brand_id`
- `idx_product_type` on `product.type`
- `idx_activity_product` on `activity_log.product_id`
- `idx_activity_created` on `activity_log.created_at`

---

## 4. API Contracts

### Base URL: `/api/v1`

### 4.1 Products (Belts)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products (paginated, filterable) |
| GET | `/products/{id}` | Get product by ID |
| POST | `/products` | Create product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| PATCH | `/products/{id}/stock` | Adjust stock quantity |

**GET /products query params:**
- `page` (int, default 0)
- `size` (int, default 20)
- `sort` (string, default "updatedAt,desc")
- `search` (string — searches name, type, size)
- `categoryId` (long)
- `type` (string)
- `shape` (string)
- `brandId` (long)
- `minPrice` (decimal)
- `maxPrice` (decimal)

**POST /products body:**
```json
{
  "name": "Fenner V-Belt A-36",
  "categoryId": 1,
  "type": "V-Belt",
  "shape": "V-Shape",
  "brandId": 1,
  "size": "A-36",
  "quantity": 10,
  "unitPrice": 150.00,
  "minStock": 5,
  "description": "Standard V-belt"
}
```

**PATCH /products/{id}/stock body:**
```json
{
  "adjustment": 5,
  "reason": "Purchase bill #1234"
}
```
`adjustment` can be positive (add) or negative (remove).

### 4.2 Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| POST | `/categories` | Create category |
| PUT | `/categories/{id}` | Update category |
| DELETE | `/categories/{id}` | Delete category (fails if products exist) |

### 4.3 Brands

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/brands` | List all brands |
| POST | `/brands` | Create brand |
| PUT | `/brands/{id}` | Update brand |
| DELETE | `/brands/{id}` | Delete brand (fails if products exist) |

### 4.4 OCR

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ocr/scan` | Upload bill image, get extracted items |

**Request:** `multipart/form-data` with `file` field (image)

**Response:**
```json
{
  "rawText": "...",
  "items": [
    {
      "name": "V-Belt A-36",
      "quantity": 10,
      "unitPrice": 150.00,
      "confidence": 0.85
    }
  ],
  "warnings": []
}
```

### 4.5 Activity Log

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activity` | List activity (paginated) |

**Query params:** `page`, `size`, `action`, `from` (date), `to` (date)

### 4.6 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |

**Response:**
```json
{
  "totalProducts": 150,
  "totalQuantity": 3200,
  "totalValue": 480000.00,
  "lowStockCount": 12,
  "lowStockItems": [...],
  "recentActivity": [...],
  "categoryBreakdown": [
    { "category": "Belt", "count": 150, "value": 480000.00 }
  ]
}
```

---

## 5. Key Design Decisions

1. **Generic Product entity** — No separate `Belt` table. All products share one table with `category` and `type` fields. Adding polishers later = adding a new category row.

2. **Activity log stores snapshots** — `product_name` is denormalized so logs remain meaningful after product deletion.

3. **H2 for dev, PostgreSQL for prod** — Spring profiles switch the datasource. Flyway migrations ensure schema consistency.

4. **No auth in MVP** — Single-user/trusted-network assumption. Auth is Phase 3 roadmap item.

5. **OCR is best-effort** — Tesseract accuracy varies with bill quality. The UI always requires human confirmation before saving.

---

## 6. Deployment (Future)

- **Backend:** Docker container → any cloud VM or PaaS
- **Frontend:** Static build → Nginx or CDN
- **Database:** Managed PostgreSQL (e.g., Supabase, Railway, AWS RDS)

For MVP, both run locally on the store owner's computer or a cheap Android tablet.
