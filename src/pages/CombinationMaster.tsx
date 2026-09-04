import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  X,
  Sparkles,
  Link2
} from 'lucide-react';
import { Combination, Product, Finish, Handle } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const CombinationMaster: React.FC = () => {
  const { canManageProducts, canDeleteRecords } = useAuth();
  const { success, error, warning } = useToast();

  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [handles, setHandles] = useState<Handle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combination | null>(null);
  const [formData, setFormData] = useState<Partial<Combination>>({
    product_id: '',
    finish_id: '',
    handle_id: '',
    combination_image_url: '',
    additional_price: 0,
    status: 'Active'
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<Combination | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, pData, fData, hData] = await Promise.all([
        api.getCombinations(),
        api.getProducts(),
        api.getFinishes(),
        api.getHandles()
      ]);
      setCombinations(cData);
      setProducts(pData);
      setFinishes(fData);
      setHandles(hData);
    } catch (err: any) {
      error('Failed to load combinations', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCombo(null);
    setFormData({
      product_id: products[0]?.product_id || '',
      finish_id: finishes[0]?.finish_id || '',
      handle_id: handles[0]?.handle_id || '',
      combination_image_url: '',
      additional_price: 0,
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Combination) => {
    setEditingCombo(c);
    setFormData(c);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.finish_id || !formData.handle_id) {
      warning('Validation Error', 'Product, Finish, and Handle must be selected.');
      return;
    }

    try {
      if (editingCombo) {
        await api.updateCombination(editingCombo.combination_id, formData);
        success('Combination Updated', 'Studio pre-render configuration saved.');
      } else {
        await api.createCombination(formData);
        success('Combination Created', 'New studio combination added to mapping catalog.');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      error('Save Failed', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!comboToDelete) return;
    try {
      await api.deleteCombination(comboToDelete.combination_id);
      success('Combination Removed', 'Mapping removed.');
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setComboToDelete(null);
    }
  };

  const filtered = combinations.filter(c => {
    const prod = products.find(p => p.product_id === c.product_id);
    const fin = finishes.find(f => f.finish_id === c.finish_id);
    const hnd = handles.find(h => h.handle_id === c.handle_id);

    const matchText = `${prod?.product_name || ''} ${fin?.finish_name || ''} ${hnd?.handle_name || ''}`.toLowerCase();
    return matchText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950 dark:text-white">
            Studio Combination Master
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Map specific [Product + Finish + Handle] trios to pre-rendered, high-fidelity luxury photographs
          </p>
        </div>

        {canManageProducts && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-red-300 hover:text-red-200 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            id="btn-add-combination"
          >
            <Plus className="w-4 h-4 text-red-400" />
            <span>Map New Combination</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search combination by product name, finish, or marble..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* Combination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(combo => {
          const prod = products.find(p => p.product_id === combo.product_id);
          const fin = finishes.find(f => f.finish_id === combo.finish_id);
          const hnd = handles.find(h => h.handle_id === combo.handle_id);

          return (
            <div
              key={combo.combination_id}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-48 bg-neutral-900/5 dark:bg-neutral-800/40 relative overflow-hidden flex items-center justify-center p-3 border-b border-neutral-100 dark:border-neutral-800">
                  <img
                    src={combo.combination_image_url || prod?.main_image_url}
                    alt={prod?.product_name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded shadow-xs">
                    {combo.status}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-800 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded">
                      {prod?.model_number || 'MODEL'}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-950 dark:text-white mt-1 leading-snug">
                      {prod?.product_name || 'Sanitaryware Unit'}
                    </h3>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 dark:text-neutral-400">Finish:</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-200">{fin?.finish_name || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 dark:text-neutral-400">Handle / Knob:</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-200">{hnd?.handle_name || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase">Combo Surcharge</span>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">
                    {combo.additional_price > 0 ? `+ ₹${Number(combo.additional_price).toLocaleString('en-IN')}` : '₹0 (Standard)'}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {canManageProducts && (
                    <button
                      onClick={() => handleOpenEdit(combo)}
                      className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Edit Mapping"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDeleteRecords && (
                    <button
                      onClick={() => setComboToDelete(combo)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete Mapping"
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

      {/* Add / Edit Combo Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingCombo ? 'Edit Combination Mapping' : 'Map Product + Finish + Handle'}
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
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Select Product *
                </label>
                <select
                  required
                  value={formData.product_id}
                  onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold focus:outline-none focus:border-red-500"
                >
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} ({p.model_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Select Finish *
                  </label>
                  <select
                    required
                    value={formData.finish_id}
                    onChange={e => setFormData({ ...formData, finish_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    {finishes.map(f => (
                      <option key={f.finish_id} value={f.finish_id}>
                        {f.finish_name} ({f.finish_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Select Handle / Knob *
                  </label>
                  <select
                    required
                    value={formData.handle_id}
                    onChange={e => setFormData({ ...formData, handle_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    {handles.map(h => (
                      <option key={h.handle_id} value={h.handle_id}>
                        {h.handle_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  High-Res Pre-Rendered Combination Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.combination_image_url || ''}
                    onChange={e => setFormData({ ...formData, combination_image_url: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-1 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Combination Surcharge (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.additional_price || 0}
                    onChange={e => setFormData({ ...formData, additional_price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold"
                >
                  Save Combination
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
          folderName="Combination Images"
          onSuccess={res => {
            setFormData(prev => ({ ...prev, combination_image_url: res.fileUrl }));
          }}
        />
      )}

      {/* Delete Confirmation */}
      {comboToDelete && (
        <ConfirmModal
          isOpen={!!comboToDelete}
          onClose={() => setComboToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Combination"
          message="Are you sure you want to delete this studio combination mapping?"
          confirmText="Delete Combination"
          isDanger
        />
      )}
    </div>
  );
};

