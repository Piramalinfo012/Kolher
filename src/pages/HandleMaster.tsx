import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { Handle } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const HandleMaster: React.FC = () => {
  const { canManageProducts, canDeleteRecords } = useAuth();
  const { success, error, warning } = useToast();

  const [handles, setHandles] = useState<Handle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('ALL');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingHandle, setEditingHandle] = useState<Handle | null>(null);
  const [formData, setFormData] = useState<Partial<Handle>>({
    handle_name: '',
    handle_model: 'F1420',
    material: 'Marble',
    texture_image_url: '',
    preview_image_url: '',
    additional_price: 3500,
    status: 'Active'
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [handleToDelete, setHandleToDelete] = useState<Handle | null>(null);

  const loadHandles = async () => {
    try {
      setLoading(true);
      const data = await api.getHandles();
      setHandles(data);
    } catch (err: any) {
      error('Failed to load handles', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHandles();
  }, []);

  const handleOpenCreate = () => {
    setEditingHandle(null);
    setFormData({
      handle_name: '',
      handle_model: 'F1420',
      material: 'Marble',
      texture_image_url: 'https://images.unsplash.com/photo-1590725140246-201509653a15?w=500&auto=format&fit=crop&q=80',
      preview_image_url: 'https://images.unsplash.com/photo-1590725140246-201509653a15?w=500&auto=format&fit=crop&q=80',
      additional_price: 3500,
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (h: Handle) => {
    setEditingHandle(h);
    setFormData(h);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.handle_name) {
      warning('Validation Error', 'Handle Name is required');
      return;
    }

    try {
      if (editingHandle) {
        await api.updateHandle(editingHandle.handle_id, formData);
        success('Handle Updated', `${formData.handle_name} saved.`);
      } else {
        await api.createHandle(formData);
        success('Handle Created', `${formData.handle_name} added to master.`);
      }
      setShowModal(false);
      loadHandles();
    } catch (err: any) {
      error('Save Failed', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!handleToDelete) return;
    try {
      await api.deleteHandle(handleToDelete.handle_id);
      success('Handle Removed', `${handleToDelete.handle_name} deleted.`);
      loadHandles();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setHandleToDelete(null);
    }
  };

  const materials = ['ALL', 'Marble', 'Wood', 'Resin', 'Metal'];

  const filtered = handles.filter(h => {
    const matchesSearch =
      h.handle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.handle_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMat = materialFilter === 'ALL' || h.material === materialFilter;
    return matchesSearch && matchesMat;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            Handle / Knob Master (Model F1420)
          </h1>
          <p className="text-xs text-neutral-500">
            Customizable inserts: Italian Carrara Marble, Verde Guatemala, Bog Oak Wood, Hand-Cast Luxury Resins
          </p>
        </div>

        {canManageProducts && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            id="btn-add-handle"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Handle / Knob</span>
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
            placeholder="Search handle by material, marble name, or model..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase font-mono">Material:</span>
          {materials.map(mat => (
            <button
              key={mat}
              onClick={() => setMaterialFilter(mat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                materialFilter === mat
                  ? 'bg-neutral-900 text-amber-300 shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Handles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(h => (
          <div
            key={h.handle_id}
            className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Texture Image Stage */}
              <div className="w-full h-36 bg-neutral-900/5 relative overflow-hidden flex items-center justify-center p-2 border-b border-neutral-100">
                <img
                  src={h.texture_image_url || h.preview_image_url}
                  alt={h.handle_name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 text-[10px] font-mono font-bold bg-neutral-900/80 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                  {h.handle_model}
                </span>
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  {h.material}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-neutral-900 leading-snug">
                  {h.handle_name}
                </h3>
                <div className="text-[11px] text-neutral-500">
                  Model: {h.handle_model} • {h.material}
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-neutral-100 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Add-On</span>
                <div className="text-sm font-bold text-neutral-900">
                  + ₹{Number(h.additional_price).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {canManageProducts && (
                  <button
                    onClick={() => handleOpenEdit(h)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                    title="Edit Handle"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDeleteRecords && (
                  <button
                    onClick={() => setHandleToDelete(h)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Delete Handle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Handle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingHandle ? 'Edit Handle Specification' : 'Add New Handle / Knob'}
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
                    Handle / Knob Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marmo Nero Marquina"
                    value={formData.handle_name || ''}
                    onChange={e => setFormData({ ...formData, handle_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Handle Model Code
                  </label>
                  <input
                    type="text"
                    value={formData.handle_model || 'F1420'}
                    onChange={e => setFormData({ ...formData, handle_model: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Material Type
                  </label>
                  <select
                    value={formData.material || 'Marble'}
                    onChange={e => setFormData({ ...formData, material: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Marble">Marble</option>
                    <option value="Wood">Wood</option>
                    <option value="Resin">Resin</option>
                    <option value="Metal">Metal</option>
                  </select>
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
                  Texture / Thumbnail Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.texture_image_url || ''}
                    onChange={e => setFormData({ ...formData, texture_image_url: e.target.value, preview_image_url: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-neutral-300 font-mono text-[11px] focus:outline-none focus:border-amber-500"
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
                  Save Handle
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
          folderName="Handle Images"
          onSuccess={res => {
            setFormData(prev => ({
              ...prev,
              texture_image_url: res.fileUrl,
              preview_image_url: res.fileUrl
            }));
          }}
        />
      )}

      {/* Delete Confirmation */}
      {handleToDelete && (
        <ConfirmModal
          isOpen={!!handleToDelete}
          onClose={() => setHandleToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Handle"
          message={`Are you sure you want to delete ${handleToDelete.handle_name}?`}
          confirmText="Delete Handle"
          isDanger
        />
      )}
    </div>
  );
};
