export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SALES' | 'VIEWER';

export interface User {
  user_id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type CustomizableOption = 'YES' | 'NO';
export type ImageMode = 'PRODUCT_IMAGE' | 'COMBINATION_IMAGE' | 'LAYER_BASED' | 'SINGLE_IMAGE';

export interface CustomizationOption {
  id: string;
  name: string;
  image_url?: string;
  price_modifier: number;
}

export interface CustomizationCategory {
  id: string;
  name: string;
  options: CustomizationOption[];
}

export interface ComboImageMap {
  [comboKey: string]: string; // comboKey is sorted option IDs joined by '|'
}

export interface Product {
  product_id: string;
  category: string;
  product_name: string;
  model_number: string;
  description: string;
  base_price: number;
  gst_percentage: number;
  hsn_code: string;
  unit: string;
  main_image_url: string;
  status: ProductStatus;
  customizable: CustomizableOption;
  image_mode?: ImageMode;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Dynamic customization fields
  custom_parts?: CustomizationCategory[];
  combo_images?: ComboImageMap;
}

export interface SparePart {
  part_id: string;
  product_id: string;
  part_name: string;
  part_model: string;
  price: number;
  image_url: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export type FinishType = 'PVD' | 'Chrome' | 'Metallic' | 'Matte' | 'Brushed' | 'Glossy';

export interface Finish {
  finish_id: string;
  finish_name: string;
  finish_code: string;
  finish_image_url: string;
  finish_type: FinishType;
  color_hex?: string;
  texture_css?: string;
  additional_price: number;
  description: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export type HandleMaterial = 'Brass' | 'Metal' | 'Marble' | 'Resin' | 'Wood' | 'Ceramic' | 'Glass';

export interface Handle {
  handle_id: string;
  handle_model: string;
  handle_name: string;
  material: HandleMaterial;
  texture_image_url: string;
  preview_image_url: string;
  color_hex?: string;
  additional_price: number;
  description: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface Combination {
  combination_id: string;
  product_id: string;
  finish_id: string;
  handle_id: string;
  combination_image_url: string;
  additional_price: number;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export type AssetType = 'PRODUCT' | 'FINISH' | 'HANDLE' | 'COMBINATION' | 'GALLERY' | 'TRANSPARENT_LAYER';
export type LayerType = 'BASE_BODY' | 'SPOUT' | 'HANDLE_CAP' | 'LEVER' | 'ROSETTE' | 'ACCENT' | 'NONE';

export interface ProductAsset {
  asset_id: string;
  product_id: string;
  asset_name: string;
  asset_type: AssetType;
  drive_file_id: string;
  drive_url: string;
  layer_type: LayerType;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Customer {
  customer_id: string;
  party_name: string;
  company_name: string;
  contact_person: string;
  mobile: string;
  email: string;
  billing_address: string;
  shipping_address: string;
  gstin: string;
  state: string;
  city: string;
  sales_person: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface CustomizationJSON {
  finish?: string;
  finish_code?: string;
  finish_price?: number;
  handle?: string;
  handle_model?: string;
  handle_price?: number;
  combo_price?: number;
  quantity: number;
  notes?: string;
}

export interface QuotationSection {
  section_id: string;
  section_name: string;
  items?: QuotationItem[];
  subtotal?: number;
  total_mrp?: number;
}

export interface QuotationItem {
  quotation_item_id: string;
  quotation_number: string;
  section_id?: string;
  section_name?: string;
  product_id: string;
  product_name: string;
  model_number: string;
  finish_id: string;
  finish_name: string;
  handle_id: string;
  handle_name: string;
  combination_id: string;
  product_image_url: string;
  quantity: number;
  unit: string;
  base_price: number;
  mrp?: number;
  clp?: number; // Customer Landing Price / Rate
  finish_price: number;
  handle_price: number;
  additional_price: number;
  discount: number; // percentage or line discount
  gst: number; // GST rate e.g. 18
  unit_final_price: number;
  line_total: number;
  customization_json: CustomizationJSON;
  created_at?: string;
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type WhatsAppStatus = 'NOT_SENT' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Quotation {
  quotation_id: string;
  quotation_number: string;
  quotation_date: string;
  customer_id: string;
  party_name: string;
  company_name?: string;
  contact_person: string;
  mobile: string;
  email: string;
  gstin: string;
  billing_address: string;
  shipping_address: string;
  subtotal: number;
  total_mrp?: number;
  total_clp?: number;
  discount: number;
  freight: number;
  other_charges: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grand_total: number;
  payment_terms: string;
  delivery_terms: string;
  validity: string;
  status: QuotationStatus;
  pdf_file_id: string;
  pdf_url: string;
  whatsapp_status: WhatsAppStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  sections?: QuotationSection[];
  items?: QuotationItem[];
}

export interface CompanySettings {
  company_name: string;
  logo_drive_url: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  bank_name: string;
  account_number: string;
  ifsc: string;
  branch: string;
  quotation_prefix: string;
  financial_year: string;
  starting_number: number;
  default_gst: number;
  default_payment_terms: string;
  default_delivery_terms: string;
  default_validity: string;
  terms_conditions: string;
  authorized_signatory: string;
}

export interface ActivityLog {
  log_id: string;
  user_id: string;
  user_name: string;
  action: string;
  module: string;
  reference_id: string;
  description: string;
  timestamp: string;
  ip_address?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errorCode?: string;
}

export interface ConfigSettings {
  spreadsheetId: string;
  driveFolderId: string;
  appsScriptUrl: string;
  isConfigured: boolean;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  lastChecked?: string;
  autoSync?: boolean;
}

export interface SupabaseTableStatus {
  tableName: string;
  label: string;
  rowCount: number;
  status: 'synced' | 'pending' | 'error' | 'not_created';
  error?: string;
}
