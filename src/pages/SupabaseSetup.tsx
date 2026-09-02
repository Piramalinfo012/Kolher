import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Sparkles,
  Zap,
  Play,
  Key,
  Globe,
  FileCode,
  Table as TableIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabaseService } from '../services/supabase';
import { SupabaseTableStatus } from '../types';
import { useToast } from '../context/ToastContext';

const SQL_SCHEMA_CONTENT = `-- ==============================================================================
-- FIMA INDIA B2B SANITARYWARE CONFIGURATOR & QUOTATION MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS company_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    company_name TEXT NOT NULL DEFAULT 'FIMA INDIA CORPORATION PVT. LTD.',
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
    quotation_prefix TEXT DEFAULT 'FIMA',
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

-- 2. APP USERS TABLE
CREATE TABLE IF NOT EXISTS app_users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    role TEXT NOT NULL DEFAULT 'SALES',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 3. PRODUCTS MASTER TABLE
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
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    updated_at TEXT NOT NULL DEFAULT NOW()::TEXT,
    created_by TEXT
);

-- 4. FINISHES MASTER TABLE
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

-- 5. HANDLES MASTER TABLE
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

-- 6. COMBINATIONS MATRIX TABLE
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

-- 7. PRODUCT ASSETS / LAYERS TABLE
CREATE TABLE IF NOT EXISTS product_assets (
    asset_id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(product_id) ON DELETE CASCADE,
    layer_name TEXT NOT NULL,
    file_id TEXT,
    drive_url TEXT,
    direct_url TEXT,
    z_index NUMERIC DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

-- 8. CUSTOMERS / CLIENTS MASTER TABLE
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

-- 9. QUOTATIONS TABLE
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

-- 10. QUOTATION LINE ITEMS TABLE
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

-- 11. ACTIVITY AUDIT LOGS TABLE
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

-- ROW LEVEL SECURITY POLICIES
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
`;

export const SupabaseSetup: React.FC = () => {
  const { success, error, warning, info } = useToast();

  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isCheckingTables, setIsCheckingTables] = useState<boolean>(false);
  const [tableStatuses, setTableStatuses] = useState<SupabaseTableStatus[]>([]);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'config' | 'tables' | 'sql'>('config');

  useEffect(() => {
    const cfg = supabaseService.getConfig();
    setSupabaseUrl(cfg.supabaseUrl || '');
    setSupabaseAnonKey(cfg.supabaseAnonKey || '');
    setIsConnected(cfg.isConnected);

    if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
      handleCheckTables();
    }
  }, []);

  const handleTestAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      warning('Credentials Required', 'Please enter your Supabase Project URL and Anon API Key.');
      return;
    }

    try {
      setIsTesting(true);
      const res = await supabaseService.testConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
      if (res.success) {
        setIsConnected(true);
        success('Connected to Supabase', res.message);
        handleCheckTables();
      } else {
        setIsConnected(false);
        error('Connection Failed', res.message);
      }
    } catch (err: any) {
      setIsConnected(false);
      error('Error', err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCheckTables = async () => {
    setIsCheckingTables(true);
    try {
      const statuses = await supabaseService.checkTablesStatus();
      setTableStatuses(statuses);
    } catch (err) {
      console.error('Error checking tables:', err);
    } finally {
      setIsCheckingTables(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!isConnected) {
      warning('Not Connected', 'Please connect to Supabase first before seeding data.');
      return;
    }

    try {
      setIsSeeding(true);
      const res = await supabaseService.seedDatabase();
      if (res.success) {
        success('Database Seeded', res.message);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        handleCheckTables();
      } else {
        error('Seeding Error', res.message);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopiedSql(true);
    success('SQL Copied', 'SQL schema script copied to clipboard! Paste it into your Supabase SQL Editor.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-2xl p-6 sm:p-8 border border-neutral-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                PostgreSQL Cloud Database
              </span>
              {isConnected ? (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active & Connected
                </span>
              ) : (
                <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Pending Configuration
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-neutral-100">
              Supabase Database Integration
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Connect FIMA India B2B Configurator directly with your Supabase PostgreSQL cloud database for persistent live products, finish combinations, client masters, and commercial quotations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <span>Open Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'bg-[#9A6A38] text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-[#9A6A38] text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Database Tables & Sync ({tableStatuses.length})
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-[#9A6A38] text-white shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            SQL Migration Schema
          </button>
        </div>
      </div>

      {/* TAB 1: CONNECTION CONFIG */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Credentials Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider font-mono">
                  SUPABASE API CREDENTIALS
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Obtain these from your Supabase Dashboard &gt; Project Settings &gt; API
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800">Credentials Loaded securely</h4>
                    <p className="text-xs text-emerald-600 mt-0.5">Your Supabase Project URL and Anon API Key are successfully loaded from your .env file.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-5 py-2.5 rounded-xl bg-[#9A6A38] hover:bg-[#835627] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-red-200" />
                        <span>Test & Save Connection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Setup Checklist */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#faf6f0] rounded-2xl p-5 border border-[#e8dac7] space-y-3">
              <h4 className="text-xs font-bold text-[#633e14] uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9A6A38]" />
                3-Step Supabase Setup
              </h4>
              <ol className="text-xs text-neutral-700 space-y-2.5 list-decimal list-inside leading-relaxed">
                <li>
                  <strong>Create Project</strong>: Go to{' '}
                  <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#8d5b28] underline">
                    supabase.com
                  </a>{' '}
                  and create a new free PostgreSQL database.
                </li>
                <li>
                  <strong>Run SQL Schema</strong>: Switch to the <strong>SQL Migration Schema</strong> tab above, copy the SQL, and paste it into the Supabase SQL Editor.
                </li>
                <li>
                  <strong>Save API Keys</strong>: Copy your <code>Project URL</code> and <code>anon public key</code> into the form on the left.
                </li>
              </ol>
            </div>

            {/* Seed Button Box */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase font-mono">
                Populate FIMA Master Data
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Initialize your Supabase database with FIMA Components faucets, PVD Vibrant finishes, precision handles, and sample customer profiles with 1-click.
              </p>
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSeeding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Seeding Database...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Seed FIMA Master Data to Supabase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABLES & SYNC */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider font-mono">
                SUPABASE DATABASE TABLES STATUS
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Live inspection of PostgreSQL tables, row counts, and schema synchronization.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCheckTables}
                disabled={isCheckingTables}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingTables ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>

              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-3.5 py-1.5 rounded-xl bg-[#9A6A38] text-white text-xs font-bold hover:bg-[#835627] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Seed Tables</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold text-neutral-500 uppercase font-mono">
                  <th className="py-3 px-4">TABLE NAME</th>
                  <th className="py-3 px-4">PURPOSE / DESCRIPTION</th>
                  <th className="py-3 px-4 text-center">ROW COUNT</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {tableStatuses.length > 0 ? (
                  tableStatuses.map(tab => (
                    <tr key={tab.tableName} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900 flex items-center gap-2">
                        <TableIcon className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{tab.tableName}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{tab.label}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-neutral-800">
                        {tab.rowCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {tab.status === 'synced' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Ready & Synced
                          </span>
                        ) : tab.status === 'not_created' ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            Run SQL Schema
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            {tab.error || 'Error'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-400">
                      Connect to Supabase to view table sync status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SQL SCHEMA */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#9A6A38]" />
                POSTGRESQL DDL MIGRATION SCRIPT
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Execute this SQL script in Supabase Dashboard &gt; SQL Editor to create all required tables, constraints, indexes, and RLS policies.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-4 py-2 bg-[#9A6A38] hover:bg-[#835627] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Schema</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 bg-neutral-950 text-neutral-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[500px] border border-neutral-800 leading-relaxed selection:bg-red-500 selection:text-black">
              {SQL_SCHEMA_CONTENT}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

