import React, { useState, useEffect } from 'react';
import {
  Palette,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Sparkles,
  Layers,
  Upload
} from 'lucide-react';
import { Finish } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

export const FinishMaster: React.FC = () => {
  const { canManageProducts, canDeleteRecords } = useAuth();
  const { success, error, warning } = useToast();

  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingFinish, setEditingFinish] = useState<Finish | null>(null);
  const [formData, setFormData] = useState<Partial<Finish>>({
    finish_name: '',
    finish_code: '',
    finish_type: 'PVD Vapor Deposition',
    color_hex: '#C5A880',
    texture_css: 'linear-gradient(135deg, #e6d5b8 0%, #c5a880 50%, #9a7b4f 100%)',
    additional_price: 2500,
    status: 'Active'
  });

  const [finishToDelete, setFinishToDelete] = useState<Finish | null>(null);

  const loadFinishes = async () => {
    try {
      setLoading(true);
      const data = await api.getFinishes();
      setFinishes(data);
    } catch (err: any) {
      error('Failed to load finishes', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinishes();
  }, []);

  const handleOpenCreate = () => {
    setEditingFinish(null);
    setFormData({
      finish_name: '',
      finish_code: '',
      finish_type: 'PVD Vapor Deposition',
      color_hex: '#C5A880',
      texture_css: 'linear-gradient(135deg, #e6d5b8 0%, #c5a880 50%, #9a7b4f 100%)',
      additional_price: 2500,
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (f: Finish) => {
    setEditingFinish(f);
    setFormData(f);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.finish_name || !formData.finish_code) {
      warning('Validation Error', 'Finish Name and Code are required');
      return;
    }

    try {
      if (editingFinish) {
        await api.updateFinish(editingFinish.finish_id, formData);
        success('Finish Updated', `${formData.finish_name} saved.`);
      } else {
        await api.createFinish(formData);
        success('Finish Created', `${formData.finish_name} added to master.`);
      }
      setShowModal(false);
      loadFinishes();
    } catch (err: any) {
      error('Save Failed', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!finishToDelete) return;
    try {
      await api.deleteFinish(finishToDelete.finish_id);
      success('Finish Removed', `${finishToDelete.finish_name} deleted.`);
      loadFinishes();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setFinishToDelete(null);
    }
  };

  const filtered = finishes.filter(
    f =>
      f.finish_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.finish_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.finish_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            Architectural Finish Master
          </h1>
          <p className="text-xs text-neutral-500">
            Define metallic coatings (PVD Brushed Gold, Black Chrome, Copper, Stainless Inox) and surcharge pricing
          </p>
        </div>

        {canManageProducts && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            id="btn-add-finish"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Finish</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search finishes by name, code or coating type..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Finishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(f => (
          <div
            key={f.finish_id}
            className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Visual Texture Swatch Box */}
              <div
                className="w-full h-24 rounded-2xl border border-neutral-200 relative overflow-hidden shadow-inner flex items-center justify-center mb-4"
                style={{ background: f.texture_css || f.color_hex || '#C5A880' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />
                <span className="font-mono font-bold text-xs bg-neutral-950/80 text-white px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-md">
                  {f.finish_code}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {f.finish_type}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    f.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-neutral-900 leading-snug">
                  {f.finish_name}
                </h3>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Surcharge</span>
                <div className="text-sm font-bold text-neutral-900">
                  {f.additional_price > 0 ? `+ ₹${Number(f.additional_price).toLocaleString('en-IN')}` : 'Included (₹0)'}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {canManageProducts && (
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                    title="Edit Finish"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDeleteRecords && (
                  <button
                    onClick={() => setFinishToDelete(f)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Delete Finish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Finish Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingFinish ? 'Edit Architectural Finish' : 'Add New Finish Specification'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Finish Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORO SPAZZOLATO"
                    value={formData.finish_name || ''}
                    onChange={e => setFormData({ ...formData, finish_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Finish Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OS"
                    value={formData.finish_code || ''}
                    onChange={e => setFormData({ ...formData, finish_code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Coating Type
                  </label>
                  <input
                    type="text"
                    placeholder="PVD Vapor Deposition"
                    value={formData.finish_type || ''}
                    onChange={e => setFormData({ ...formData, finish_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Additional Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.additional_price || 0}
                    onChange={e => setFormData({ ...formData, additional_price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Color HEX Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color_hex || '#C5A880'}
                    onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-neutral-300 p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color_hex || '#C5A880'}
                    onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  CSS Texture Gradient / Style
                </label>
                <input
                  type="text"
                  placeholder="linear-gradient(135deg, #e6d5b8 0%, #c5a880 50%, #9a7b4f 100%)"
                  value={formData.texture_css || ''}
                  onChange={e => setFormData({ ...formData, texture_css: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
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
                  Save Finish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {finishToDelete && (
        <ConfirmModal
          isOpen={!!finishToDelete}
          onClose={() => setFinishToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Finish"
          message={`Delete finish ${finishToDelete.finish_name}? Products configured with this finish will need re-assignment.`}
          confirmText="Delete Finish"
          isDanger
        />
      )}
    </div>
  );
};
