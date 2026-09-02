import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Save,
  CheckCircle2,
  Package,
  Palette,
  Sliders,
  Percent,
  Layers
} from 'lucide-react';
import { Product, Finish, Handle } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const PriceManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const { success, error, warning, info } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [handles, setHandles] = useState<Handle[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk Adjustment Form
  const [targetType, setTargetType] = useState<'PRODUCTS' | 'FINISHES' | 'HANDLES'>('PRODUCTS');
  const [adjustmentType, setAdjustmentType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [adjustmentValue, setAdjustmentValue] = useState<number>(5);
  const [direction, setDirection] = useState<'INCREASE' | 'DECREASE'>('INCREASE');

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, fData, hData] = await Promise.all([
        api.getProducts(),
        api.getFinishes(),
        api.getHandles()
      ]);
      setProducts(pData);
      setFinishes(fData);
      setHandles(hData);
    } catch (err: any) {
      error('Failed to load prices', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyBulkMarkup = async () => {
    if (!isAdmin) {
      warning('Permission Denied', 'Only Admins can perform bulk price revisions.');
      return;
    }

    try {
      const multiplier = direction === 'INCREASE' ? 1 + (adjustmentValue / 100) : 1 - (adjustmentValue / 100);
      const flatDelta = direction === 'INCREASE' ? adjustmentValue : -adjustmentValue;

      if (targetType === 'PRODUCTS') {
        for (const p of products) {
          const newPrice = adjustmentType === 'PERCENT'
            ? Math.round(Number(p.base_price) * multiplier)
            : Math.max(0, Number(p.base_price) + flatDelta);
          await api.updateProduct(p.product_id, { base_price: newPrice });
        }
        success('Product Base Prices Updated', `Adjusted all ${products.length} products by ${adjustmentValue}${adjustmentType === 'PERCENT' ? '%' : ' INR'}`);
      } else if (targetType === 'FINISHES') {
        for (const f of finishes) {
          const newPrice = adjustmentType === 'PERCENT'
            ? Math.round(Number(f.additional_price) * multiplier)
            : Math.max(0, Number(f.additional_price) + flatDelta);
          await api.updateFinish(f.finish_id, { additional_price: newPrice });
        }
        success('Finish Surcharges Updated', `Adjusted ${finishes.length} architectural finishes.`);
      } else {
        for (const h of handles) {
          const newPrice = adjustmentType === 'PERCENT'
            ? Math.round(Number(h.additional_price) * multiplier)
            : Math.max(0, Number(h.additional_price) + flatDelta);
          await api.updateHandle(h.handle_id, { additional_price: newPrice });
        }
        success('Handle Prices Updated', `Adjusted ${handles.length} handle inserts.`);
      }

      loadData();
    } catch (err: any) {
      error('Markup Update Failed', err.message);
    }
  };

  const handleQuickInlineUpdate = async (type: 'PRODUCT' | 'FINISH' | 'HANDLE', id: string, newPrice: number) => {
    try {
      if (type === 'PRODUCT') {
        await api.updateProduct(id, { base_price: newPrice });
      } else if (type === 'FINISH') {
        await api.updateFinish(id, { additional_price: newPrice });
      } else {
        await api.updateHandle(id, { additional_price: newPrice });
      }
      success('Price Saved', 'Individual item rate updated.');
      loadData();
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            Price Matrix & Bulk Markup Management
          </h1>
          <p className="text-xs text-neutral-500">
            Centrally adjust base products, PVD coating premiums, and marble handle surcharges
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Bulk Adjustment Tool */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold tracking-wide uppercase">
            Bulk Price Inflation / Margin Revision Tool
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 font-bold uppercase mb-1">Target Catalog:</label>
            <select
              value={targetType}
              onChange={e => setTargetType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="PRODUCTS">All Product Base Prices ({products.length})</option>
              <option value="FINISHES">All Finish Surcharges ({finishes.length})</option>
              <option value="HANDLES">All Handle / Knob Prices ({handles.length})</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 font-bold uppercase mb-1">Adjustment Mode:</label>
            <select
              value={adjustmentType}
              onChange={e => setAdjustmentType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="PERCENT">Percentage (%)</option>
              <option value="FLAT">Flat Amount (INR)</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 font-bold uppercase mb-1">Action & Value:</label>
            <div className="flex gap-2">
              <select
                value={direction}
                onChange={e => setDirection(e.target.value as any)}
                className="p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-semibold focus:outline-none"
              >
                <option value="INCREASE">Increase (+)</option>
                <option value="DECREASE">Decrease (-)</option>
              </select>
              <input
                type="number"
                min={0}
                value={adjustmentValue}
                onChange={e => setAdjustmentValue(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-amber-300 font-bold text-center"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyBulkMarkup}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold shadow-md transition-all cursor-pointer"
            >
              Apply Revisions
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed Interactive Pricing Tables */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
          Direct Line-Item Price Editor
        </h3>

        {/* Products Table */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1.5">
            <Package className="w-4 h-4 text-amber-600" /> Products Master Base Prices
          </div>
          <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Model</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Current Base Price</th>
                  <th className="p-3 text-right">Edit Rate (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map(p => (
                  <tr key={p.product_id} className="hover:bg-neutral-50/60">
                    <td className="p-3 font-mono font-bold text-neutral-900">{p.model_number}</td>
                    <td className="p-3 font-semibold text-neutral-900">{p.product_name}</td>
                    <td className="p-3 text-neutral-500">{p.category}</td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      ₹{Number(p.base_price).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        defaultValue={p.base_price}
                        onBlur={e => handleQuickInlineUpdate('PRODUCT', p.product_id, Number(e.target.value))}
                        className="w-28 p-1.5 rounded-lg border border-neutral-300 text-right font-bold text-xs focus:outline-none focus:border-amber-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Finishes Table */}
        <div className="space-y-3 pt-4">
          <div className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-amber-600" /> Architectural Finish Surcharges
          </div>
          <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Finish Name</th>
                  <th className="p-3">Coating Spec</th>
                  <th className="p-3 text-right">Current Surcharge</th>
                  <th className="p-3 text-right">Edit Surcharge (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {finishes.map(f => (
                  <tr key={f.finish_id} className="hover:bg-neutral-50/60">
                    <td className="p-3 font-mono font-bold text-neutral-900">{f.finish_code}</td>
                    <td className="p-3 font-semibold text-neutral-900">{f.finish_name}</td>
                    <td className="p-3 text-neutral-500">{f.finish_type}</td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      ₹{Number(f.additional_price).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        defaultValue={f.additional_price}
                        onBlur={e => handleQuickInlineUpdate('FINISH', f.finish_id, Number(e.target.value))}
                        className="w-28 p-1.5 rounded-lg border border-neutral-300 text-right font-bold text-xs focus:outline-none focus:border-amber-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
