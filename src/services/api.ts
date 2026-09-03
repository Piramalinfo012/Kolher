import {
  Product,
  Finish,
  Handle,
  Combination,
  ProductAsset,
  Customer,
  Quotation,
  CompanySettings,
  User,
  ActivityLog,
  ApiResponse,
  ConfigSettings,
  SparePart
} from '../types';

import {
  INITIAL_PRODUCTS,
  INITIAL_FINISHES,
  INITIAL_HANDLES,
  INITIAL_COMBINATIONS,
  INITIAL_PRODUCT_ASSETS,
  INITIAL_CUSTOMERS,
  INITIAL_QUOTATIONS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_USERS,
  INITIAL_ACTIVITY_LOGS
} from '../config/demoData';

import { supabaseService } from './supabase';
const STORAGE_KEYS = {
  PRODUCTS: 'spc_products_v5',
  FINISHES: 'spc_finishes_v5',
  HANDLES: 'spc_handles_v5',
  COMBINATIONS: 'spc_combinations_v5',
  PRODUCT_ASSETS: 'spc_product_assets_v5',
  CUSTOMERS: 'spc_customers_v5',
  QUOTATIONS: 'spc_quotations_v5',
  SETTINGS: 'spc_settings_v5',
  USERS: 'spc_users_v5',
  LOGS: 'spc_logs_v5',
  CONFIG: 'spc_config_v5',
  CURRENT_USER: 'spc_current_user_v5',
  QUOTATION_DRAFT: 'spc_quotation_draft_v5',
  DYNAMIC_CUSTOMS: 'spc_dynamic_customs_v5'
};
class ApiService {
  private config: ConfigSettings;
  private isDemoMode: boolean = true;

  constructor() {
    this.config = this.loadConfig();
    this.initializeLocalStorage();
  }

  private loadConfig(): ConfigSettings {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.isDemoMode = !parsed.appsScriptUrl;
        return parsed;
      } catch (e) {
        console.error('Error parsing config:', e);
      }
    }
    const envUrl = (import.meta as any).env?.VITE_APPS_SCRIPT_URL || '';
    const initialConfig: ConfigSettings = {
      spreadsheetId: '',
      driveFolderId: '',
      appsScriptUrl: envUrl,
      isConfigured: !!envUrl
    };
    this.isDemoMode = !envUrl;
    return initialConfig;
  }

  public getAppsScriptUrl(): string {
    return this.config.appsScriptUrl || '';
  }

  public setAppsScriptUrl(url: string): void {
    this.saveConfig({ appsScriptUrl: url });
  }

  public async testBackendConnection(url?: string): Promise<any> {
    const targetUrl = url || this.config.appsScriptUrl;
    if (!targetUrl) {
      throw new Error('Google Apps Script Web App URL is required.');
    }
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'ping' })
    });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  }

  public async initializeRemoteSheets(): Promise<any> {
    return this.executeBackend('initializeSheets');
  }

  public saveConfig(newConfig: Partial<ConfigSettings>): void {
    this.config = { ...this.config, ...newConfig, isConfigured: !!(newConfig.appsScriptUrl || this.config.appsScriptUrl) };
    this.isDemoMode = !this.config.appsScriptUrl;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
  }

  public getConfig(): ConfigSettings {
    return { ...this.config };
  }

  public isUsingDemoMode(): boolean {
    return this.isDemoMode;
  }

  public setMode(demo: boolean) {
    this.isDemoMode = demo;
  }

  private initializeLocalStorage(): void {
    if (supabaseService.isConfigured()) {
      return;
    }

    const existingProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!existingProducts) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    } else {
      try {
        const parsed: Product[] = JSON.parse(existingProducts);
        // Ensure flagship SLIDE product exists
        if (!parsed.some(p => p.product_id === 'PRD_SLIDE' || p.model_number === 'F5801')) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([...INITIAL_PRODUCTS, ...parsed.filter(p => !INITIAL_PRODUCTS.some(ip => ip.product_id === p.product_id))]));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      }
    }

    const existingFinishes = localStorage.getItem(STORAGE_KEYS.FINISHES);
    if (!existingFinishes) {
      localStorage.setItem(STORAGE_KEYS.FINISHES, JSON.stringify(INITIAL_FINISHES));
    } else {
      try {
        const parsed: Finish[] = JSON.parse(existingFinishes);
        if (!parsed.some(f => f.finish_code === 'INOX' || f.finish_code === 'OS')) {
          localStorage.setItem(STORAGE_KEYS.FINISHES, JSON.stringify([...INITIAL_FINISHES, ...parsed.filter(f => !INITIAL_FINISHES.some(ifn => ifn.finish_id === f.finish_id))]));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.FINISHES, JSON.stringify(INITIAL_FINISHES));
      }
    }

    const existingHandles = localStorage.getItem(STORAGE_KEYS.HANDLES);
    if (!existingHandles) {
      localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify(INITIAL_HANDLES));
    } else {
      try {
        const parsed: Handle[] = JSON.parse(existingHandles);
        if (!parsed.some(h => h.handle_name.includes('MARQUINA') || h.handle_name.includes('CALACATTA'))) {
          localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify([...INITIAL_HANDLES, ...parsed.filter(h => !INITIAL_HANDLES.some(ih => ih.handle_id === h.handle_id))]));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify(INITIAL_HANDLES));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.COMBINATIONS)) {
      localStorage.setItem(STORAGE_KEYS.COMBINATIONS, JSON.stringify(INITIAL_COMBINATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCT_ASSETS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCT_ASSETS, JSON.stringify(INITIAL_PRODUCT_ASSETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUOTATIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(INITIAL_QUOTATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_COMPANY_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
  }

  public resetToDefaultDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.FINISHES, JSON.stringify(INITIAL_FINISHES));
    localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify(INITIAL_HANDLES));
    localStorage.setItem(STORAGE_KEYS.COMBINATIONS, JSON.stringify(INITIAL_COMBINATIONS));
    localStorage.setItem(STORAGE_KEYS.PRODUCT_ASSETS, JSON.stringify(INITIAL_PRODUCT_ASSETS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(INITIAL_QUOTATIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_COMPANY_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  }

  // --- Network Request Wrapper for Google Apps Script Backend ---
  private async executeBackend<T>(action: string, payload: any = {}): Promise<ApiResponse<T>> {
    if (!this.config.appsScriptUrl) {
      throw new Error('Google Apps Script Web App URL is not configured.');
    }
    try {
      const response = await fetch(this.config.appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ action, payload })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      return result;
    } catch (err: any) {
      console.warn('Apps Script backend request failed:', err);
      throw err;
    }
  }

  // --- User & Auth ---
  public getCurrentUser(): User {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Admin User') parsed.name = 'Rajeev Sharma';
        return parsed;
      } catch (e) {}
    }
    return INITIAL_USERS[0];
  }

  public setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.logActivity('USER_SWITCH', 'AUTH', user.user_id, `Switched active session user to ${user.name} (${user.role})`);
  }

  public async getUsers(): Promise<User[]> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('app_users').select('*').order('created_at');
        if (!error && data && data.length > 0) {
          const normalized = data.map(u => {
            if (u.user_id === 'USR0001' && (u.name === 'Admin User' || !u.name)) return { ...u, name: 'Rajeev Sharma' };
            if (u.user_id === 'USR0002' && (u.name === 'Sales Manager' || !u.name)) return { ...u, name: 'Aarav Singhania' };
            return u;
          });
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(normalized));
          return normalized;
        }
      } catch (e) {
        console.warn('Supabase getUsers error:', e);
      }
    }

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        const res = await this.executeBackend<User[]>('getUsers');
        if (res.success && res.data) return res.data;
      } catch (e) {}
    }
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  }

  public async createUser(userData: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      user_id: `USR${('0000' + (users.length + 1)).slice(-4)}`,
      name: userData.name || '',
      email: userData.email || '',
      mobile: userData.mobile || '',
      role: userData.role || 'SALES',
      status: userData.status || 'ACTIVE',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('app_users').insert(newUser);
      } catch (e) {
        console.warn('Supabase createUser error:', e);
      }
    }

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.logActivity('CREATE_USER', 'USERS', newUser.user_id, `Created user: ${newUser.name} with role ${newUser.role}`);
    return newUser;
  }

  public async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.user_id === userId);
    if (index === -1) throw new Error('User not found');
    const updated = {
      ...users[index],
      ...updates
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('app_users').update(updates).eq('user_id', userId);
      } catch (e) {
        console.warn('Supabase updateUser error:', e);
      }
    }

    users[index] = updated;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.logActivity('UPDATE_USER', 'USERS', userId, `Updated user ${updated.name}`);
    return updated;
  }

  public async deleteUser(userId: string): Promise<boolean> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('app_users').delete().eq('user_id', userId);
      } catch (e) {
        console.warn('Supabase deleteUser error:', e);
      }
    }

    const users = await this.getUsers();
    const index = users.findIndex(u => u.user_id === userId);
    if (index === -1) return false;
    users.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.logActivity('DELETE_USER', 'USERS', userId, 'Deleted user');
    return true;
  }

  // --- Activity Logging ---
  public logActivity(action: string, module: string, reference_id: string, description: string): void {
    const currentUser = this.getCurrentUser();
    const logs: ActivityLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
    const newLog: ActivityLog = {
      log_id: `LOG_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: currentUser.user_id,
      user_name: currentUser.name,
      action,
      module,
      reference_id,
      description,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      sb.from('activity_logs').insert(newLog).then(({ error }) => {
        if (error) console.warn('Supabase logActivity warning:', error.message);
      }, (err) => console.warn('Supabase logActivity err:', err));
    }

    logs.unshift(newLog);
    if (logs.length > 500) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  public async getActivityLogs(): Promise<ActivityLog[]> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(200);
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase getActivityLogs error:', e);
      }
    }

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        const res = await this.executeBackend<ActivityLog[]>('getActivityLogs');
        if (res.success && res.data) return res.data;
      } catch (e) {}
    }
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : INITIAL_ACTIVITY_LOGS;
  }

  // --- Company Settings ---
  public async getCompanySettings(): Promise<CompanySettings> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('company_settings').select('*').limit(1).single();
        if (!error && data) {
          const { id, updated_at, ...cleanSettings } = data;
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cleanSettings));
          return cleanSettings as CompanySettings;
        }
      } catch (e) {
        console.warn('Supabase getCompanySettings error:', e);
      }
    }

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        const res = await this.executeBackend<CompanySettings>('getCompanySettings');
        if (res.success && res.data) return res.data;
      } catch (e) {}
    }
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings: CompanySettings = data ? JSON.parse(data) : INITIAL_COMPANY_SETTINGS;
    if (!settings.quotation_prefix || settings.quotation_prefix === 'KOHLER') {
      settings.quotation_prefix = 'FIMA';
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
    return settings;
  }

  public async updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const current = await this.getCompanySettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('company_settings').upsert({ id: 'current', ...updated, updated_at: new Date().toISOString() });
      } catch (e) {
        console.warn('Supabase updateCompanySettings error:', e);
      }
    }

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        await this.executeBackend('updateCompanySettings', updated);
      } catch (e) {}
    }
    this.logActivity('UPDATE_SETTINGS', 'COMPANY_SETTINGS', 'COMPANY_INFO', `Updated company settings for ${updated.company_name}`);
    return updated;
  }

  // --- Products Master ---
  public async getProducts(): Promise<Product[]> {
    const sb = supabaseService.getClient();
    let data: Product[] = [];
    if (sb) {
      try {
        const { data: sbData, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
        if (!error && sbData) {
          data = sbData;
        } else {
          const localData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
          data = localData ? JSON.parse(localData) : [];
        }
      } catch (e) {
        const localData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        data = localData ? JSON.parse(localData) : [];
      }
    } else {
      const localData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      data = localData ? JSON.parse(localData) : INITIAL_PRODUCTS;
    }

    // Merge Dynamic Customizations from LocalStorage
    try {
      const customsMapStr = localStorage.getItem(STORAGE_KEYS.DYNAMIC_CUSTOMS);
      if (customsMapStr) {
        const customsMap = JSON.parse(customsMapStr);
        data = data.map(p => {
          if (customsMap[p.product_id]) {
            return {
              ...p,
              custom_parts: customsMap[p.product_id].custom_parts,
              combo_images: customsMap[p.product_id].combo_images
            };
          }
          return p;
        });
      }
    } catch(e) {}

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
    return data;
  }

  public async getProductById(productId: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(p => p.product_id === productId);
  }

  public async createProduct(product: Partial<Product>): Promise<Product> {
    const existingProducts = await this.getProducts();

    const cleanModel = product.model_number ? product.model_number.trim().toLowerCase() : '';
    const cleanName = product.product_name ? product.product_name.trim().toLowerCase() : '';

    const existing = existingProducts.find(p => {
      const pModel = p.model_number ? p.model_number.trim().toLowerCase() : '';
      const pName = p.product_name ? p.product_name.trim().toLowerCase() : '';
      return (cleanModel && pModel && cleanModel === pModel) ||
             (cleanName && pName && cleanName === pName && p.category === product.category);
    });

    if (existing && !product.product_id) {
      console.log('Product with same model number/name already exists, updating existing product:', existing.product_id);
      return this.updateProduct(existing.product_id, product);
    }

    const sb = supabaseService.getClient();
    const newProduct: Product = {
      ...product,
      product_id: product.product_id || `PRD_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Product;

    const { custom_parts, combo_images, has_customization, ...dbProduct } = newProduct as any;
    if (has_customization !== undefined) {
      dbProduct.customizable = has_customization ? 'YES' : 'NO';
    }

    if (sb) {
      // Try inserting with custom_parts and combo_images included
      const fullPayload = { ...dbProduct, custom_parts, combo_images };
      const { error } = await sb.from('products').insert([fullPayload]);
      if (error) {
        // Fallback without custom_parts/combo_images if columns don't exist yet
        const { error: fallbackError } = await sb.from('products').insert([dbProduct]);
        if (fallbackError) throw new Error(fallbackError.message);
      }
    } else {
      if (!this.isDemoMode && this.config.appsScriptUrl) {
        // Mock google script request
      }
    }

    // Save custom parts to mapping
    if (custom_parts || combo_images) {
      try {
        const customsMapStr = localStorage.getItem(STORAGE_KEYS.DYNAMIC_CUSTOMS);
        const customsMap = customsMapStr ? JSON.parse(customsMapStr) : {};
        customsMap[newProduct.product_id] = { custom_parts, combo_images };
        localStorage.setItem(STORAGE_KEYS.DYNAMIC_CUSTOMS, JSON.stringify(customsMap));
      } catch (e) {}
    }

    const cache = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const products: Product[] = cache ? JSON.parse(cache) : INITIAL_PRODUCTS;
    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    return newProduct;
  }

  public async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.product_id === productId);
    if (index === -1) throw new Error('Product not found');

    const { custom_parts, combo_images, has_customization, ...dbUpdates } = updates as any;
    if (has_customization !== undefined) {
      dbUpdates.customizable = has_customization ? 'YES' : 'NO';
    }
    
    const updated = {
      ...products[index],
      ...dbUpdates,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const fullPayload = { ...dbUpdates };
        if (custom_parts !== undefined) fullPayload.custom_parts = custom_parts;
        if (combo_images !== undefined) fullPayload.combo_images = combo_images;

        const { error } = await sb.from('products').update(fullPayload).eq('product_id', productId);
        if (error) {
          // If columns don't exist in Supabase yet, try updating without them
          const { error: fallbackError } = await sb.from('products').update(dbUpdates).eq('product_id', productId);
          if (fallbackError) {
            console.error('Supabase DB error on updateProduct:', fallbackError);
            throw new Error(`Database error: ${fallbackError.message}`);
          }
        }
      } catch (e: any) {
        console.warn('Supabase updateProduct error:', e);
        throw e;
      }
    }

    // Update dynamic fields mapping
    if (custom_parts !== undefined || combo_images !== undefined) {
      try {
        const customsMapStr = localStorage.getItem(STORAGE_KEYS.DYNAMIC_CUSTOMS);
        const customsMap = customsMapStr ? JSON.parse(customsMapStr) : {};
        customsMap[productId] = {
          ...customsMap[productId],
          ...(custom_parts !== undefined ? { custom_parts } : {}),
          ...(combo_images !== undefined ? { combo_images } : {})
        };
        localStorage.setItem(STORAGE_KEYS.DYNAMIC_CUSTOMS, JSON.stringify(customsMap));
      } catch (e) {}
    }

    // Also inject back for immediate state update
    updated.custom_parts = custom_parts !== undefined ? custom_parts : products[index].custom_parts;
    updated.combo_images = combo_images !== undefined ? combo_images : products[index].combo_images;

    products[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        await this.executeBackend('updateProduct', updated);
      } catch (e) {}
    }
    this.logActivity('UPDATE_PRODUCT', 'PRODUCTS', productId, `Updated product configuration`);
    return updated;
  }

  public async deleteProduct(productId: string): Promise<boolean> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.product_id === productId);
    if (index === -1) return false;

    const targetProduct = products[index];

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('product_spare_parts').delete().eq('product_id', productId);
        await sb.from('combinations').delete().eq('product_id', productId);
        await sb.from('product_assets').delete().eq('product_id', productId);
        const { error } = await sb.from('products').delete().eq('product_id', productId);
        if (error) {
          console.warn('Supabase deleteProduct warning:', error.message);
        }
      } catch (e) {
        console.warn('Supabase deleteProduct error:', e);
      }
    }

    const updatedProducts = products.filter(p => p.product_id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));

    try {
      const customsMapStr = localStorage.getItem(STORAGE_KEYS.DYNAMIC_CUSTOMS);
      if (customsMapStr) {
        const customsMap = JSON.parse(customsMapStr);
        delete customsMap[productId];
        localStorage.setItem(STORAGE_KEYS.DYNAMIC_CUSTOMS, JSON.stringify(customsMap));
      }
    } catch (e) {}

    this.logActivity('DELETE_PRODUCT', 'PRODUCTS', productId, `Deleted product ${targetProduct.product_name}`);
    return true;
  }

  // --- Spare Parts Master ---
  public async getSparePartsByProduct(productId: string): Promise<SparePart[]> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('product_spare_parts').select('*').eq('product_id', productId).order('created_at');
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase getSpareParts error:', e);
      }
    }
    // Fallback to local storage
    const allParts: SparePart[] = JSON.parse(localStorage.getItem('spc_spare_parts_v1') || '[]');
    return allParts.filter(p => p.product_id === productId);
  }

  public async createSparePart(partData: Partial<SparePart>): Promise<SparePart> {
    const allParts: SparePart[] = JSON.parse(localStorage.getItem('spc_spare_parts_v1') || '[]');
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newPart: SparePart = {
      part_id: `SP${('0000' + (allParts.length + 1)).slice(-4)}`,
      product_id: partData.product_id || '',
      part_name: partData.part_name || 'New Spare Part',
      part_model: partData.part_model || '',
      price: Number(partData.price) || 0,
      image_url: partData.image_url || '',
      status: partData.status || 'ACTIVE',
      created_at: now,
      updated_at: now
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('product_spare_parts').insert(newPart);
      } catch (e) {
        console.warn('Supabase createSparePart error:', e);
      }
    }

    allParts.push(newPart);
    localStorage.setItem('spc_spare_parts_v1', JSON.stringify(allParts));
    this.logActivity('CREATE_SPARE_PART', 'PRODUCTS', newPart.part_id, `Added spare part ${newPart.part_name}`);
    return newPart;
  }

  public async updateSparePart(partId: string, updates: Partial<SparePart>): Promise<SparePart> {
    const allParts: SparePart[] = JSON.parse(localStorage.getItem('spc_spare_parts_v1') || '[]');
    const index = allParts.findIndex(p => p.part_id === partId);
    if (index === -1) throw new Error('Spare part not found');

    const updated = {
      ...allParts[index],
      ...updates,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('product_spare_parts').update(updated).eq('part_id', partId);
      } catch (e) {
        console.warn('Supabase updateSparePart error:', e);
      }
    }

    allParts[index] = updated;
    localStorage.setItem('spc_spare_parts_v1', JSON.stringify(allParts));
    return updated;
  }

  public async deleteSparePart(partId: string): Promise<boolean> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('product_spare_parts').delete().eq('part_id', partId);
      } catch (e) {
        console.warn('Supabase deleteSparePart error:', e);
      }
    }

    const allParts: SparePart[] = JSON.parse(localStorage.getItem('spc_spare_parts_v1') || '[]');
    const index = allParts.findIndex(p => p.part_id === partId);
    if (index > -1) {
      allParts.splice(index, 1);
      localStorage.setItem('spc_spare_parts_v1', JSON.stringify(allParts));
      this.logActivity('DELETE_SPARE_PART', 'PRODUCTS', partId, `Deleted spare part`);
      return true;
    }
    return false;
  }

  // --- Finishes Master ---
  public async getFinishes(): Promise<Finish[]> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('finishes').select('*').order('finish_name');
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.FINISHES, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase getFinishes error:', e);
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.FINISHES);
    return data ? JSON.parse(data) : [];
  }

  public async createFinish(finishData: Partial<Finish>): Promise<Finish> {
    const finishes = await this.getFinishes();
    const cleanCode = finishData.finish_code ? finishData.finish_code.trim().toLowerCase() : '';
    const cleanName = finishData.finish_name ? finishData.finish_name.trim().toLowerCase() : '';

    const existingFinish = finishes.find(f => {
      const fCode = f.finish_code ? f.finish_code.trim().toLowerCase() : '';
      const fName = f.finish_name ? f.finish_name.trim().toLowerCase() : '';
      return (cleanCode && fCode && cleanCode === fCode) || (cleanName && fName && cleanName === fName);
    });

    if (existingFinish && !finishData.finish_id) {
      return this.updateFinish(existingFinish.finish_id, finishData);
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newFinish: Finish = {
      finish_id: `FIN${('0000' + (finishes.length + 1)).slice(-4)}`,
      finish_name: finishData.finish_name || '',
      finish_code: finishData.finish_code || '',
      finish_image_url: finishData.finish_image_url || 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=200&auto=format&fit=crop&q=80',
      finish_type: finishData.finish_type || 'PVD',
      color_hex: finishData.color_hex || '#C5A880',
      texture_css: finishData.texture_css || 'linear-gradient(135deg, #dfc7a5 0%, #c5a880 50%, #9c7e57 100%)',
      additional_price: Number(finishData.additional_price) || 0,
      description: finishData.description || '',
      status: finishData.status || 'Active',
      created_at: now,
      updated_at: now
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('finishes').insert(newFinish);
      } catch (e) {
        console.warn('Supabase createFinish error:', e);
      }
    }

    finishes.push(newFinish);
    localStorage.setItem(STORAGE_KEYS.FINISHES, JSON.stringify(finishes));
    this.logActivity('CREATE_FINISH', 'FINISHES', newFinish.finish_id, `Added finish ${newFinish.finish_name}`);
    return newFinish;
  }

  public async updateFinish(finishId: string, updates: Partial<Finish>): Promise<Finish> {
    const finishes = await this.getFinishes();
    const index = finishes.findIndex(f => f.finish_id === finishId);
    if (index === -1) throw new Error('Finish not found');

    const updated = {
      ...finishes[index],
      ...updates,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('finishes').update(updated).eq('finish_id', finishId);
      } catch (e) {
        console.warn('Supabase updateFinish error:', e);
      }
    }

    finishes[index] = updated;
    localStorage.setItem(STORAGE_KEYS.FINISHES, JSON.stringify(finishes));
    this.logActivity('UPDATE_FINISH', 'FINISHES', finishId, `Updated finish ${updated.finish_name}`);
    return updated;
  }

  public async deleteFinish(finishId: string): Promise<boolean> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('finishes').delete().eq('finish_id', finishId);
      } catch (e) {
        console.warn('Supabase deleteFinish error:', e);
      }
    }

    const finishes = await this.getFinishes();
    const index = finishes.findIndex(f => f.finish_id === finishId);
    if (index === -1) return false;
    finishes.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.FINISHES, JSON.stringify(finishes));
    this.logActivity('DELETE_FINISH', 'FINISHES', finishId, 'Deleted finish');
    return true;
  }

  // --- Handles Master ---
  public async getHandles(): Promise<Handle[]> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('handles').select('*').order('handle_name');
        if (!error && data) {
          if (data.length === 0) {
            await sb.from('handles').upsert(INITIAL_HANDLES);
            localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify(INITIAL_HANDLES));
            return INITIAL_HANDLES;
          }
          localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase getHandles error:', e);
      }
    }

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        const res = await this.executeBackend<Handle[]>('getHandles');
        if (res.success && res.data) return res.data;
      } catch (e) {}
    }
    const data = localStorage.getItem(STORAGE_KEYS.HANDLES);
    return data ? JSON.parse(data) : INITIAL_HANDLES;
  }

  public async createHandle(handleData: Partial<Handle>): Promise<Handle> {
    const handles = await this.getHandles();
    const cleanModel = handleData.handle_model ? handleData.handle_model.trim().toLowerCase() : '';
    const cleanName = handleData.handle_name ? handleData.handle_name.trim().toLowerCase() : '';

    const existingHandle = handles.find(h => {
      const hModel = h.handle_model ? h.handle_model.trim().toLowerCase() : '';
      const hName = h.handle_name ? h.handle_name.trim().toLowerCase() : '';
      return (cleanModel && hModel && cleanModel === hModel) || (cleanName && hName && cleanName === hName);
    });

    if (existingHandle && !handleData.handle_id) {
      return this.updateHandle(existingHandle.handle_id, handleData);
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newHandle: Handle = {
      handle_id: `HDL${('0000' + (handles.length + 1)).slice(-4)}`,
      handle_model: handleData.handle_model || 'F1420',
      handle_name: handleData.handle_name || '',
      material: handleData.material || 'Marble',
      texture_image_url: handleData.texture_image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80',
      preview_image_url: handleData.preview_image_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&auto=format&fit=crop&q=80',
      color_hex: handleData.color_hex || '#F0ECE1',
      additional_price: Number(handleData.additional_price) || 0,
      description: handleData.description || '',
      status: handleData.status || 'Active',
      created_at: now,
      updated_at: now
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('handles').insert(newHandle);
      } catch (e) {
        console.warn('Supabase createHandle error:', e);
      }
    }

    handles.push(newHandle);
    localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify(handles));
    this.logActivity('CREATE_HANDLE', 'HANDLES', newHandle.handle_id, `Added handle ${newHandle.handle_name}`);
    return newHandle;
  }

  public async updateHandle(handleId: string, updates: Partial<Handle>): Promise<Handle> {
    const handles = await this.getHandles();
    const index = handles.findIndex(h => h.handle_id === handleId);
    if (index === -1) throw new Error('Handle not found');

    const updated = {
      ...handles[index],
      ...updates,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('handles').update(updated).eq('handle_id', handleId);
      } catch (e) {
        console.warn('Supabase updateHandle error:', e);
      }
    }

    handles[index] = updated;
    localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify(handles));
    this.logActivity('UPDATE_HANDLE', 'HANDLES', handleId, `Updated handle ${updated.handle_name}`);
    return updated;
  }

  public async deleteHandle(handleId: string): Promise<boolean> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('handles').delete().eq('handle_id', handleId);
      } catch (e) {
        console.warn('Supabase deleteHandle error:', e);
      }
    }

    const handles = await this.getHandles();
    const index = handles.findIndex(h => h.handle_id === handleId);
    if (index === -1) return false;
    handles.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.HANDLES, JSON.stringify(handles));
    this.logActivity('DELETE_HANDLE', 'HANDLES', handleId, 'Deleted handle');
    return true;
  }

  // --- Combinations Master ---
  public async getCombinations(): Promise<Combination[]> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('combinations').select('*');
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.COMBINATIONS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase getCombinations error:', e);
      }
    }

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        const res = await this.executeBackend<Combination[]>('getCombinations');
        if (res.success && res.data) return res.data;
      } catch (e) {}
    }
    const data = localStorage.getItem(STORAGE_KEYS.COMBINATIONS);
    return data ? JSON.parse(data) : INITIAL_COMBINATIONS;
  }

  public async findCombination(productId: string, finishId: string, handleId: string): Promise<Combination | undefined> {
    const combos = await this.getCombinations();
    return combos.find(c => c.product_id === productId && c.finish_id === finishId && c.handle_id === handleId && c.status === 'Active');
  }

  public async createCombination(comboData: Partial<Combination>): Promise<Combination> {
    const combos = await this.getCombinations();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newCombo: Combination = {
      combination_id: `COM${('0000' + (combos.length + 1)).slice(-4)}`,
      product_id: comboData.product_id || '',
      finish_id: comboData.finish_id || '',
      handle_id: comboData.handle_id || '',
      combination_image_url: comboData.combination_image_url || '',
      additional_price: Number(comboData.additional_price) || 0,
      status: comboData.status || 'Active',
      created_at: now,
      updated_at: now
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('combinations').insert(newCombo);
      } catch (e) {
        console.warn('Supabase createCombination error:', e);
      }
    }

    combos.push(newCombo);
    localStorage.setItem(STORAGE_KEYS.COMBINATIONS, JSON.stringify(combos));
    this.logActivity('CREATE_COMBINATION', 'COMBINATIONS', newCombo.combination_id, `Created combination for product ${newCombo.product_id}`);
    return newCombo;
  }

  public async updateCombination(combinationId: string, updates: Partial<Combination>): Promise<Combination> {
    const combos = await this.getCombinations();
    const index = combos.findIndex(c => c.combination_id === combinationId);
    if (index === -1) throw new Error('Combination not found');

    const updated = {
      ...combos[index],
      ...updates,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('combinations').update(updated).eq('combination_id', combinationId);
      } catch (e) {
        console.warn('Supabase updateCombination error:', e);
      }
    }

    combos[index] = updated;
    localStorage.setItem(STORAGE_KEYS.COMBINATIONS, JSON.stringify(combos));
    this.logActivity('UPDATE_COMBINATION', 'COMBINATIONS', combinationId, 'Updated combination');
    return updated;
  }

  public async deleteCombination(combinationId: string): Promise<boolean> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('combinations').delete().eq('combination_id', combinationId);
      } catch (e) {
        console.warn('Supabase deleteCombination error:', e);
      }
    }

    const combos = await this.getCombinations();
    const index = combos.findIndex(c => c.combination_id === combinationId);
    if (index === -1) return false;
    combos.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.COMBINATIONS, JSON.stringify(combos));
    this.logActivity('DELETE_COMBINATION', 'COMBINATIONS', combinationId, 'Deleted combination');
    return true;
  }

  // --- Product Assets ---
  public async getProductAssets(productId?: string): Promise<ProductAsset[]> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        let query = sb.from('product_assets').select('*');
        if (productId) query = query.eq('product_id', productId);
        const { data, error } = await query;
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.PRODUCT_ASSETS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase getProductAssets error:', e);
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.PRODUCT_ASSETS);
    const assets: ProductAsset[] = data ? JSON.parse(data) : INITIAL_PRODUCT_ASSETS;
    if (productId) return assets.filter(a => a.product_id === productId);
    return assets;
  }

  public async createProductAsset(assetData: Partial<ProductAsset>): Promise<ProductAsset> {
    const assets = await this.getProductAssets();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newAsset: ProductAsset = {
      asset_id: `AST${('0000' + (assets.length + 1)).slice(-4)}`,
      product_id: assetData.product_id || '',
      asset_name: assetData.asset_name || 'Asset',
      asset_type: assetData.asset_type || 'PRODUCT',
      drive_file_id: assetData.drive_file_id || '',
      drive_url: assetData.drive_url || '',
      layer_type: assetData.layer_type || 'NONE',
      status: assetData.status || 'Active',
      created_at: now
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('product_assets').insert(newAsset);
      } catch (e) {
        console.warn('Supabase createProductAsset error:', e);
      }
    }

    assets.push(newAsset);
    localStorage.setItem(STORAGE_KEYS.PRODUCT_ASSETS, JSON.stringify(assets));
    this.logActivity('CREATE_ASSET', 'PRODUCT_ASSETS', newAsset.asset_id, `Uploaded asset: ${newAsset.asset_name}`);
    return newAsset;
  }

  public async updateProductAsset(assetId: string, updates: Partial<ProductAsset>): Promise<ProductAsset> {
    const assets = await this.getProductAssets();
    const index = assets.findIndex(a => a.asset_id === assetId);
    if (index === -1) throw new Error('Asset not found');

    const updated = {
      ...assets[index],
      ...updates
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('product_assets').update(updated).eq('asset_id', assetId);
      } catch (e) {
        console.warn('Supabase updateProductAsset error:', e);
      }
    }

    assets[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PRODUCT_ASSETS, JSON.stringify(assets));
    this.logActivity('UPDATE_ASSET', 'PRODUCT_ASSETS', assetId, 'Updated asset');
    return updated;
  }

  public async deleteProductAsset(assetId: string): Promise<boolean> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('product_assets').delete().eq('asset_id', assetId);
      } catch (e) {
        console.warn('Supabase deleteProductAsset error:', e);
      }
    }

    const assets = await this.getProductAssets();
    const index = assets.findIndex(a => a.asset_id === assetId);
    if (index === -1) return false;
    assets.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.PRODUCT_ASSETS, JSON.stringify(assets));
    this.logActivity('DELETE_ASSET', 'PRODUCT_ASSETS', assetId, 'Deleted asset');
    return true;
  }

  // --- Customers Master ---
  public async getCustomers(): Promise<Customer[]> {
    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { data, error } = await sb.from('customers').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          if (data.length === 0) {
            const cleanInit = INITIAL_CUSTOMERS.map(c => {
              const { sales_person, notes, ...rest } = c as any;
              return rest;
            });
            await sb.from('customers').upsert(cleanInit);
            const { data: seeded } = await sb.from('customers').select('*').order('created_at', { ascending: false });
            if (seeded && seeded.length > 0) {
              localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(seeded));
              return seeded;
            }
          }
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase getCustomers error:', e);
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  }

  public async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const customers = await this.getCustomers();
    
    // Deduplication check: if party_name or mobile already exists, update existing record instead of adding duplicate
    const cleanMobile = customerData.mobile ? customerData.mobile.replace(/\D/g, '') : '';
    const cleanParty = customerData.party_name ? customerData.party_name.trim().toLowerCase() : '';

    const existing = customers.find(c => {
      const cMobile = c.mobile ? c.mobile.replace(/\D/g, '') : '';
      const cParty = c.party_name ? c.party_name.trim().toLowerCase() : '';
      return (cleanMobile && cMobile && cleanMobile.length >= 7 && cleanMobile === cMobile) || (cleanParty && cParty && cleanParty === cParty);
    });

    if (existing && !customerData.customer_id) {
      return this.updateCustomer(existing.customer_id, customerData);
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const currentUser = this.getCurrentUser();
    const newCustomer: Customer = {
      customer_id: customerData.customer_id || `CUST-${('000' + (customers.length + 1)).slice(-4)}`,
      party_name: customerData.party_name || '',
      company_name: customerData.company_name || '',
      contact_person: customerData.contact_person || '',
      mobile: customerData.mobile || '',
      email: customerData.email || '',
      billing_address: customerData.billing_address || '',
      shipping_address: customerData.shipping_address || customerData.billing_address || '',
      gstin: customerData.gstin || '',
      state: customerData.state || 'Maharashtra',
      city: customerData.city || 'Mumbai',
      sales_person: customerData.sales_person || currentUser.name,
      notes: customerData.notes || '',
      status: 'Active',
      created_at: now,
      updated_at: now
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { sales_person, notes, ...dbCustomer } = newCustomer as any;
        const { error } = await sb.from('customers').insert(dbCustomer);
        if (error) {
          console.warn('Supabase createCustomer insert warning (trying full insert):', error.message);
          const { error: error2 } = await sb.from('customers').insert(newCustomer);
          if (error2) console.error('Supabase createCustomer error:', error2.message);
        }
      } catch (e) {
        console.warn('Supabase createCustomer error:', e);
      }
    }

    customers.unshift(newCustomer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        await this.executeBackend('createCustomer', newCustomer);
      } catch (e) {}
    }
    this.logActivity('CREATE_CUSTOMER', 'CUSTOMERS', newCustomer.customer_id, `Created customer ${newCustomer.party_name}`);
    return newCustomer;
  }

  public async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    const customers = await this.getCustomers();
    const index = customers.findIndex(c => c.customer_id === customerId);
    if (index === -1) throw new Error('Customer not found');

    const updated = {
      ...customers[index],
      ...updates,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        const { sales_person, notes, ...dbUpdates } = updated as any;
        const { error } = await sb.from('customers').update(dbUpdates).eq('customer_id', customerId);
        if (error) {
          const { error: error2 } = await sb.from('customers').update(updated).eq('customer_id', customerId);
          if (error2) console.error('Supabase updateCustomer error:', error2.message);
        }
      } catch (e) {
        console.warn('Supabase updateCustomer error:', e);
      }
    }

    customers[index] = updated;
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    this.logActivity('UPDATE_CUSTOMER', 'CUSTOMERS', customerId, `Updated customer ${updated.party_name}`);
    return updated;
  }

  public async deleteCustomer(customerId: string): Promise<boolean> {
    const customers = await this.getCustomers();
    const index = customers.findIndex(c => c.customer_id === customerId);
    if (index === -1) return false;

    const deletedPartyName = customers[index].party_name || customerId;

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('customers').delete().eq('customer_id', customerId);
      } catch (e) {
        console.warn('Supabase deleteCustomer error:', e);
      }
    }

    customers.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    this.logActivity('DELETE_CUSTOMER', 'CUSTOMERS', customerId, `Deleted customer ${deletedPartyName}`);
    return true;
  }

  // --- Quotation Number Generator ---
  public async generateNextQuotationNumber(): Promise<string> {
    const settings = await this.getCompanySettings();
    const rawQuotationsStr = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    const sb = supabaseService.getClient();
    let allQuotes: Partial<Quotation>[] = rawQuotationsStr ? JSON.parse(rawQuotationsStr) : [];
    if (sb) {
      try {
        const { data } = await sb.from('quotations').select('quotation_number');
        if (data && data.length > 0) {
          allQuotes = [...allQuotes, ...data];
        }
      } catch (e) {}
    }

    let maxSeq = settings.starting_number || 1;
    allQuotes.forEach(q => {
      if (q.quotation_number) {
        const match = q.quotation_number.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= maxSeq) {
            maxSeq = num + 1;
          }
        }
      }
    });

    const padded = ('0000' + maxSeq).slice(-4);
    const prefix = settings.quotation_prefix || 'FIMA';
    const fy = settings.financial_year || '26-27';
    return `${prefix}/${fy}/${padded}`;
  }

  // --- Quotations Management ---
  public async getQuotations(): Promise<Quotation[]> {
    const sb = supabaseService.getClient();

    if (sb) {
      try {
        const { data, error } = await sb.from('quotations').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase getQuotations error:', e);
      }
    }

    const localDataStr = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    return localDataStr ? JSON.parse(localDataStr) : [];
  }

  public async getQuotationById(quotationIdOrNumber: string): Promise<Quotation | undefined> {
    const quotations = await this.getQuotations();
    return quotations.find(q => q.quotation_id === quotationIdOrNumber || q.quotation_number === quotationIdOrNumber);
  }

  public async createQuotation(quotationData: Partial<Quotation>): Promise<Quotation> {
    const quotations = await this.getQuotations();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const currentUser = this.getCurrentUser();
    const qNum = quotationData.quotation_number || (await this.generateNextQuotationNumber());
    const uniqueId = quotationData.quotation_id || `QUOT_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const newQuotation: Quotation = {
      quotation_id: uniqueId,
      quotation_number: qNum,
      quotation_date: quotationData.quotation_date || now.split(' ')[0],
      customer_id: quotationData.customer_id || '',
      party_name: quotationData.party_name || '',
      company_name: quotationData.company_name || '',
      contact_person: quotationData.contact_person || '',
      mobile: quotationData.mobile || '',
      email: quotationData.email || '',
      gstin: quotationData.gstin || '',
      billing_address: quotationData.billing_address || '',
      shipping_address: quotationData.shipping_address || quotationData.billing_address || '',
      subtotal: Number(quotationData.subtotal) || 0,
      total_mrp: Number(quotationData.total_mrp) || 0,
      total_clp: Number(quotationData.total_clp) || 0,
      discount: Number(quotationData.discount) || 0,
      freight: Number(quotationData.freight) || 0,
      other_charges: Number(quotationData.other_charges) || 0,
      taxable_amount: Number(quotationData.taxable_amount) || 0,
      cgst: Number(quotationData.cgst) || 0,
      sgst: Number(quotationData.sgst) || 0,
      igst: Number(quotationData.igst) || 0,
      grand_total: Number(quotationData.grand_total) || 0,
      payment_terms: quotationData.payment_terms || '50% Advance with PO, 50% prior to dispatch.',
      delivery_terms: quotationData.delivery_terms || 'Ex-Factory / 3-4 Weeks.',
      validity: quotationData.validity || '30 Days',
      status: quotationData.status || 'DRAFT',
      pdf_file_id: quotationData.pdf_file_id || '',
      pdf_url: quotationData.pdf_url || '',
      whatsapp_status: quotationData.whatsapp_status || 'NOT_SENT',
      created_by: currentUser.name,
      created_at: now,
      updated_at: now,
      sections: quotationData.sections || [],
      items: quotationData.items || []
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('quotations').insert({
          ...newQuotation,
          items: newQuotation.items || [],
          sections: newQuotation.sections || []
        });

        // Also insert into normalized quotation_items if available
        if (newQuotation.items && newQuotation.items.length > 0) {
          const itemsToInsert = newQuotation.items.map(itm => ({
            ...itm,
            quotation_number: newQuotation.quotation_number
          }));
          await sb.from('quotation_items').insert(itemsToInsert);
        }
      } catch (e) {
        console.warn('Supabase createQuotation error:', e);
      }
    }

    quotations.unshift(newQuotation);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
    this.clearQuotationDraft();

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        await this.executeBackend('createQuotation', newQuotation);
      } catch (e) {}
    }
    this.logActivity('CREATE_QUOTATION', 'QUOTATION', newQuotation.quotation_number, `Created quotation for ${newQuotation.party_name} (₹${newQuotation.grand_total.toLocaleString('en-IN')})`);
    return newQuotation;
  }

  public async updateQuotation(quotationId: string, updates: Partial<Quotation>): Promise<Quotation> {
    const quotations = await this.getQuotations();
    const index = quotations.findIndex(q => q.quotation_id === quotationId || q.quotation_number === quotationId);
    if (index === -1) throw new Error('Quotation not found');

    const updated = {
      ...quotations[index],
      ...updates,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        await sb.from('quotations').update({
          ...updated,
          items: updated.items || [],
          sections: updated.sections || []
        }).eq('quotation_id', updated.quotation_id);
      } catch (e) {
        console.warn('Supabase updateQuotation error:', e);
      }
    }

    quotations[index] = updated;
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));

    this.logActivity('UPDATE_QUOTATION', 'QUOTATION', updated.quotation_number, `Updated quotation status to ${updated.status}`);
    return updated;
  }

  public async duplicateQuotation(sourceQuotationId: string): Promise<Quotation> {
    const source = await this.getQuotationById(sourceQuotationId);
    if (!source) throw new Error('Source quotation not found');

    const nextQNum = await this.generateNextQuotationNumber();
    const duplicatedItems = (source.items || []).map((itm, idx) => ({
      ...itm,
      quotation_item_id: `QITM${Date.now()}_${idx}`,
      quotation_number: nextQNum
    }));

    const newQuotation = await this.createQuotation({
      ...source,
      quotation_number: nextQNum,
      quotation_date: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      pdf_file_id: '',
      pdf_url: '',
      whatsapp_status: 'NOT_SENT',
      sections: source.sections || [],
      items: duplicatedItems
    });

    this.logActivity('DUPLICATE_QUOTATION', 'QUOTATION', newQuotation.quotation_number, `Duplicated from ${source.quotation_number}`);
    return newQuotation;
  }

  public async deleteQuotation(quotationId: string): Promise<boolean> {
    const quotations = await this.getQuotations();
    const index = quotations.findIndex(q => q.quotation_id === quotationId || q.quotation_number === quotationId);
    if (index === -1) return false;

    const targetQuotation = quotations[index];

    const sb = supabaseService.getClient();
    if (sb) {
      try {
        if (targetQuotation.quotation_number) {
          await sb.from('quotation_items').delete().eq('quotation_number', targetQuotation.quotation_number);
        }
        const { error } = await sb.from('quotations').delete().eq('quotation_id', targetQuotation.quotation_id);
        if (error) {
          await sb.from('quotations').delete().eq('quotation_number', targetQuotation.quotation_number);
        }
      } catch (e) {
        console.warn('Supabase deleteQuotation error:', e);
      }
    }

    quotations.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
    this.logActivity('DELETE_QUOTATION', 'QUOTATION', targetQuotation.quotation_number, `Deleted quotation ${targetQuotation.quotation_number}`);
    return true;
  }

  // --- Quotation Draft in Local Storage ---
  public saveQuotationDraft(draft: any): void {
    localStorage.setItem(STORAGE_KEYS.QUOTATION_DRAFT, JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString()
    }));
  }

  public getQuotationDraft(): any | null {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTATION_DRAFT);
    return saved ? JSON.parse(saved) : null;
  }

  public clearQuotationDraft(): void {
    localStorage.removeItem(STORAGE_KEYS.QUOTATION_DRAFT);
  }

  // --- Image Upload (Base64 conversion & Drive upload) ---
  public async uploadImage(file: File, folderName: string = 'Products'): Promise<{ fileId: string; fileUrl: string; thumbnailUrl: string }> {
    const base64Data = await this.fileToBase64(file);

    if (!this.isDemoMode && this.config.appsScriptUrl) {
      try {
        const res = await this.executeBackend<{ fileId: string; fileUrl: string; thumbnailUrl: string }>('uploadImage', {
          base64Data,
          fileName: file.name,
          mimeType: file.type,
          folderName
        });
        if (res.success && res.data) {
          this.logActivity('UPLOAD_IMAGE', 'DRIVE_SERVICE', res.data.fileId, `Uploaded ${file.name} to Drive folder: ${folderName}`);
          return res.data;
        }
      } catch (e) {
        console.warn('Apps Script upload failed, using local blob object URL:', e);
      }
    }

    // Local fallback using Base64 string so it persists across refreshes
    const mockFileId = `DRV_LOC_${Date.now()}`;
    this.logActivity('UPLOAD_IMAGE', 'LOCAL_STORAGE', mockFileId, `Cached local image: ${file.name}`);
    return {
      fileId: mockFileId,
      fileUrl: base64Data,
      thumbnailUrl: base64Data
    };
  }

  public fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // --- Dashboard Data Engine ---
  public async getDashboardMetrics() {
    const products = await this.getProducts();
    const customers = await this.getCustomers();
    const quotations = await this.getQuotations();

    const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
    const customizableProducts = products.filter(p => p.customizable === 'YES' && p.status === 'ACTIVE').length;
    const totalQuotationValue = quotations.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);
    const pendingQuotations = quotations.filter(q => q.status === 'DRAFT' || q.status === 'SENT').length;
    const approvedQuotations = quotations.filter(q => q.status === 'APPROVED').length;
    const rejectedQuotations = quotations.filter(q => q.status === 'REJECTED').length;

    // Monthly breakdown
    const monthlyStats: Record<string, { count: number; value: number }> = {};
    quotations.forEach(q => {
      const monthKey = (q.quotation_date || '2026-08').slice(0, 7);
      if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { count: 0, value: 0 };
      monthlyStats[monthKey].count += 1;
      monthlyStats[monthKey].value += Number(q.grand_total) || 0;
    });

    return {
      totalProducts: products.length,
      activeProducts,
      customizableProducts,
      totalCustomers: customers.length,
      totalQuotations: quotations.length,
      totalQuotationValue,
      pendingQuotations,
      approvedQuotations,
      rejectedQuotations,
      monthlyStats,
      recentQuotations: quotations.slice(0, 5)
    };
  }
}

export const api = new ApiService();

