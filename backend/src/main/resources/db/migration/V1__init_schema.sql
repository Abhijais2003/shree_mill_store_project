-- Categories (Belt, Polisher, Pattar, etc.)
CREATE TABLE category (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Brands (Fenner, Goodyear, etc.)
CREATE TABLE brand (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products (generic: belts now, other machinery later)
CREATE TABLE product (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    category_id BIGINT NOT NULL,
    type        VARCHAR(100) NOT NULL,
    shape       VARCHAR(100),
    brand_id    BIGINT,
    size        VARCHAR(50),
    quantity    INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
    min_stock   INT NOT NULL DEFAULT 5,
    description VARCHAR(1000),
    image_url   VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES category(id),
    CONSTRAINT fk_product_brand FOREIGN KEY (brand_id) REFERENCES brand(id)
);

CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_brand ON product(brand_id);
CREATE INDEX idx_product_type ON product(type);

-- Activity log
CREATE TABLE activity_log (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id   BIGINT,
    product_name VARCHAR(255),
    action       VARCHAR(50) NOT NULL,
    details      VARCHAR(1000),
    old_value    TEXT,
    new_value    TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_product ON activity_log(product_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);

-- Seed data: default category
INSERT INTO category (name, description) VALUES ('Belt', 'Flour mill belts - flat, V-belt, round, timing, link');

-- Seed data: common brands
INSERT INTO brand (name) VALUES ('Fenner');
INSERT INTO brand (name) VALUES ('Goodyear');
INSERT INTO brand (name) VALUES ('PIX');
INSERT INTO brand (name) VALUES ('Bando');
INSERT INTO brand (name) VALUES ('Gates');
INSERT INTO brand (name) VALUES ('Super');
INSERT INTO brand (name) VALUES ('Local/Unbranded');
