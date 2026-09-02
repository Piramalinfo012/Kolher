import React, { useState, useEffect } from 'react';
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

  // Status Distribution Chart
  const statusCounts = {
    DRAFT: quotations.filter(q => q.status === 'DRAFT').length,
    SENT: quotations.filter(q => q.status === 'SENT').length,
    APPROVED: quotations.filter(q => q.status === 'APPROVED').length,
    REJECTED: quotations.filter(q => q.status === 'REJECTED').length
  };

  const pieData = [
    { name: 'Draft', value: statusCounts.DRAFT, color: '#9ca3af' },
    { name: 'Sent', value: statusCounts.SENT, color: '#3b82f6' },
    { name: 'Approved', value: statusCounts.APPROVED, color: '#10b981' },
    { name: 'Rejected', value: statusCounts.REJECTED, color: '#ef4444' }
  ].filter(d => d.value > 0);

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
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/80 rounded-3xl p-6 sm:p-8 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Kohler India Luxury Sanitaryware Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-white">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Real-time synchronization with Kohler Google Sheets database, luxury product visual configurator, and automated A4 quotation dispatcher.
            </p>
          </div>

          {isSales && (
            <button
              onClick={() => onNavigate('new-quotation')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all cursor-pointer shrink-0"
              id="btn-dashboard-new-quote"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Luxury Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Quotations</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif-luxury text-neutral-950">
            {totalQuotations}
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
            <span className="text-emerald-700 font-bold">100% active</span> across sales desk
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Pipeline Value</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif-luxury text-neutral-950">
            ₹{totalPipelineRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active quotation proposals</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Approved Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif-luxury text-neutral-950">
            ₹{approvedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
            <span className="font-bold text-neutral-900">{approvedQuotes.length} orders</span> confirmed
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Win Conversion</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif-luxury text-neutral-950">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
            Across architects & builders
          </div>
        </div>
      </div>

      {/* Visual Charts: Pipeline Distribution & Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Quotations Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Recent Quotations
              </h3>
              <p className="text-xs text-neutral-500">
                Latest customer proposals and status updates
              </p>
            </div>
            <button
              onClick={() => onNavigate('quotation-history')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              View All ({quotations.length}) <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-neutral-400 uppercase font-mono border-b border-neutral-100">
                <tr>
                  <th className="py-2.5">Quotation No</th>
                  <th className="py-2.5">Client / Party</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5 text-right">Grand Total</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {quotations.slice(0, 6).map(quote => {
                  const statusBadges: Record<string, string> = {
                    DRAFT: 'bg-neutral-100 text-neutral-700',
                    SENT: 'bg-blue-50 text-blue-800 border-blue-200',
                    APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
                    EXPIRED: 'bg-amber-50 text-amber-800 border-amber-200'
                  };

                  return (
                    <tr key={quote.quotation_id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-neutral-900">
                        {quote.quotation_number}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-neutral-900">{quote.party_name}</div>
                        <div className="text-[11px] text-neutral-500">{quote.company_name || quote.mobile}</div>
                      </td>
                      <td className="py-3 text-neutral-500">{quote.quotation_date}</td>
                      <td className="py-3 text-right font-bold text-neutral-900">
                        ₹{Number(quote.grand_total).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadges[quote.status] || 'bg-neutral-100'}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setPreviewQuote(quote)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
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
          {/* Status Breakdown Chart */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
              Pipeline by Status
            </h3>
            <div className="h-44 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-neutral-400">No data available</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-neutral-600">{item.name}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access to Catalog */}
          <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase">
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
              className="w-full mt-2 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
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
