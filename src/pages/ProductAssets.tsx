import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  X,
  Sparkles,
  Eye
} from 'lucide-react';
import { ProductAsset, Product } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const ProductAssets: React.FC = () => {
  const { canManageProducts, canDeleteRecords } = useAuth();
  const { success, error, warning } = useToast();

  const [assets, setAssets] = useState<ProductAsset[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [layerFilter, setLayerFilter] = useState('ALL');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ProductAsset | null>(null);
  const [formData, setFormData] = useState<Partial<ProductAsset>>({
    product_id: '',
    asset_name: '',
    asset_type: 'BODY',
    layer_type: 'BASE_BODY',
    image_url: '',
    z_index: 1,
    is_transparent: true
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<ProductAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<ProductAsset | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aData, pData] = await Promise.all([
        api.getProductAssets(),
        api.getProducts()
      ]);
      setAssets(aData);
      setProducts(pData);
    } catch (err: any) {
      error('Failed to load assets', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setFormData({
      product_id: products[0]?.product_id || '',
      asset_name: '',
      asset_type: 'BODY',
      layer_type: 'BASE_BODY',
      image_url: '',
      z_index: 1,
      is_transparent: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (asset: ProductAsset) => {
    setEditingAsset(asset);
    setFormData(asset);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_name || !formData.image_url) {
      warning('Validation Error', 'Asset Name and Image URL are required.');
      return;
    }

    try {
      if (editingAsset) {
        await api.updateProductAsset(editingAsset.asset_id, formData);
        success('Asset Updated', 'Asset saved successfully.');
      } else {
        await api.createProductAsset(formData);
        success('Asset Created', 'Layer asset registered.');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      error('Save Failed', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      await api.deleteProductAsset(assetToDelete.asset_id);
      success('Asset Removed', 'Asset removed.');
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setAssetToDelete(null);
    }
  };

  const filtered = assets.filter(a => {
    const prod = products.find(p => p.product_id === a.product_id);
    const matchSearch =
      a.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod && prod.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchLayer = layerFilter === 'ALL' || a.layer_type === layerFilter;
    return matchSearch && matchLayer;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            Product Multi-Layer Assets Master
          </h1>
          <p className="text-xs text-neutral-500">
            Manage transparent PNG overlays for real-time body, handle insert, and spout compositing
          </p>
        </div>

        {canManageProducts && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-red-300 hover:text-red-200 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            id="btn-add-asset"
          >
            <Plus className="w-4 h-4 text-red-400" />
            <span>Add Layer Asset</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search assets by layer name or product..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'BASE_BODY', 'HANDLE_OVERLAY', 'SPOUT_OVERLAY', 'SHADOW_MAP'].map(lt => (
            <button
              key={lt}
              onClick={() => setLayerFilter(lt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                layerFilter === lt
                  ? 'bg-neutral-900 text-red-300 shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {lt.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(asset => {
          const prod = products.find(p => p.product_id === asset.product_id);

          return (
            <div
              key={asset.asset_id}
              className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-40 bg-neutral-900/90 relative overflow-hidden flex items-center justify-center p-3 border-b border-neutral-100">
                  <img
                    src={asset.image_url}
                    alt={asset.asset_name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded border border-neutral-700">
                    Z: {asset.z_index}
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-red-500 text-neutral-950 px-2 py-0.5 rounded">
                    {asset.layer_type}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-sm text-neutral-900 leading-snug">
                    {asset.asset_name}
                  </h3>
                  <div className="text-[11px] text-neutral-500 truncate">
                    Product: {prod?.product_name || 'Generic Layer'}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-400">
                  {asset.is_transparent ? 'Transparent PNG' : 'Solid Layer'}
                </span>

                <div className="flex items-center gap-1">
                  {canManageProducts && (
                    <button
                      onClick={() => handleOpenEdit(asset)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                      title="Edit Asset"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDeleteRecords && (
                    <button
                      onClick={() => setAssetToDelete(asset)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingAsset ? 'Edit Layer Asset' : 'Add New Layer Asset'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Asset Layer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FIMA Components Tall Mixer Body (Moderne Brass)"
                  value={formData.asset_name || ''}
                  onChange={e => setFormData({ ...formData, asset_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Associated Product
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
                  >
                    {products.map(p => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Layer Type
                  </label>
                  <select
                    value={formData.layer_type || 'BASE_BODY'}
                    onChange={e => setFormData({ ...formData, layer_type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
                  >
                    <option value="BASE_BODY">BASE_BODY</option>
                    <option value="HANDLE_OVERLAY">HANDLE_OVERLAY</option>
                    <option value="SPOUT_OVERLAY">SPOUT_OVERLAY</option>
                    <option value="SHADOW_MAP">SHADOW_MAP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Layer Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image_url || ''}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-neutral-300 font-mono text-[11px] focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-semibold text-neutral-700 flex items-center gap-1 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Z-Index (Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.z_index || 1}
                    onChange={e => setFormData({ ...formData, z_index: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_transparent ?? true}
                      onChange={e => setFormData({ ...formData, is_transparent: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="font-bold text-neutral-800">Transparent PNG</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold"
                >
                  Save Asset
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
          folderName="Product Assets"
          onSuccess={res => {
            setFormData(prev => ({ ...prev, image_url: res.fileUrl }));
          }}
        />
      )}

      {/* Delete Confirmation */}
      {assetToDelete && (
        <ConfirmModal
          isOpen={!!assetToDelete}
          onClose={() => setAssetToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Layer Asset"
          message={`Delete asset ${assetToDelete.asset_name}?`}
          confirmText="Delete Asset"
          isDanger
        />
      )}
    </div>
  );
};

