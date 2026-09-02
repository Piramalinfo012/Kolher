import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Sliders,
  Sparkles,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  X,
  ExternalLink,
  Tag
} from 'lucide-react';
import { Product, ProductStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { ProductCustomizerModal } from './ProductCustomizerModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Products: React.FC = () => {
  const { canManageProducts, canDeleteRecords } = useAuth();
  const { success, error, warning } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form State for Add / Edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    model_number: '',
    category: 'Wash Basin Mixers',
    description: '',
    base_price: 15000,
    unit: 'PCS',
    hsn_code: '84818020',
    gst_percentage: 18,
    main_image_url: '',
    has_customization: true,
    status: 'ACTIVE'
  });

  // Upload & Customizer Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [testCustomizerProduct, setTestCustomizerProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      error('Failed to load products', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      model_number: '',
      category: 'Wash Basin Mixers',
      description: '',
      base_price: 15000,
      unit: 'PCS',
      hsn_code: '84818020',
      gst_percentage: 18,
      main_image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
      has_customization: true,
      status: 'ACTIVE'
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setShowFormModal(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || !formData.model_number) {
      warning('Validation Error', 'Product Name and Model Number are required.');
      return;
    }

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.product_id, formData);
        success('Product Updated', `${formData.product_name} updated successfully.`);
      } else {
        await api.createProduct(formData);
        success('Product Created', `${formData.product_name} added to catalog.`);
      }
      setShowFormModal(false);
      loadProducts();
    } catch (err: any) {
      error('Save Failed', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.deleteProduct(productToDelete.product_id);
      success('Product Deleted', `${productToDelete.product_name} removed.`);
      loadProducts();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setProductToDelete(null);
    }
  };

  const categories = [
    'ALL',
    'Wash Basin Mixers',
    'Tall Basin Mixers',
    'Wall-Mounted Mixers',
    'Floor-Mounted Mixers',
    'Thermostatic Showers',
    'Bath Spouts',
    'Accessories'
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            Products Master Catalog
          </h1>
          <p className="text-xs text-neutral-500">
            Kohler India Luxury Bath & Sanitaryware Catalog with Vibrant® PVD finishes, customizable handles, and HSN compliance
          </p>
        </div>

        {canManageProducts && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            id="btn-add-product"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by product name, model code, or spec..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-neutral-900 text-amber-300 shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(p => (
          <div
            key={p.product_id}
            className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Product Visual Container */}
              <div className="relative w-full h-52 bg-neutral-900/5 p-4 flex items-center justify-center overflow-hidden border-b border-neutral-100">
                <img
                  src={p.main_image_url}
                  alt={p.product_name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[10px] font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-md shadow-sm">
                    {p.model_number}
                  </span>
                  {p.has_customization && (
                    <span className="text-[10px] font-bold bg-amber-500/90 text-neutral-950 px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Bespoke
                    </span>
                  )}
                </div>
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {p.status}
                </span>
              </div>

              {/* Info Body */}
              <div className="p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm">
                  {p.category}
                </span>
                <h3 className="font-serif-luxury font-bold text-base text-neutral-950 leading-snug">
                  {p.product_name}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[11px] text-neutral-600">
                  <div>HSN: <strong>{p.hsn_code}</strong></div>
                  <div>GST Rate: <strong>{p.gst_percentage}%</strong></div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-neutral-100">
              <div>
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Base Price</span>
                <div className="text-base font-bold font-serif-luxury text-neutral-950">
                  ₹{Number(p.base_price).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTestCustomizerProduct(p)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Test Bespoke Configurator"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Configure</span>
                </button>

                {canManageProducts && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {canDeleteRecords && (
                  <button
                    type="button"
                    onClick={() => setProductToDelete(p)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-neutral-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name || ''}
                    onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Model Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.model_number || ''}
                    onChange={e => setFormData({ ...formData, model_number: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || 'Wash Basin Mixers'}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium focus:outline-none focus:border-amber-500"
                  >
                    {categories.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Base Price (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.base_price || 0}
                    onChange={e => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={formData.hsn_code || '84818020'}
                    onChange={e => setFormData({ ...formData, hsn_code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    GST Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={formData.gst_percentage || 18}
                    onChange={e => setFormData({ ...formData, gst_percentage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Main Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.main_image_url || ''}
                    onChange={e => setFormData({ ...formData, main_image_url: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-semibold text-neutral-700 flex items-center gap-1 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload to Drive
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_customization ?? true}
                    onChange={e => setFormData({ ...formData, has_customization: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-neutral-800">Enable Bespoke Customization Engine</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'ACTIVE'}
                    onChange={e => setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-neutral-800">Active in Catalog</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <ImageUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          folderName="Products"
          onSuccess={res => {
            setFormData(prev => ({ ...prev, main_image_url: res.fileUrl }));
          }}
        />
      )}

      {/* Test Customizer Modal */}
      {testCustomizerProduct && (
        <ProductCustomizerModal
          isOpen={!!testCustomizerProduct}
          onClose={() => setTestCustomizerProduct(null)}
          product={testCustomizerProduct}
          onAddToQuotation={() => {
            success('Customization Verified', 'Configuration passed validation.');
            setTestCustomizerProduct(null);
          }}
        />
      )}

      {/* Delete Modal */}
      {productToDelete && (
        <ConfirmModal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete ${productToDelete.product_name} (${productToDelete.model_number})?`}
          confirmText="Delete Product"
          isDanger
        />
      )}
    </div>
  );
};
