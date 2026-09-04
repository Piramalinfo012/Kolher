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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-900 dark:text-white">
            Bespoke Handle & Knob Master Directory
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Catalog of Italian Marble, Solid Hardwood, and Hand-crafted Brass handles for custom mixers
          </p>
        </div>

        {canManageProducts && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            id="btn-add-handle"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Handle / Knob</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search handle by material, marble name, or model..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase font-mono">Material:</span>
          {materials.map(mat => (
            <button
              key={mat}
              onClick={() => setMaterialFilter(mat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                materialFilter === mat
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
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
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Texture Image Stage */}
              <div className="w-full h-36 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden flex items-center justify-center p-2 border-b border-neutral-100 dark:border-neutral-800">
                <img
                  src={h.texture_image_url || h.preview_image_url}
                  alt={h.handle_name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 text-[10px] font-mono font-bold bg-neutral-950/80 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                  {h.handle_model}
                </span>
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded">
                  {h.material}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug">
                  {h.handle_name}
                </h3>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Model: {h.handle_model} • {h.material}
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-neutral-600 dark:text-neutral-400 uppercase">Add-On</span>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  + ₹{Number(h.additional_price).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {canManageProducts && (
                  <button
                    onClick={() => handleOpenEdit(h)}
                    className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    title="Edit Handle"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDeleteRecords && (
                  <button
                    onClick={() => setHandleToDelete(h)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingHandle ? 'Edit Handle Specification' : 'Add New Handle / Knob'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Handle / Knob Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marmo Nero Marquina"
                    value={formData.handle_name || ''}
                    onChange={e => setFormData({ ...formData, handle_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Handle Model Code
                  </label>
                  <input
                    type="text"
                    value={formData.handle_model || 'F1420'}
                    onChange={e => setFormData({ ...formData, handle_model: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Material Type
                  </label>
                  <select
                    value={formData.material || 'Marble'}
                    onChange={e => setFormData({ ...formData, material: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Marble" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Marble</option>
                    <option value="Wood" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Wood</option>
                    <option value="Resin" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Resin</option>
                    <option value="Metal" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Metal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Additional Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.additional_price || 0}
                    onChange={e => setFormData({ ...formData, additional_price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Texture / Thumbnail Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.texture_image_url || ''}
                    onChange={e => setFormData({ ...formData, texture_image_url: e.target.value, preview_image_url: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
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

