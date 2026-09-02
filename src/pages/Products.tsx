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
import { Product, ProductStatus, SparePart } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { ProductCustomizerModal } from './ProductCustomizerModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { CustomizationEngine } from '../components/CustomizationEngine';

export const Products: React.FC = () => {
  const { canManageProducts, canDeleteRecords } = useAuth();
  const { success, error, warning } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form State for Add / Edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'SPARE_PARTS' | 'CUSTOM_PARTS'>('DETAILS');
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [showSparePartForm, setShowSparePartForm] = useState(false);
  const [showSparePartUploadModal, setShowSparePartUploadModal] = useState(false);
  const [editingSparePart, setEditingSparePart] = useState<SparePart | null>(null);
  const [sparePartFormData, setSparePartFormData] = useState<Partial<SparePart>>({
    part_name: '',
    part_model: '',
    price: 0,
    image_url: '',
    status: 'ACTIVE'
  });

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

  const handleOpenEdit = async (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setActiveTab('DETAILS');
    setShowSparePartForm(false);
    setShowFormModal(true);
    
    // Load spare parts for this product
    try {
      const parts = await api.getSparePartsByProduct(p.product_id);
      setSpareParts(parts);
    } catch (err) {
      console.warn('Failed to load spare parts', err);
    }
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

  const handleSaveSparePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!sparePartFormData.part_name || !sparePartFormData.part_model) {
      warning('Validation Error', 'Spare Part Name and Model are required.');
      return;
    }
    
    try {
      if (editingSparePart) {
        await api.updateSparePart(editingSparePart.part_id, sparePartFormData);
        success('Spare Part Updated', `${sparePartFormData.part_name} updated.`);
      } else {
        await api.createSparePart({ ...sparePartFormData, product_id: editingProduct.product_id });
        success('Spare Part Added', `${sparePartFormData.part_name} added.`);
      }
      setShowSparePartForm(false);
      setEditingSparePart(null);
      
      const parts = await api.getSparePartsByProduct(editingProduct.product_id);
      setSpareParts(parts);
    } catch (err: any) {
      error('Save Failed', err.message);
    }
  };

  const handleDeleteSparePart = async (partId: string) => {
    if (!window.confirm('Delete this spare part?')) return;
    try {
      await api.deleteSparePart(partId);
      success('Spare Part Deleted', 'Spare part removed successfully.');
      if (editingProduct) {
        const parts = await api.getSparePartsByProduct(editingProduct.product_id);
        setSpareParts(parts);
      }
    } catch (err: any) {
      error('Delete Failed', err.message);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gradient-to-r from-neutral-950 to-neutral-900 p-8 rounded-3xl shadow-xl relative overflow-hidden border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-serif-luxury text-white tracking-tight">
            Products Master Catalog
          </h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-xl leading-relaxed">
            FIMA India Luxury Bath & Sanitaryware Catalog with Vibrant® PVD finishes, customizable handles, and HSN compliance.
          </p>
        </div>

        {canManageProducts && (
          <button
            onClick={handleOpenCreate}
            className="relative z-10 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            id="btn-add-product"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-5 sticky top-20 z-20">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by product name, model code, or spec..."
            className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scroll-smooth">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {filteredProducts.map(p => (
          <div
            key={p.product_id}
            className="group relative bg-white rounded-[2rem] border border-neutral-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-red-900/5 hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between"
          >
            <div>
              {/* Product Visual Container */}
              <div className="relative w-full h-64 bg-gradient-to-b from-neutral-50 to-neutral-100 p-6 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img
                  src={p.main_image_url}
                  alt={p.product_name}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 drop-shadow-xl transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="text-[10px] font-mono font-bold bg-white/90 backdrop-blur-md text-neutral-900 px-2.5 py-1 rounded-lg shadow-sm border border-neutral-200/50">
                    {p.model_number}
                  </span>
                  {p.has_customization && (
                    <span className="text-[10px] font-bold bg-red-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 w-fit">
                      <Sparkles className="w-3 h-3" /> Bespoke
                    </span>
                  )}
                </div>
                <span className={`absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md ${
                  p.status === 'ACTIVE' ? 'bg-emerald-500/90 text-white' : 'bg-neutral-500/90 text-white'
                }`}>
                  {p.status}
                </span>
              </div>

              {/* Info Body */}
              <div className="p-6 space-y-3 relative bg-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-md inline-block">
                  {p.category}
                </span>
                <h3 className="font-serif-luxury font-bold text-xl text-neutral-900 leading-tight group-hover:text-red-600 transition-colors">
                  {p.product_name}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                <div className="pt-4 mt-2 border-t border-neutral-100 flex items-center gap-4 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-neutral-400"/> HSN: <strong className="text-neutral-800">{p.hsn_code}</strong></div>
                  <div className="w-px h-3 bg-neutral-200"></div>
                  <div>GST: <strong className="text-neutral-800">{p.gst_percentage}%</strong></div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between bg-white">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Base Price</span>
                <div className="text-xl font-bold font-serif-luxury text-neutral-950 mt-0.5">
                  ₹{Number(p.base_price).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTestCustomizerProduct(p)}
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-neutral-900/20"
                  title="Test Bespoke Configurator"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Configure</span>
                </button>

                {canManageProducts && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200 cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {canDeleteRecords && (
                  <button
                    type="button"
                    onClick={() => setProductToDelete(p)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-red-500 transition-colors border border-transparent hover:border-red-500 cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>      {/* Add / Edit Product Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          <form onSubmit={handleSaveForm} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Product Configuration' : 'Add New Product to Catalog'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editingProduct && (
              <div className="flex items-center gap-4 px-6 pt-4 border-b border-neutral-200 shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setActiveTab('DETAILS')}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'DETAILS' ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Product Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CUSTOM_PARTS')}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'CUSTOM_PARTS' ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Custom Parts & Combo
                </button>
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'CUSTOM_PARTS' && editingProduct && (
                <CustomizationEngine
                  customParts={formData.custom_parts || []}
                  comboImages={formData.combo_images || {}}
                  onChange={(parts, combos) => setFormData({ ...formData, custom_parts: parts, combo_images: combos })}
                />
              )}
              {activeTab === 'DETAILS' && (
                <div className="space-y-4 text-xs">
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
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-red-500"
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
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-semibold focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category || 'Wash Basin Mixers'}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium focus:outline-none focus:border-red-500"
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
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:outline-none focus:border-red-500"
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
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:border-red-500"
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
                        className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
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
                        className="flex-1 p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500 font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-semibold text-neutral-700 flex items-center gap-1 shrink-0 cursor-pointer"
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
                      className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_customization ?? true}
                        onChange={e => setFormData({ ...formData, has_customization: e.target.checked })}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="font-bold text-neutral-800">Enable Bespoke Customization Engine</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.status === 'ACTIVE'}
                        onChange={e => setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="font-bold text-neutral-800">Active in Catalog</span>
                    </label>
                  </div>
                </div>
              )}


            </div>

            {/* Persistent Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-neutral-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold shadow-sm cursor-pointer text-xs"
              >
                Save Product
              </button>
            </div>
          </form>
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

      {/* Spare Part Upload Modal */}
      {showSparePartUploadModal && (
        <ImageUploadModal
          isOpen={showSparePartUploadModal}
          onClose={() => setShowSparePartUploadModal(false)}
          folderName="Products/SpareParts"
          onSuccess={res => {
            setSparePartFormData(prev => ({ ...prev, image_url: res.fileUrl }));
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

