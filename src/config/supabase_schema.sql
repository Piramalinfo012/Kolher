-- ==============================================================================
-- KOHLER INDIA B2B SANITARYWARE CONFIGURATOR & QUOTATION MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension (Optional, for auto-generating IDs if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COMPANY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS company_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    company_name TEXT NOT NULL DEFAULT 'KOHLER INDIA CORPORATION PVT. LTD.',
    logo_drive_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    gstin TEXT,
    pan TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc TEXT,
    branch TEXT,
    quotation_prefix TEXT DEFAULT 'KOHLER',
    financial_year TEXT DEFAULT '26-27',
    starting_number INTEGER DEFAULT 1,
    default_gst NUMERIC DEFAULT 18,
    default_payment_terms TEXT,
    default_delivery_terms TEXT,
    default_validity TEXT DEFAULT '30 Days',
    terms_conditions TEXT,
    authorized_signatory TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APP USERS TABLE
CREATE TABLE IF NOT EXISTS app_users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    role TEXT NOT NULL DEFAULT 'SALES',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 4. PRODUCTS MASTER TABLE
CREATE TABLE IF NOT EXISTS products (
    product_id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    model_number TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price NUMERIC NOT NULL DEFAULT 0,
    gst_percentage NUMERIC DEFAULT 18,
    hsn_code TEXT DEFAULT '8481',
    unit TEXT DEFAULT 'PCS',
    main_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    customizable TEXT NOT NULL DEFAULT 'YES',
    image_mode TEXT DEFAULT 'COMBINATION_IMAGE',
    custom_parts JSONB DEFAULT '[]'::jsonb,
    combo_images JSONB DEFAULT '{}'::jsonb,
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    created_by TEXT
);

-- 4B. PRODUCT SPARE PARTS TABLE
CREATE TABLE IF NOT EXISTS product_spare_parts (
    part_id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(product_id) ON DELETE CASCADE,
    part_name TEXT NOT NULL,
    part_model TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 5. FINISHES MASTER TABLE
CREATE TABLE IF NOT EXISTS finishes (
    finish_id TEXT PRIMARY KEY,
    finish_name TEXT NOT NULL,
    finish_code TEXT NOT NULL UNIQUE,
    finish_image_url TEXT,
    finish_type TEXT DEFAULT 'PVD',
    color_hex TEXT,
    texture_css TEXT,
    additional_price NUMERIC DEFAULT 0,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 6. HANDLES MASTER TABLE
CREATE TABLE IF NOT EXISTS handles (
    handle_id TEXT PRIMARY KEY,
    handle_model TEXT NOT NULL UNIQUE,
    handle_name TEXT NOT NULL,
    material TEXT DEFAULT 'Metal',
    texture_image_url TEXT,
    preview_image_url TEXT,
    color_hex TEXT,
    additional_price NUMERIC DEFAULT 0,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 7. COMBINATIONS MATRIX TABLE
CREATE TABLE IF NOT EXISTS combinations (
    combination_id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(product_id) ON DELETE CASCADE,
    finish_id TEXT REFERENCES finishes(finish_id) ON DELETE CASCADE,
    handle_id TEXT REFERENCES handles(handle_id) ON DELETE CASCADE,
    combination_image_url TEXT,
    additional_price NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 8. PRODUCT ASSETS / LAYERS TABLE
CREATE TABLE IF NOT EXISTS product_assets (
    asset_id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(product_id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    asset_type TEXT DEFAULT 'PRODUCT',
    drive_file_id TEXT,
    drive_url TEXT,
    direct_url TEXT,
    layer_type TEXT DEFAULT 'NONE',
    z_index NUMERIC DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 9. CUSTOMERS / CLIENTS MASTER TABLE
CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    party_name TEXT NOT NULL,
    company_name TEXT,
    contact_person TEXT,
    mobile TEXT NOT NULL,
    email TEXT,
    gstin TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    city TEXT,
    state TEXT DEFAULT 'Maharashtra',
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 10. QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS quotations (
    quotation_id TEXT PRIMARY KEY,
    quotation_number TEXT NOT NULL UNIQUE,
    quotation_date TEXT NOT NULL,
    customer_id TEXT,
    party_name TEXT NOT NULL,
    company_name TEXT,
    contact_person TEXT,
    mobile TEXT,
    email TEXT,
    gstin TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    subtotal NUMERIC DEFAULT 0,
    total_mrp NUMERIC DEFAULT 0,
    total_clp NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    freight NUMERIC DEFAULT 0,
    other_charges NUMERIC DEFAULT 0,
    taxable_amount NUMERIC DEFAULT 0,
    cgst NUMERIC DEFAULT 0,
    sgst NUMERIC DEFAULT 0,
    igst NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    payment_terms TEXT,
    delivery_terms TEXT,
    validity TEXT DEFAULT '30 Days',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    pdf_file_id TEXT,
    pdf_url TEXT,
    whatsapp_status TEXT DEFAULT 'NOT_SENT',
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    sections JSONB DEFAULT '[]'::jsonb,
    items JSONB DEFAULT '[]'::jsonb
);

-- 11. QUOTATION LINE ITEMS TABLE (Normalized table)
CREATE TABLE IF NOT EXISTS quotation_items (
    quotation_item_id TEXT PRIMARY KEY,
    quotation_number TEXT NOT NULL REFERENCES quotations(quotation_number) ON DELETE CASCADE,
    section_id TEXT,
    section_name TEXT,
    product_id TEXT,
    product_name TEXT NOT NULL,
    model_number TEXT NOT NULL,
    finish_id TEXT,
    finish_name TEXT,
    handle_id TEXT,
    handle_name TEXT,
    combination_id TEXT,
    product_image_url TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'PCS',
    base_price NUMERIC DEFAULT 0,
    mrp NUMERIC DEFAULT 0,
    clp NUMERIC,
    finish_price NUMERIC DEFAULT 0,
    handle_price NUMERIC DEFAULT 0,
    additional_price NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    gst NUMERIC DEFAULT 18,
    unit_final_price NUMERIC DEFAULT 0,
    line_total NUMERIC DEFAULT 0,
    customization_json JSONB DEFAULT '{}'::jsonb
);

-- 12. ACTIVITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    reference_id TEXT,
    description TEXT,
    timestamp TEXT NOT NULL DEFAULT NOW()::TEXT,
    ip_address TEXT
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY & OPEN PERMISSIVE POLICIES FOR WEB CLIENT ACCESS
-- ==============================================================================

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated read/write policies for B2B portal
CREATE POLICY "Allow public read-write for company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for finishes" ON finishes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for handles" ON handles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for combinations" ON combinations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for product_assets" ON product_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for quotations" ON quotations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for quotation_items" ON quotation_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Helpful Indexes for lightning fast searching and quotation generation
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model_number);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_quotations_num ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(quotation_date);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_party ON customers(party_name);
