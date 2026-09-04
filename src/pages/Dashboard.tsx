import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  FileText,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Eye,
  Printer,
  MessageCircle,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Quotation, Product, Customer, CompanySettings } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QuotationPreviewModal } from './QuotationPreviewModal';
import { CardSkeleton } from '../components/SkeletonLoader';

interface DashboardProps {
  onNavigate: (page: string, editId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser, isSales } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [qData, pData, cData, sData] = await Promise.all([
          api.getQuotations(),
          api.getProducts(),
          api.getCustomers(),
          api.getCompanySettings()
        ]);
        setQuotations(qData);
        setProducts(pData);
        setCustomers(cData);
        setSettings(sData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Compute Metrics
  const totalQuotations = quotations.length;
  const totalPipelineRevenue = quotations.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);
  const approvedQuotes = quotations.filter(q => q.status === 'APPROVED');
  const approvedRevenue = approvedQuotes.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);
  const conversionRate = totalQuotations > 0 ? Math.round((approvedQuotes.length / totalQuotations) * 100) : 0;

  // Category MIS Breakdown
  const categoryMISMap: Record<string, { name: string; count: number; value: number; color: string }> = {};
  const palette = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  quotations.forEach(q => {
    const seenCat = new Set<string>();
    (q.items || []).forEach(item => {
      const prod = products.find(p => p.product_id === item.product_id);
      const cat = prod?.category || 'Wash Basin Mixers';
      seenCat.add(cat);

      if (!categoryMISMap[cat]) {
        const color = palette[Object.keys(categoryMISMap).length % palette.length];
        categoryMISMap[cat] = { name: cat, count: 0, value: 0, color };
      }
      categoryMISMap[cat].value += Number(item.line_total || (item.unit_final_price * item.quantity) || 0);
    });

    seenCat.forEach(cat => {
      if (categoryMISMap[cat]) {
        categoryMISMap[cat].count += 1;
      }
    });
  });

  // Fallback if no quote items mapped yet, display products categories
  if (Object.keys(categoryMISMap).length === 0 && products.length > 0) {
    products.forEach(p => {
      if (p.category && !categoryMISMap[p.category]) {
        const color = palette[Object.keys(categoryMISMap).length % palette.length];
        categoryMISMap[p.category] = { name: p.category, count: 0, value: 0, color };
      }
    });
  }

  const categoryPieData = Object.values(categoryMISMap).map(c => ({
    name: c.name,
    value: c.count > 0 ? c.count : 1,
    count: c.count,
    amount: c.value,
    color: c.color
  }));

  // Bar Chart: Top Quotes
  const topQuotesChart = quotations
    .slice(0, 5)
    .map(q => ({
      name: q.party_name.split(' ')[0],
      amount: Number(q.grand_total)
    }));

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 bg-neutral-200 rounded-lg w-1/4 animate-pulse" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-red-950/80 rounded-3xl p-6 sm:p-8 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-red-300 font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              FIMA India Luxury Sanitaryware Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-white">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Real-time synchronization with FIMA Google Sheets database, luxury product visual configurator, and automated A4 quotation dispatcher.
            </p>
          </div>

          {isSales && (
            <button
              onClick={() => onNavigate('new-quotation')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-neutral-950 text-xs sm:text-sm font-bold shadow-lg shadow-red-950/40 flex items-center gap-2 transition-all cursor-pointer shrink-0"
              id="btn-dashboard-new-quote"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Luxury Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs hover:shadow-md hover:border-red-300 dark:hover:border-red-700/50 transition-all duration-300 space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">Total Quotations</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800/40 text-red-600 dark:text-red-400 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-serif-luxury text-neutral-950 dark:text-white tracking-tight">
            {totalQuotations}
          </div>
          <div className="text-[10px] text-neutral-600 dark:text-neutral-400 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% active</span> across sales desk
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all duration-300 space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">Pipeline Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-serif-luxury text-neutral-950 dark:text-white tracking-tight">
            ₹{totalPipelineRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-neutral-600 dark:text-neutral-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Active quotation proposals</span>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-300 space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">Approved Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-serif-luxury text-neutral-950 dark:text-white tracking-tight">
            ₹{approvedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-neutral-600 dark:text-neutral-400 flex items-center gap-1 font-medium">
            <span className="font-bold text-neutral-900 dark:text-neutral-200">{approvedQuotes.length} orders</span> confirmed
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700/50 transition-all duration-300 space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">Win Conversion</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-serif-luxury text-neutral-950 dark:text-white tracking-tight">
            {conversionRate}%
          </div>
          <div className="text-[10px] text-neutral-600 dark:text-neutral-400 flex items-center gap-1 font-medium">
            Across architects & builders
          </div>
        </motion.div>
      </div>

      {/* Visual Charts: Pipeline Distribution & Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Quotations Table (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                Recent Quotations
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Latest customer proposals and status updates
              </p>
            </div>
            <button
              onClick={() => onNavigate('quotation-history')}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              View All ({quotations.length}) <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-mono border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-2.5">Quotation No</th>
                  <th className="py-2.5">Client / Party</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5 text-right">Grand Total</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {quotations.slice(0, 6).map(quote => {
                  const formatDateDDMMYYYY = (dateStr?: string) => {
                    if (!dateStr) return '';
                    const cleanStr = dateStr.split('T')[0];
                    const parts = cleanStr.split('-');
                    if (parts.length === 3 && parts[0].length === 4) {
                      return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    return dateStr;
                  };

                  return (
                    <tr key={quote.quotation_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-neutral-900 dark:text-white">
                        {quote.quotation_number}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-neutral-900 dark:text-white">{quote.party_name}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{quote.company_name || quote.mobile}</div>
                      </td>
                      <td className="py-3 text-neutral-600 dark:text-neutral-400 font-mono">{formatDateDDMMYYYY(quote.quotation_date)}</td>
                      <td className="py-3 text-right font-bold text-neutral-900 dark:text-white">
                        ₹{Number(quote.grand_total).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setPreviewQuote(quote)}
                          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="View Quotation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Status Distribution & Quick Catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category MIS Chart */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                  Category MIS
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Quotations breakdown by category
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800/40">
                MIS Report
              </span>
            </div>


            <div className="h-44 flex items-center justify-center">
              {categoryPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: any, props: any) => [`${props.payload.count} Quotation(s)`, props.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">No category data available</div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs max-h-48 overflow-y-auto pr-1">
              {categoryPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-neutral-800 dark:text-neutral-200 font-semibold text-[11px] truncate">{item.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-neutral-900 dark:text-white font-bold text-xs">{item.count} Quote{item.count !== 1 ? 's' : ''}</span>
                    {item.amount > 0 && (
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block font-mono">₹{item.amount.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access to Catalog */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-6 shadow-md border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                Catalog Fast Access
              </span>
              <Package className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="font-serif-luxury font-bold text-base text-white">
              {products.length} Sanitaryware Products
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Basin mixers, thermostatic showers, and bath spouts ready for bespoke multi-material finishing.
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="w-full mt-2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-300 text-xs font-bold transition-colors cursor-pointer border border-neutral-700"
            >
              Browse Catalog Master →
            </button>
          </div>
        </div>
      </div>

      {/* Quotation Preview Modal */}
      {previewQuote && settings && (
        <QuotationPreviewModal
          isOpen={!!previewQuote}
          onClose={() => setPreviewQuote(null)}
          quotation={previewQuote}
          companySettings={settings}
          onStatusChange={newStatus => {
            setPreviewQuote({ ...previewQuote, status: newStatus });
            setQuotations(prev =>
              prev.map(q => (q.quotation_id === previewQuote.quotation_id ? { ...q, status: newStatus } : q))
            );
          }}
        />
      )}
    </div>
  );
};

