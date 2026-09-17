PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS sources(
 id TEXT PRIMARY KEY, name TEXT NOT NULL, canonical_url TEXT NOT NULL,
 source_type TEXT NOT NULL, adapter_key TEXT NOT NULL,
 watch_enabled INTEGER NOT NULL DEFAULT 1, live_enabled INTEGER NOT NULL DEFAULT 1,
 etag TEXT, last_modified TEXT, content_hash TEXT, relevant_hash TEXT,
 last_checked_at TEXT, last_changed_at TEXT, last_success_at TEXT, last_failure_at TEXT,
 failure_count INTEGER NOT NULL DEFAULT 0, terms_review_status TEXT NOT NULL DEFAULT 'review_required',
 robots_policy TEXT NOT NULL DEFAULT 'obey', max_bytes INTEGER NOT NULL DEFAULT 3000000
);
CREATE TABLE IF NOT EXISTS products(
 canonical_product_id TEXT PRIMARY KEY, brand TEXT, manufacturer TEXT, product_family TEXT,
 product_name TEXT NOT NULL, gtin TEXT, manufacturer_sku TEXT, species TEXT, breed_relevance TEXT, life_stage TEXT,
 category TEXT, subcategory TEXT, product_function TEXT, food_type TEXT, completeness TEXT,
 variant TEXT, flavour TEXT, size_label TEXT, pack_count REAL, weight_g REAL, volume_ml REAL,
 dietary_claims TEXT, health_need_tags TEXT, veterinary_diet INTEGER DEFAULT 0,
 image_url TEXT, manufacturer_url TEXT, first_seen TEXT NOT NULL, last_verified TEXT NOT NULL,
 confidence REAL NOT NULL DEFAULT 0.5, provenance TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin) WHERE gtin IS NOT NULL AND gtin <> '';
CREATE TABLE IF NOT EXISTS offers(
 offer_id TEXT PRIMARY KEY, canonical_product_id TEXT NOT NULL REFERENCES products(canonical_product_id),
 source_id TEXT NOT NULL REFERENCES sources(id), retailer_id TEXT NOT NULL, retailer_sku TEXT,
 product_url TEXT NOT NULL, affiliate_url TEXT, price_eur REAL, unit_price_eur REAL, shipping_eur REAL,
 minimum_order_eur REAL, availability TEXT, stock_state TEXT, promotion TEXT, subscription_price_eur REAL,
 observed_at TEXT NOT NULL, last_changed_at TEXT NOT NULL, content_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS offer_observations(
 id INTEGER PRIMARY KEY AUTOINCREMENT, offer_id TEXT NOT NULL, observed_at TEXT NOT NULL,
 price_eur REAL, unit_price_eur REAL, availability TEXT, stock_state TEXT, promotion TEXT,
 content_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS crawl_audits(
 id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT NOT NULL, checked_at TEXT NOT NULL,
 status TEXT NOT NULL, changed INTEGER NOT NULL DEFAULT 0, extracted INTEGER NOT NULL DEFAULT 0,
 products_seen INTEGER NOT NULL DEFAULT 0, offers_seen INTEGER NOT NULL DEFAULT 0, detail TEXT
);
