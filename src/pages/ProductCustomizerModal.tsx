import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Heart,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';
import { Product, QuotationItem, CustomizationJSON, CustomizationOption, CustomizationCategory } from '../types';
import { useToast } from '../context/ToastContext';
import { Product3DViewer } from '../components/Product3DViewer';

interface ProductCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  initialCustomization?: Partial<QuotationItem> | null;
  onAddToQuotation: (customizedItem: QuotationItem) => void;
}

const DEFAULT_CUSTOM_PARTS: CustomizationCategory[] = [
  {
    id: 'cat_finishes',
    name: 'FINISHES',
    options: [
      { id: 'opt_chrome', name: 'Chrome / INOX', price_modifier: 0 },
      { id: 'opt_gold', name: 'Brushed Gold', price_modifier: 2500 },
      { id: 'opt_black', name: 'Brushed Black Chrome', price_modifier: 2000 },
      { id: 'opt_rose_gold', name: 'Rose Gold PVD', price_modifier: 3000 }
    ]
  },
  {
    id: 'cat_handle',
    name: 'HANDLE',
    options: [
      { id: 'opt_h_match', name: 'Matching Finish', price_modifier: 0 },
      { id: 'opt_h_white_marble', name: 'White Marble Calacatta', price_modifier: 4000 },
      { id: 'opt_h_black_marble', name: 'Black Marble Marquina', price_modifier: 4500 }
    ]
  }
];

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  isOpen,
  onClose,
  product,
  initialCustomization,
  onAddToQuotation
}) => {
  const { success, warning } = useToast();
  
  // Dynamic Parts state: Mapping Category ID to selected Option
  const [selectedOptions, setSelectedOptions] = useState<Record<string, CustomizationOption>>({});

  const [quantity, setQuantity] = useState<number>(1);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [gstIncluded, setGstIncluded] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'PHOTO' | '3D'>('PHOTO');

  const effectiveParts = useMemo(() => {
    if (product?.custom_parts && product.custom_parts.length > 0) {
      return product.custom_parts;
    }
    return DEFAULT_CUSTOM_PARTS;
  }, [product]);

  useEffect(() => {
    if (!isOpen || !product) return;

    // Initialize selections with the first option of each category
    const initialSelections: Record<string, CustomizationOption> = {};
    effectiveParts.forEach(part => {
      if (part.options && part.options.length > 0) {
        initialSelections[part.id] = part.options[0];
      }
    });
    
    setSelectedOptions(initialSelections);

    if (initialCustomization) {
      setQuantity(initialCustomization.quantity || 1);
      setDiscountAmount(initialCustomization.discount || 0);
      setItemNotes(initialCustomization.customization_json?.notes || '');
    } else {
      setQuantity(1);
      setDiscountAmount(0);
      setItemNotes('');
    }
  }, [isOpen, product, initialCustomization, effectiveParts]);

  const has3D = product ? (
    product.product_name.toUpperCase().includes('SLIDE') || 
    product.product_name.toUpperCase().includes('FLO') ||
    product.product_name.toUpperCase().includes('EXP') ||
    product.product_name.toUpperCase().includes('EXPOSED') ||
    product.product_name.toUpperCase().includes('3804')
  ) : false;

  if (!isOpen || !product) return null;

  // Determine current image based on selected combo
  let photoImageUrl = product.main_image_url;
  
  const options = Object.values(selectedOptions) as CustomizationOption[];
  const comboKey = options
    .map(opt => opt.id)
    .sort()
    .join('|');
    
  if (product.combo_images && product.combo_images[comboKey]) {
    photoImageUrl = product.combo_images[comboKey];
  }

  // Pricing Calculation
  const basePrice = Number(product.base_price) || 0;
  let dynamicPartsPrice = 0;
  const optionsList = Object.values(selectedOptions) as CustomizationOption[];
  optionsList.forEach(opt => {
    dynamicPartsPrice += Number(opt.price_modifier) || 0;
  });

  const unitFinalPrice = basePrice + dynamicPartsPrice;
  const grossSubtotal = unitFinalPrice * quantity;
  const taxableAmount = Math.max(0, grossSubtotal - discountAmount);
  const gstRate = Number(product.gst_percentage) || 18;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const grandTotal = gstIncluded ? taxableAmount : taxableAmount + gstAmount;

  const handleConfirm = () => {
    const entries = Object.entries(selectedOptions) as [string, CustomizationOption][];
    const selectedNames = entries.map(([catId, opt]) => {
      const cat = effectiveParts.find(c => c.id === catId);
      return `${cat?.name}: ${opt.name}`;
    }).join(', ');

    const finishSummary = optionsList.map(o => o.name).join(' + ');

    const customizationData: CustomizationJSON & { dynamic_parts_summary: string } = {
      quantity,
      notes: itemNotes,
      dynamic_parts_summary: selectedNames
    };

    const finalUnitMrp = unitFinalPrice;
    const existingClp = initialCustomization?.clp;
    const rateToUse = existingClp !== undefined && existingClp > 0 ? existingClp : finalUnitMrp;

    const customizedItem: QuotationItem = {
      quotation_item_id: initialCustomization?.quotation_item_id || `QITM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      quotation_number: initialCustomization?.quotation_number || '',
      section_id: initialCustomization?.section_id || '',
      section_name: initialCustomization?.section_name || '',
      product_id: product.product_id,
      product_name: product.product_name,
      model_number: product.model_number,
      finish_id: comboKey,
      finish_name: finishSummary,
      handle_id: '',
      handle_name: '',
      combination_id: comboKey,
      product_image_url: photoImageUrl,
      quantity,
      unit: product.unit || 'PCS',
      base_price: basePrice,
      mrp: finalUnitMrp,
      clp: existingClp,
      finish_price: dynamicPartsPrice,
      handle_price: 0,
      additional_price: 0,
      discount: discountAmount,
      gst: gstRate,
      unit_final_price: finalUnitMrp,
      line_total: rateToUse * quantity,
      customization_json: customizationData
    };

    onAddToQuotation(customizedItem);
    success(
      initialCustomization ? 'Item Updated' : 'Added to Quotation',
      `${product.product_name} configured successfully.`
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#FAFAFA] rounded-3xl shadow-2xl max-w-6xl w-full border border-neutral-200 overflow-hidden flex flex-col max-h-[94vh]"
          id="dynamic-product-customizer-dialog"
        >
          {/* ================= TOP HEADER BAR ================= */}
          <div className="px-6 py-4 bg-white border-b border-neutral-200/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  {product.model_number}
                </span>
                <h1 className="text-xl sm:text-2xl font-serif text-neutral-900 font-bold tracking-tight">
                  {product.product_name}
                </h1>
                <p className="text-xs text-neutral-500 font-light italic">
                  {product.category || 'Luxury Sanitaryware'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-2.5 rounded-full border transition-colors ${
                  isFavorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================= MAIN 2-COLUMN VIEWPORT ================= */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* LEFT COLUMN: DYNAMIC SWATCH SELECTORS */}
            <div className="lg:col-span-5 xl:col-span-4 p-6 space-y-8 overflow-y-auto bg-white border-r border-neutral-200/80">
              
              {effectiveParts.map((part, index) => (
                <div key={part.id} className="space-y-3.5">
                  {index !== 0 && <hr className="border-neutral-200" />}
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans">
                      {part.name}
                    </h3>
                    {selectedOptions[part.id] && (
                      <span className="text-[11px] font-medium text-red-900 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                        {selectedOptions[part.id].name} {selectedOptions[part.id].price_modifier > 0 ? `(+₹${selectedOptions[part.id].price_modifier.toLocaleString('en-IN')})` : ''}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pt-1">
                    {part.options.map(opt => {
                      const isSelected = selectedOptions[part.id]?.id === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [part.id]: opt }))}
                          className="group flex flex-col items-center text-center transition-all cursor-pointer"
                        >
                          <div
                            className={`w-12 h-12 rounded-full transition-all relative flex items-center justify-center shadow-sm overflow-hidden border border-neutral-100 ${
                              isSelected ? 'ring-1 ring-neutral-300 scale-105' : 'hover:scale-105 hover:shadow-md'
                            }`}
                            style={{ background: opt.image_url ? `url(${opt.image_url}) center/cover` : '#E5E5E5' }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />
                          </div>
                          <span className={`mt-2 text-[9px] font-medium tracking-wide uppercase leading-tight max-w-[75px] line-clamp-3 ${isSelected ? 'text-[#0B2545] font-bold' : 'text-neutral-500'}`}>
                            {opt.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* SECTION: NOTES */}
              <div className="pt-6 border-t border-neutral-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Customization Instructions
                </label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={e => setItemNotes(e.target.value)}
                  placeholder="e.g., Master Bathroom Suite..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: VISUALIZER STAGE */}
            <div className="lg:col-span-7 xl:col-span-8 bg-gradient-to-b from-[#FAF8F5] via-[#F4F3EF] to-[#ECEAE4] p-6 flex flex-col justify-between relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-600 bg-white/80 border border-neutral-200/80 px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-red-600" />
                  Bespoke Configuration
                </span>
                <div className="flex items-center gap-1.5 bg-white/80 border border-neutral-200/80 p-0.5 rounded-xl shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('PHOTO')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      viewMode === 'PHOTO' ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Photo Studio
                  </button>
                  {has3D && (
                    <button
                      type="button"
                      onClick={() => setViewMode('3D')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        viewMode === '3D' ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      3D Model
                    </button>
                  )}
                </div>
              </div>

              <div className="relative w-full aspect-square max-h-[500px] flex items-center justify-center my-auto">
                {viewMode === '3D' ? (
                  <Product3DViewer 
                    modelUrl={`/products/${product.model_number.toLowerCase().replace(/[/\\ ]/g, '-')}.glb`} 
                  />
                ) : (
                  <img
                    src={photoImageUrl}
                    alt="Configured Product"
                    className="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = product.main_image_url;
                    }}
                  />
                )}
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Base Catalog Price:</span>
                  <span className="font-mono text-neutral-800">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                {(() => {
                  const entries = Object.entries(selectedOptions) as [string, CustomizationOption][];
                  return entries.map(([catId, opt]) => {
                    const cat = product.custom_parts?.find(c => c.id === catId);
                    if (opt.price_modifier > 0) {
                      return (
                        <div key={catId} className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                          <span>{cat?.name} ({opt.name}):</span>
                          <span className="font-mono text-red-700">+ ₹{opt.price_modifier.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    }
                    return null;
                  });
                })()}
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs font-bold text-neutral-900">
                  <span>Unit MRP (Excl. Taxes):</span>
                  <span className="font-mono text-neutral-900 text-sm">₹{unitFinalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM BAR ================= */}
          <div className="px-6 py-4 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Quantity:
              </span>
              <div className="flex items-center border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold font-mono text-neutral-900 min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  Line Total (INR)
                </div>
                <div className="text-xl sm:text-2xl font-bold font-serif text-neutral-950">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>{initialCustomization ? 'Save & Update Item' : 'Add to Quotation'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
