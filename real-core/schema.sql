CREATE TABLE IF NOT EXISTS sources(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  adapter_key TEXT,
  watch_enabled INTEGER NOT NULL DEFAULT 1,
  live_enabled INTEGER NOT NULL DEFAULT 1,
  etag TEXT,
  last_modified TEXT,
  content_hash TEXT,
  relevant_hash TEXT,
  last_checked_at TEXT,
  last_changed_at TEXT,
  next_check_at TEXT,
  failure_count INTEGER NOT NULL DEFAULT 0,
  terms_review_status TEXT,
  robots_state TEXT,
  max_bytes INTEGER DEFAULT 3000000
);
CREATE TABLE IF NOT EXISTS products(
  canonical_product_id TEXT PRIMARY KEY,
  brand TEXT, manufacturer TEXT, product_family TEXT, product_name TEXT NOT NULL,
  gtin TEXT, manufacturer_sku TEXT,
  species TEXT, breed_relevance TEXT, life_stage TEXT,
  category TEXT, subcategory TEXT, product_function TEXT,
  food_type TEXT, completeness TEXT,
  variant TEXT, flavour TEXT, size TEXT, pack_count INTEGER,
  weight_g REAL, volume_ml REAL,
  ingredients TEXT, analytical_components TEXT, additives TEXT, nutritional_attributes TEXT,
  dietary_claims TEXT, allergen_sensitivity_tags TEXT, health_need_tags TEXT,
  veterinary_diet INTEGER DEFAULT 0, subscription_eligible INTEGER DEFAULT 0,
  image TEXT, manufacturer_url TEXT,
  first_seen TEXT NOT NULL, last_verified TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5,
  provenance TEXT
);
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin);
CREATE TABLE IF NOT EXISTS offers(
  offer_id TEXT PRIMARY KEY,
  canonical_product_id TEXT NOT NULL REFERENCES products(canonical_product_id),
  source_id TEXT NOT NULL REFERENCES sources(id),
  retailer_id TEXT NOT NULL, retailer_sku TEXT,
  product_url TEXT NOT NULL, affiliate_url TEXT,
  price REAL, currency TEXT DEFAULT 'EUR', unit_price REAL,
  shipping REAL, minimum_order REAL,
  availability TEXT, stock_state TEXT, promotion TEXT, subscription_price REAL,
  observed_at TEXT NOT NULL, last_changed_at TEXT NOT NULL, content_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_offers_product ON offers(canonical_product_id);
CREATE TABLE IF NOT EXISTS offer_observations(
  observation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  offer_id TEXT NOT NULL, observed_at TEXT NOT NULL,
  price REAL, unit_price REAL, shipping REAL,
  availability TEXT, stock_state TEXT, promotion TEXT, content_hash TEXT
);
CREATE TABLE IF NOT EXISTS crawl_audits(
  audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL, checked_at TEXT NOT NULL,
  http_status INTEGER, changed INTEGER NOT NULL DEFAULT 0,
  extracted_products INTEGER NOT NULL DEFAULT 0,
  extracted_offers INTEGER NOT NULL DEFAULT 0,
  note TEXT
);
