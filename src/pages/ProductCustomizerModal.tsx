import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Check,
  Sliders,
  Plus,
  Minus,
  Heart,
  ArrowRight,
  Eye,
  Layers,
  RotateCcw,
  CheckCircle2,
  Share2,
  FileText
} from 'lucide-react';
import { Product, Finish, Handle, Combination, QuotationItem, CustomizationJSON } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { InteractiveVisualizer, getVisualizerDataUrl } from '../components/InteractiveVisualizer';

interface ProductCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  initialCustomization?: Partial<QuotationItem> | null;
  onAddToQuotation: (customizedItem: QuotationItem) => void;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  isOpen,
  onClose,
  product,
  initialCustomization,
  onAddToQuotation
}) => {
  const { success, warning } = useToast();
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [handles, setHandles] = useState<Handle[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);

  // Selection states
  const [selectedFinish, setSelectedFinish] = useState<Finish | null>(null);
  const [selectedHandle, setSelectedHandle] = useState<Handle | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [gstIncluded, setGstIncluded] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'INTERACTIVE' | 'PHOTO'>('INTERACTIVE');

  useEffect(() => {
    if (!isOpen || !product) return;

    const loadMasterData = async () => {
      const [fData, hData, cData] = await Promise.all([
        api.getFinishes(),
        api.getHandles(),
        api.getCombinations()
      ]);

      const activeFinishes = fData.filter(f => f.status === 'Active');
      const activeHandles = hData.filter(h => h.status === 'Active');
      setFinishes(activeFinishes);
      setHandles(activeHandles);
      setCombinations(cData);

      // Set initial finish & handle
      if (initialCustomization) {
        const initF = activeFinishes.find(f => f.finish_id === initialCustomization.finish_id) || activeFinishes[0];
        const initH = activeHandles.find(h => h.handle_id === initialCustomization.handle_id) || activeHandles[0];
        setSelectedFinish(initF);
        setSelectedHandle(initH);
        setQuantity(initialCustomization.quantity || 1);
        setDiscountAmount(initialCustomization.discount || 0);
        setItemNotes(initialCustomization.customization_json?.notes || '');
      } else {
        // Defaults: Brushed Inox / Gold & Calacatta / Matching Finish
        const defaultFinish = activeFinishes.find(f => f.finish_code === 'INOX' || f.finish_code === 'OS') || activeFinishes[0];
        const defaultHandle = activeHandles.find(h => h.handle_name.includes('CALACATTA') || h.handle_name.includes('MATCH')) || activeHandles[0];
        setSelectedFinish(defaultFinish || null);
        setSelectedHandle(defaultHandle || null);
        setQuantity(1);
        setDiscountAmount(0);
        setItemNotes('');
      }
    };

    loadMasterData();
  }, [isOpen, product, initialCustomization]);

  // Derived Dynamic Model Code (e.g. F5801 + INOX -> F5801INOX, F5801 + OS -> F5801OS)
  const dynamicModelCode = useMemo(() => {
    if (!product) return '';
    const baseCode = product.model_number || 'F5801';
    const finishCode = selectedFinish?.finish_code || '';
    if (!finishCode) return baseCode;

    // If base code already contains finish code, return as is
    if (baseCode.toUpperCase().endsWith(finishCode.toUpperCase())) {
      return baseCode;
    }
    // Clean trailing hyphens or model suffixes if needed
    const cleanBase = baseCode.replace(/-[0-9A-Z]+$/, '');
    return `${cleanBase}${finishCode}`;
  }, [product, selectedFinish]);

  if (!isOpen || !product) return null;

  // Combination resolution
  const matchedCombination = combinations.find(
    c =>
      c.product_id === product.product_id &&
      c.finish_id === selectedFinish?.finish_id &&
      c.handle_id === selectedHandle?.handle_id &&
      c.status === 'Active'
  );

  const photoImageUrl =
    matchedCombination?.combination_image_url ||
    selectedHandle?.preview_image_url ||
    product.main_image_url;

  // Pricing Engine Calculations
  const basePrice = Number(product.base_price) || 0;
  const finishPrice = Number(selectedFinish?.additional_price) || 0;
  const handlePrice = Number(selectedHandle?.additional_price) || 0;
  const comboPrice = Number(matchedCombination?.additional_price) || 0;

  const unitFinalPrice = basePrice + finishPrice + handlePrice + comboPrice;
  const grossSubtotal = unitFinalPrice * quantity;
  const taxableAmount = Math.max(0, grossSubtotal - discountAmount);
  const gstRate = Number(product.gst_percentage) || 18;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const grandTotal = gstIncluded ? taxableAmount : taxableAmount + gstAmount;

  const handleConfirm = () => {
    if (!selectedFinish || !selectedHandle) {
      warning('Incomplete Selection', 'Please choose a metallic finish and handle/knob design.');
      return;
    }

    const customizationData: CustomizationJSON = {
      finish: selectedFinish.finish_name,
      finish_code: selectedFinish.finish_code,
      finish_price: finishPrice,
      handle: selectedHandle.handle_name,
      handle_model: selectedHandle.handle_model,
      handle_price: handlePrice,
      combo_price: comboPrice,
      quantity,
      notes: itemNotes
    };

    const finalUnitMrp = unitFinalPrice;
    const existingClp = initialCustomization?.clp;
    const rateToUse = existingClp !== undefined && existingClp > 0 ? existingClp : finalUnitMrp;

    const visualizerImageUrl = getVisualizerDataUrl(selectedFinish, selectedHandle, {
      model: dynamicModelCode || product.model_number,
      productName: product.product_name
    });

    const customizedItem: QuotationItem = {
      quotation_item_id: initialCustomization?.quotation_item_id || `QITM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      quotation_number: initialCustomization?.quotation_number || '',
      section_id: initialCustomization?.section_id || '',
      section_name: initialCustomization?.section_name || '',
      product_id: product.product_id,
      product_name: product.product_name,
      model_number: dynamicModelCode,
      finish_id: selectedFinish.finish_id,
      finish_name: selectedFinish.finish_name,
      handle_id: selectedHandle.handle_id,
      handle_name: selectedHandle.handle_name,
      combination_id: matchedCombination?.combination_id || '',
      product_image_url: visualizerImageUrl || photoImageUrl,
      quantity,
      unit: product.unit || 'PCS',
      base_price: basePrice,
      mrp: finalUnitMrp,
      clp: existingClp,
      finish_price: finishPrice,
      handle_price: handlePrice,
      additional_price: comboPrice,
      discount: discountAmount,
      gst: gstRate,
      unit_final_price: finalUnitMrp,
      line_total: rateToUse * quantity,
      customization_json: customizationData
    };

    onAddToQuotation(customizedItem);
    success(
      initialCustomization ? 'Item Updated' : 'Added to Quotation',
      `${product.product_name} (${selectedFinish.finish_name} + ${selectedHandle.handle_name}) configured.`
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
          id="italian-product-customizer-dialog"
        >
          {/* ================= TOP HEADER BAR ================= */}
          <div className="px-6 py-4 bg-white border-b border-neutral-200/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  {dynamicModelCode}
                </span>
                <h1 className="text-xl sm:text-2xl font-serif text-neutral-900 font-bold tracking-tight">
                  {product.product_name.toUpperCase().includes('SLIDE') ? 'SLIDE' : product.product_name}
                </h1>
                <p className="text-xs text-neutral-500 font-light italic">
                  {product.category || 'Miscelatore lavabo'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Wishlist Heart */}
              <button
                type="button"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-2.5 rounded-full border transition-colors ${
                  isFavorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-400 hover:text-rose-500'
                }`}
                title="Save to Favorites"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-500 hover:text-neutral-900 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================= MAIN 2-COLUMN VIEWPORT ================= */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* LEFT COLUMN: SWATCH SELECTORS (FINITURE + MANOPOLA F1420) */}
            <div className="lg:col-span-6 p-6 space-y-8 overflow-y-auto bg-white border-r border-neutral-200/80">
              {/* SECTION 1: FINITURE (FINISHES) */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans">
                    FINITURE
                  </h3>
                  {selectedFinish && (
                    <span className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {selectedFinish.finish_name} {selectedFinish.additional_price > 0 ? `(+₹${selectedFinish.additional_price.toLocaleString('en-IN')})` : ''}
                    </span>
                  )}
                </div>

                {/* Circular Swatches Grid for Finishes */}
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 pt-1">
                  {finishes.map(finish => {
                    const isSelected = selectedFinish?.finish_id === finish.finish_id;
                    return (
                      <button
                        type="button"
                        key={finish.finish_id}
                        onClick={() => setSelectedFinish(finish)}
                        className={`group flex flex-col items-center text-center p-2 rounded-2xl transition-all cursor-pointer ${
                          isSelected ? 'bg-amber-50/60 ring-2 ring-amber-500/80 shadow-xs' : 'hover:bg-neutral-50'
                        }`}
                      >
                        {/* Circular Swatch */}
                        <div
                          className={`w-14 h-14 rounded-full border-2 transition-all relative flex items-center justify-center shadow-xs overflow-hidden ${
                            isSelected
                              ? 'border-neutral-900 scale-105 shadow-md ring-2 ring-white'
                              : 'border-neutral-300 group-hover:border-neutral-400 group-hover:scale-102'
                          }`}
                          style={{
                            background: finish.texture_css || finish.color_hex || '#C8C8C8'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/30 pointer-events-none" />
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Finish Label */}
                        <span className="mt-2 text-[10px] font-bold tracking-tight text-neutral-800 uppercase leading-tight max-w-[100px] line-clamp-2">
                          {finish.finish_name}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
                          {finish.finish_code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DIVIDER */}
              <hr className="border-neutral-200" />

              {/* SECTION 2: MANOPOLA F1420 (HANDLES / KNOBS) */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans">
                    MANOPOLA F1420
                  </h3>
                  {selectedHandle && (
                    <span className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {selectedHandle.handle_name} {selectedHandle.additional_price > 0 ? `(+₹${selectedHandle.additional_price.toLocaleString('en-IN')})` : ''}
                    </span>
                  )}
                </div>

                {/* Circular Swatches Grid for Handles */}
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 pt-1">
                  {handles.map(handle => {
                    const isSelected = selectedHandle?.handle_id === handle.handle_id;
                    const isMatch = handle.handle_name.toUpperCase().includes('MATCH') || handle.material === 'Metal';

                    return (
                      <button
                        type="button"
                        key={handle.handle_id}
                        onClick={() => setSelectedHandle(handle)}
                        className={`group flex flex-col items-center text-center p-2 rounded-2xl transition-all cursor-pointer ${
                          isSelected ? 'bg-amber-50/60 ring-2 ring-amber-500/80 shadow-xs' : 'hover:bg-neutral-50'
                        }`}
                      >
                        {/* Circular Handle Swatch */}
                        <div
                          className={`w-14 h-14 rounded-full border-2 transition-all relative flex items-center justify-center shadow-xs overflow-hidden ${
                            isSelected
                              ? 'border-neutral-900 scale-105 shadow-md ring-2 ring-white'
                              : 'border-neutral-300 group-hover:border-neutral-400 group-hover:scale-102'
                          }`}
                          style={{
                            background: isMatch
                              ? selectedFinish?.texture_css || selectedFinish?.color_hex || '#C8C8C8'
                              : handle.color_hex || '#2B2B2B'
                          }}
                        >
                          {/* Tactile Texture Background */}
                          {!isMatch && handle.texture_image_url && (
                            <img
                              src={handle.texture_image_url}
                              alt={handle.handle_name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20 pointer-events-none" />

                          {isSelected && (
                            <div className="absolute w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Handle Label */}
                        <span className="mt-2 text-[10px] font-bold tracking-tight text-neutral-800 uppercase leading-tight max-w-[100px] line-clamp-2">
                          {isMatch ? `${selectedFinish?.finish_name || 'MATCH'} FINISH` : handle.handle_name}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
                          {handle.material || 'Special'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: NOTES & SPECIFICATIONS */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Customization Instructions / Room Location
                </label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={e => setItemNotes(e.target.value)}
                  placeholder="e.g., Master Bathroom Suite, Level 2 Vanity, Gold pop-up waste match..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: HIGH-DEFINITION INTERACTIVE VISUALIZER STAGE */}
            <div className="lg:col-span-6 bg-gradient-to-b from-[#FAF8F5] via-[#F4F3EF] to-[#ECEAE4] p-6 flex flex-col justify-between relative">
              {/* Studio Canvas Status Badges */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-600 bg-white/80 border border-neutral-200/80 px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Bespoke Real-Time Render
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/80 border border-neutral-200/80 p-0.5 rounded-xl shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('INTERACTIVE')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      viewMode === 'INTERACTIVE'
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Studio 3D Vector
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('PHOTO')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      viewMode === 'PHOTO'
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Photo Match
                  </button>
                </div>
              </div>

              {/* Interactive Faucet Stage */}
              <div className="relative w-full aspect-4/3 max-h-[440px] flex items-center justify-center my-auto">
                {viewMode === 'INTERACTIVE' ? (
                  <InteractiveVisualizer
                    finish={selectedFinish}
                    handle={selectedHandle}
                    productName={product.product_name}
                    modelNumber={dynamicModelCode || product.model_number}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={photoImageUrl}
                      alt={product.product_name}
                      className="max-h-full max-w-full object-contain drop-shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Floating Active Material Chips */}
                <div className="absolute bottom-1 left-2 right-2 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    {selectedFinish && (
                      <span className="bg-white/90 backdrop-blur-md border border-neutral-200/80 text-neutral-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ background: selectedFinish.color_hex || '#C8C8C8' }}
                        />
                        {selectedFinish.finish_name}
                      </span>
                    )}
                    {selectedHandle && (
                      <span className="bg-white/90 backdrop-blur-md border border-neutral-200/80 text-neutral-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-xs">
                        {selectedHandle.handle_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Base Catalog Price:</span>
                  <span className="font-mono text-neutral-800">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                {finishPrice > 0 && (
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span>Finish ({selectedFinish?.finish_name}):</span>
                    <span className="font-mono text-amber-700">+ ₹{finishPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {handlePrice > 0 && (
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span>Handle ({selectedHandle?.handle_name}):</span>
                    <span className="font-mono text-amber-700">+ ₹{handlePrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs font-bold text-neutral-900">
                  <span>Unit MRP (Excl. Taxes):</span>
                  <span className="font-mono text-neutral-900 text-sm">₹{unitFinalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM FIXED COMMERCIAL BAR ================= */}
          <div className="px-6 py-4 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg">
            {/* Quantity Selector */}
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
              <span className="text-xs text-neutral-400 font-mono">
                {product.unit || 'PCS'}
              </span>
            </div>

            {/* Total & Action Buttons */}
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
                  id="btn-confirm-customization"
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
