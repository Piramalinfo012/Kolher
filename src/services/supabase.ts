import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, SupabaseTableStatus } from '../types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_FINISHES,
  INITIAL_HANDLES,
  INITIAL_COMBINATIONS,
  INITIAL_PRODUCT_ASSETS,
  INITIAL_CUSTOMERS,
  INITIAL_QUOTATIONS
} from '../config/demoData';

const SUPABASE_STORAGE_KEY = 'spc_supabase_config_v1';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig;

  constructor() {
    this.config = this.loadConfig();
    this.initClient();
  }

  private cleanUrl(url: string): string {
    if (!url) return '';
    let cleaned = url.trim();
    cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
    cleaned = cleaned.replace(/\/+$/, '');
    return cleaned;
  }

  private loadConfig(): SupabaseConfig {
    const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
    const envUrl = this.cleanUrl((import.meta as any).env?.VITE_SUPABASE_URL || '');
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const url = this.cleanUrl(parsed.supabaseUrl) || envUrl;
        const key = parsed.supabaseAnonKey || envKey;
        return {
          supabaseUrl: url,
          supabaseAnonKey: key,
          isConnected: !!(url && key),
          lastChecked: parsed.lastChecked,
          autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true
        };
      } catch (e) {
        console.error('Error parsing saved Supabase config:', e);
      }
    }

    return {
      supabaseUrl: envUrl,
      supabaseAnonKey: envKey,
      isConnected: !!(envUrl && envKey),
      autoSync: true
    };
  }

  private initClient(): void {
    const cleanUrl = this.cleanUrl(this.config.supabaseUrl);
    if (cleanUrl && this.config.supabaseAnonKey) {
      try {
        this.client = createClient(cleanUrl, this.config.supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public isConfigured(): boolean {
    return !!(this.config.supabaseUrl && this.config.supabaseAnonKey);
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public saveConfig(newConfig: Partial<SupabaseConfig>): void {
    const updated = {
      ...this.config,
      ...newConfig
    };
    if (updated.supabaseUrl) {
      updated.supabaseUrl = this.cleanUrl(updated.supabaseUrl);
    }
    this.config = updated;
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(this.config));
    this.initClient();
  }

  public async testConnection(url?: string, key?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const targetUrl = this.cleanUrl(url || this.config.supabaseUrl);
    const targetKey = key || this.config.supabaseAnonKey;

    if (!targetUrl || !targetKey) {
      return {
        success: false,
        message: 'Supabase Project URL and Anon API Key are required.'
      };
    }

    try {
      const testClient = createClient(targetUrl, targetKey);
      // Try querying company_settings or products table
      const { data, error } = await testClient.from('company_settings').select('*').limit(1);

      if (error) {
        // If table doesn't exist yet, it still confirms connection to Supabase database instance!
        if (error.code === '42P01' || error.message?.includes('relation "company_settings" does not exist')) {
          this.saveConfig({
            supabaseUrl: targetUrl,
            supabaseAnonKey: targetKey,
            isConnected: true,
            lastChecked: new Date().toISOString()
          });
          return {
            success: true,
            message: 'Connected to Supabase successfully! Tables need to be created using the SQL Schema script.',
            data: { tablesNeedCreation: true }
          };
        }
        return {
          success: false,
          message: `Supabase Error: ${error.message} (Code: ${error.code})`
        };
      }

      this.saveConfig({
        supabaseUrl: targetUrl,
        supabaseAnonKey: targetKey,
        isConnected: true,
        lastChecked: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Successfully connected and verified Supabase database!',
        data
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message || 'Network error'}`
      };
    }
  }

  public async checkTablesStatus(): Promise<SupabaseTableStatus[]> {
    if (!this.client) {
      return [];
    }

    const tableDefs = [
      { name: 'products', label: 'Products Master Catalog' },
      { name: 'finishes', label: 'Finish Master (PVD / Chrome)' },
      { name: 'handles', label: 'Handle Master (Stone / Brass)' },
      { name: 'combinations', label: 'Combination Price Matrix' },
      { name: 'product_assets', label: 'Product Assets / Layers' },
      { name: 'customers', label: 'Customer / Client Master' },
      { name: 'quotations', label: 'Commercial Quotations' },
      { name: 'quotation_items', label: 'Quotation Line Items' },
      { name: 'company_settings', label: 'Company Header & Terms' },
      { name: 'app_users', label: 'System Users & Roles' },
      { name: 'activity_logs', label: 'Audit Activity Logs' }
    ];

    const results: SupabaseTableStatus[] = [];

    for (const def of tableDefs) {
      try {
        const { count, error } = await this.client
          .from(def.name)
          .select('*', { count: 'exact', head: true });

        if (error) {
          if (error.code === '42P01') {
            results.push({
              tableName: def.name,
              label: def.label,
              rowCount: 0,
              status: 'not_created',
              error: 'Table does not exist'
            });
          } else {
            results.push({
              tableName: def.name,
              label: def.label,
              rowCount: 0,
              status: 'error',
              error: error.message
            });
          }
        } else {
          results.push({
            tableName: def.name,
            label: def.label,
            rowCount: count || 0,
            status: 'synced'
          });
        }
      } catch (err: any) {
        results.push({
          tableName: def.name,
          label: def.label,
          rowCount: 0,
          status: 'error',
          error: err.message
        });
      }
    }

    return results;
  }

  public async seedDatabase(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.client) {
      return { success: false, message: 'Supabase client is not connected.' };
    }

    try {
      const summary: Record<string, number> = {};

      // 1. Company Settings
      const { error: setErr } = await this.client
        .from('company_settings')
        .upsert({ id: 'current', ...INITIAL_COMPANY_SETTINGS });
      if (setErr) throw new Error(`company_settings: ${setErr.message}`);
      summary['company_settings'] = 1;

      // 2. Users
      const { error: usrErr } = await this.client
        .from('app_users')
        .upsert(INITIAL_USERS);
      if (usrErr) throw new Error(`app_users: ${usrErr.message}`);
      summary['app_users'] = INITIAL_USERS.length;

      // 3. Products
      const { error: prdErr } = await this.client
        .from('products')
        .upsert(INITIAL_PRODUCTS);
      if (prdErr) throw new Error(`products: ${prdErr.message}`);
      summary['products'] = INITIAL_PRODUCTS.length;

      // 4. Finishes
      const { error: finErr } = await this.client
        .from('finishes')
        .upsert(INITIAL_FINISHES);
      if (finErr) throw new Error(`finishes: ${finErr.message}`);
      summary['finishes'] = INITIAL_FINISHES.length;

      // 5. Handles
      const { error: hndErr } = await this.client
        .from('handles')
        .upsert(INITIAL_HANDLES);
      if (hndErr) throw new Error(`handles: ${hndErr.message}`);
      summary['handles'] = INITIAL_HANDLES.length;

      // 6. Combinations
      const { error: cmbErr } = await this.client
        .from('combinations')
        .upsert(INITIAL_COMBINATIONS);
      if (cmbErr) throw new Error(`combinations: ${cmbErr.message}`);
      summary['combinations'] = INITIAL_COMBINATIONS.length;

      // 7. Product Assets
      const { error: astErr } = await this.client
        .from('product_assets')
        .upsert(INITIAL_PRODUCT_ASSETS);
      if (astErr) throw new Error(`product_assets: ${astErr.message}`);
      summary['product_assets'] = INITIAL_PRODUCT_ASSETS.length;

      // 8. Customers
      const { error: cstErr } = await this.client
        .from('customers')
        .upsert(INITIAL_CUSTOMERS);
      if (cstErr) throw new Error(`customers: ${cstErr.message}`);
      summary['customers'] = INITIAL_CUSTOMERS.length;

      // 9. Quotations & Items
      for (const q of INITIAL_QUOTATIONS) {
        const { items, ...quoteHeader } = q;
        const { error: qErr } = await this.client
          .from('quotations')
          .upsert({ ...quoteHeader, items, sections: quoteHeader.sections || [] });
        if (qErr) throw new Error(`quotations: ${qErr.message}`);

        if (items && items.length > 0) {
          const { error: qiErr } = await this.client
            .from('quotation_items')
            .upsert(items);
          if (qiErr) console.warn('Quotation items upsert note:', qiErr.message);
        }
      }
      summary['quotations'] = INITIAL_QUOTATIONS.length;

      return {
        success: true,
        message: 'All FIMA catalog data, combinations, customers, and settings seeded successfully into Supabase!',
        details: summary
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Database seeding failed: ${err.message}`
      };
    }
  }
}

export const supabaseService = new SupabaseService();

