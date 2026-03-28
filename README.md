# Shree Mill Store — Inventory Management System

A mobile-first web application for managing flour mill machinery inventory. Built for a small shop that sells belts, polishers, pattars, and other flour mill parts.

## Features

- **Dashboard** — Total inventory, stock value, low-stock alerts, recent activity, category breakdown
- **Inventory Management** — Full CRUD for products with search, filters (category, brand, type), and pagination
- **Quick Stock Adjust** — Inline +/- buttons to update quantities without opening the edit form
- **Bill Scanner (OCR)** — Photograph purchase bills with your phone camera or upload an image; the system extracts item names, quantities, and prices using Tesseract OCR
- **Activity Log** — Complete history of all inventory changes with action-type filtering
- **Settings** — Manage product categories and brands
- **PWA Ready** — Installable on mobile devices for quick access

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, TailwindCSS, React Router, React Hook Form + Zod |
| Backend | Java 17, Spring Boot 3.2, Spring Data JPA, Spring Validation |
| Database | H2 (dev) / PostgreSQL (prod) |
| OCR | Tesseract via Tess4j |
| API Docs | Swagger UI (springdoc-openapi) |

## How to Run Locally

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- npm 9+
- (Optional) Tesseract OCR installed for bill scanning feature

### Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at **http://localhost:8080**

- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:file:./data/flourmill`)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**

The Vite dev server proxies `/api/*` requests to the backend at port 8080.

## API Documentation

Once the backend is running, visit **http://localhost:8080/swagger-ui.html** for interactive API documentation.

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/products` | List products (paginated, filterable) |
| `POST /api/v1/products` | Create a product |
| `PUT /api/v1/products/{id}` | Update a product |
| `DELETE /api/v1/products/{id}` | Delete a product |
| `PATCH /api/v1/products/{id}/stock` | Adjust stock quantity |
| `GET /api/v1/categories` | List categories |
| `GET /api/v1/brands` | List brands |
| `POST /api/v1/ocr/scan` | Scan a bill image (multipart upload) |
| `GET /api/v1/activity` | Activity log (paginated) |
| `GET /api/v1/dashboard/stats` | Dashboard statistics |

## Project Structure

```
├── docs/               # PRD, Architecture, Code Review, Test Report, UAT Report
├── backend/            # Spring Boot REST API
│   └── src/main/java/com/flourmill/inventory/
│       ├── controller/ # REST controllers
│       ├── service/    # Business logic
│       ├── repository/ # Data access (JPA)
│       ├── model/      # Entities and DTOs
│       ├── config/     # CORS, Swagger config
│       ├── exception/  # Global error handling
│       └── ocr/        # Bill text parser
├── frontend/           # React TypeScript SPA
│   └── src/
│       ├── pages/      # Dashboard, ProductList, ProductForm, BillScanner, ActivityLog, Settings
│       ├── components/ # Layout, StockBadge, ConfirmDialog
│       ├── hooks/      # Custom React hooks
│       ├── services/   # API client
│       └── types/      # TypeScript interfaces
└── README.md
```

## Running Tests

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
```

## Seed Data

The database is pre-seeded with:
- **1 Category:** Belt
- **7 Brands:** Fenner, Goodyear, PIX, Bando, Gates, Super, Local/Unbranded

## Extending to Other Products

The system is designed for extensibility. To add a new product type (e.g., Polisher):

1. Go to **Settings → Categories** and add "Polisher"
2. Start adding products under the new category
3. No code changes needed — the data model is generic

## Future Roadmap

1. User authentication & roles
2. Polisher and Pattar inventory
3. Sales tracking & billing
4. Supplier management
5. Analytics dashboard
6. Multi-language support (Hindi)
