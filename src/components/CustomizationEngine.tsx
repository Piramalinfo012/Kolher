import React, { useState } from 'react';
import { Plus, Trash2, Upload, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { CustomizationCategory, CustomizationOption, ComboImageMap } from '../types';
import { ImageUploadModal } from './ImageUploadModal';
import { useToast } from '../context/ToastContext';

interface CustomizationEngineProps {
  customParts: CustomizationCategory[];
  comboImages: ComboImageMap;
  onChange: (parts: CustomizationCategory[], combos: ComboImageMap) => void;
}

export const CustomizationEngine: React.FC<CustomizationEngineProps> = ({ customParts = [], comboImages = {}, onChange }) => {
  const { warning } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [uploadTargetCombo, setUploadTargetCombo] = useState<string | null>(null);
  const [uploadTargetSwatch, setUploadTargetSwatch] = useState<{ catId: string, optId: string } | null>(null);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const addCategory = () => {
    const newId = `cat_${Date.now()}`;
    onChange(
      [...customParts, { id: newId, name: 'New Part', options: [] }],
      comboImages
    );
    setExpandedCategories([...expandedCategories, newId]);
  };

  const removeCategory = (id: string) => {
    onChange(customParts.filter(c => c.id !== id), comboImages);
  };

  const updateCategoryName = (id: string, name: string) => {
    onChange(
      customParts.map(c => c.id === id ? { ...c, name } : c),
      comboImages
    );
  };

  const addOption = (catId: string) => {
    onChange(
      customParts.map(c => {
        if (c.id === catId) {
          return {
            ...c,
            options: [...c.options, { id: `opt_${Date.now()}`, name: 'New Option', price_modifier: 0, image_url: '' }]
          };
        }
        return c;
      }),
      comboImages
    );
  };

  const removeOption = (catId: string, optId: string) => {
    onChange(
      customParts.map(c => {
        if (c.id === catId) {
          return { ...c, options: c.options.filter(o => o.id !== optId) };
        }
        return c;
      }),
      comboImages
    );
  };

  const updateOption = (catId: string, optId: string, updates: Partial<CustomizationOption>) => {
    onChange(
      customParts.map(c => {
        if (c.id === catId) {
          return {
            ...c,
            options: c.options.map(o => o.id === optId ? { ...o, ...updates } : o)
          };
        }
        return c;
      }),
      comboImages
    );
  };

  // Generate all possible combinations
  const generateCombinations = () => {
    if (customParts.length === 0) return [];
    
    // Check if any category has no options
    if (customParts.some(c => c.options.length === 0)) {
       return [];
    }

    let combinations: CustomizationOption[][] = [[]];

    for (const part of customParts) {
      const temp: CustomizationOption[][] = [];
      for (const combo of combinations) {
        for (const option of part.options) {
          temp.push([...combo, option]);
        }
      }
      combinations = temp;
    }

    return combinations;
  };

  const allCombinations = generateCombinations();

  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-neutral-800">Customizable Parts</h4>
          <button
            type="button"
            onClick={addCategory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add Part
          </button>
        </div>

        <div className="space-y-3">
          {customParts.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors"
                onClick={() => toggleCategory(cat.id)}
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.includes(cat.id) ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
                  <input 
                    type="text" 
                    value={cat.name}
                    onChange={e => updateCategoryName(cat.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-red-500/20 px-1 rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); }}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expandedCategories.includes(cat.id) && (
                <div className="p-3 border-t border-neutral-100">
                  <div className="space-y-2">
                    {cat.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.name}
                          placeholder="Option Name (e.g. Chrome)"
                          onChange={e => updateOption(cat.id, opt.id, { name: e.target.value })}
                          className="flex-1 text-xs p-1.5 border border-neutral-200 rounded-md focus:outline-none focus:border-red-500"
                        />
                        <div className="flex items-center gap-1 border border-neutral-200 rounded-md px-1 bg-neutral-50">
                          <span className="text-xs text-neutral-500">₹</span>
                          <input
                            type="number"
                            value={opt.price_modifier}
                            placeholder="Price"
                            onChange={e => updateOption(cat.id, opt.id, { price_modifier: Number(e.target.value) })}
                            className="w-16 text-xs p-1.5 bg-transparent border-none focus:outline-none text-right"
                          />
                        </div>
                        <div className="flex-1 flex gap-1 relative group">
                          <input
                            type="text"
                            value={opt.image_url || ''}
                            placeholder="Swatch Image URL"
                            onChange={e => updateOption(cat.id, opt.id, { image_url: e.target.value })}
                            className="w-full text-xs p-1.5 border border-neutral-200 rounded-md focus:outline-none focus:border-red-500 pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setUploadTargetSwatch({ catId: cat.id, optId: opt.id })}
                            className="absolute right-1 top-1 p-1 text-neutral-400 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded cursor-pointer"
                            title="Upload Swatch Image"
                          >
                            <Upload className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(cat.id, opt.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(cat.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 mt-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {customParts.length === 0 && (
            <div className="text-center py-6 text-sm text-neutral-500">
              No parts added yet. Click "Add Part" to start building your configurator.
            </div>
          )}
        </div>
      </div>

      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
        <h4 className="font-bold text-neutral-800 mb-4">Combination Image Mapping</h4>
        
        {customParts.some(c => c.options.length === 0) ? (
          <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            Please add at least one option to every part to generate combinations.
          </div>
        ) : allCombinations.length === 0 ? (
          <div className="text-xs text-neutral-500">
            Add parts and options above to see combinations.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {allCombinations.map((combo, idx) => {
              // Sort IDs to ensure stable combination key regardless of order
              const comboKey = [...combo].map(o => o.id).sort().join('|');
              const comboName = combo.map(o => o.name).join(' + ');
              const hasImage = !!comboImages[comboKey];

              return (
                <div key={comboKey} className="flex items-center justify-between p-2 bg-white rounded-lg border border-neutral-200 shadow-sm text-xs">
                  <div className="flex items-center gap-2">
                    {hasImage ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-neutral-300" />
                    )}
                    <span className="font-medium text-neutral-700">{comboName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={comboImages[comboKey] || ''}
                      onChange={e => onChange(customParts, { ...comboImages, [comboKey]: e.target.value })}
                      placeholder="Combo Image URL"
                      className="w-48 text-[10px] p-1.5 border border-neutral-200 rounded focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadTargetCombo(comboKey)}
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {uploadTargetCombo && (
        <ImageUploadModal
          isOpen={!!uploadTargetCombo}
          onClose={() => setUploadTargetCombo(null)}
          folderName="CombinationImages"
          onSuccess={(res) => {
            onChange(customParts, { ...comboImages, [uploadTargetCombo]: res.fileUrl });
            setUploadTargetCombo(null);
          }}
        />
      )}

      {uploadTargetSwatch && (
        <ImageUploadModal
          isOpen={!!uploadTargetSwatch}
          onClose={() => setUploadTargetSwatch(null)}
          folderName="ProductAssets"
          title="Upload Swatch Image"
          onSuccess={(res) => {
            updateOption(uploadTargetSwatch.catId, uploadTargetSwatch.optId, { image_url: res.fileUrl });
            setUploadTargetSwatch(null);
          }}
        />
      )}
    </div>
  );
};
