import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: { fileId: string; fileUrl: string; thumbnailUrl: string }) => void;
  title?: string;
  folderName?: 'Products' | 'Product Assets' | 'Finish Images' | 'Handle Images' | 'Combination Images' | 'Company Assets';
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Upload Image Asset',
  folderName = 'Products'
}) => {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(png|jpeg|jpg|webp)/)) {
      error('Unsupported File Format', 'Please select a PNG, JPG, JPEG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      error('File Too Large', 'Maximum image size is 10 MB.');
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      const res = await api.uploadImage(selectedFile, folderName);
      success('Image Uploaded', `Asset archived successfully in Google Drive folder: ${folderName}`);
      onSuccess(res);
      handleClose();
    } catch (err: any) {
      error('Upload Failed', err.message || 'Unable to complete Google Drive upload');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden"
          id="image-upload-modal"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center font-bold">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Target Folder: Google Drive / {folderName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-white transition-colors p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!previewUrl ? (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-red-400 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <div className="w-14 h-14 rounded-2xl bg-red-100/60 dark:bg-red-950/80 text-red-800 dark:text-red-300 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Click to upload or drag & drop
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Supports PNG (transparent layers supported), JPG, WEBP up to 10MB
                </p>
                <span className="inline-block mt-4 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-200 shadow-xs">
                  Browse Files
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-900 flex items-center justify-center min-h-[200px] max-h-[260px]">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[250px] w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-neutral-900/80 text-white hover:bg-neutral-900 p-1.5 rounded-lg text-xs flex items-center gap-1 backdrop-blur-xs"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                {selectedFile && (
                  <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <span className="font-medium truncate max-w-[280px]">{selectedFile.name}</span>
                    <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                type="button"
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                type="button"
                className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-sm flex items-center gap-2 transition-all"
                id="btn-upload-submit"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    Uploading to Drive...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-red-400" />
                    Confirm & Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

