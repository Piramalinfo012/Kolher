import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Printer,
  Download,
  MessageCircle,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Quotation, CompanySettings, QuotationStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QuotationPreviewModal } from './QuotationPreviewModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { PdfGeneratorService } from '../services/pdfGenerator';

interface QuotationHistoryProps {
  onNavigate: (page: string, editId?: string) => void;
}

export const QuotationHistory: React.FC<QuotationHistoryProps> = ({ onNavigate }) => {
  const { isSuperAdmin, isSales, canDeleteRecords } = useAuth();
  const { success, error, info } = useToast();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<Quotation | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPdf = async (quote: Quotation) => {
    try {
      setDownloadingId(quote.quotation_id);
      const latestSettings = await api.getCompanySettings();
      await PdfGeneratorService.downloadDirectPdf(quote, latestSettings);
      success('PDF Downloaded', `Quotation ${quote.quotation_number} downloaded successfully as PDF.`);
      loadData();
    } catch (err: any) {
      error('Download Failed', err.message || 'Could not compile PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [qList, sData] = await Promise.all([
        api.getQuotations(),
        api.getCompanySettings()
      ]);
      setQuotations(qList);
      setSettings(sData);
    } catch (err: any) {
      error('Failed to load quotations', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDuplicate = async (quote: Quotation) => {
    try {
      const duplicated = await api.duplicateQuotation(quote.quotation_id);
      success('Quotation Duplicated', `Created new draft: ${duplicated.quotation_number}`);
      loadData();
    } catch (err: any) {
      error('Duplication Failed', err.message);
    }
  };

  const handleStatusUpdate = async (quoteId: string, newStatus: QuotationStatus) => {
    try {
      await api.updateQuotation(quoteId, { status: newStatus });
      success('Status Updated', `Quotation marked as ${newStatus}`);
      loadData();
    } catch (err: any) {
      error('Failed to update status', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!quoteToDelete) return;
    try {
      await api.deleteQuotation(quoteToDelete.quotation_id);
      success('Quotation Removed', `Quotation ${quoteToDelete.quotation_number} deleted.`);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setQuoteToDelete(null);
    }
  };

  const filteredQuotes = quotations.filter(q => {
    const matchesSearch =
      (q.quotation_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.party_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.mobile && q.mobile.includes(searchTerm)) ||
      (q.email && q.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-900 dark:text-white">
            Quotation Management History
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Track, duplicate, share via email, print A4 PDFs, and manage lifecycle of all client proposals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isSales && (
            <button
              onClick={() => onNavigate('new-quotation')}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              id="btn-new-quote-history"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by quote #, client name, mobile or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase font-mono mr-1">Status:</span>
          {['ALL', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-mono bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="p-4">Quotation No</th>
                <th className="p-4">Client / Party</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Items</th>
                <th className="p-4 text-right">Subtotal</th>
                <th className="p-4 text-right">Grand Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredQuotes.map(quote => {
                const statusStyles: Record<string, string> = {
                  DRAFT: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
                  SENT: 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                  APPROVED: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                  REJECTED: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                  EXPIRED: 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                };

                return (
                  <tr key={quote.quotation_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {quote.quotation_number}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-neutral-900 dark:text-white">{quote.party_name}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {quote.company_name ? `${quote.company_name} • ` : ''}{quote.mobile}
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-400">
                      <div className="font-mono font-medium">{(() => {
                        const dateVal = quote.quotation_date || quote.created_at;
                        if (!dateVal) return '';
                        const parts = dateVal.split('T')[0].split(' ')[0].split('-');
                        return parts.length === 3 && parts[0].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateVal;
                      })()}</div>
                      {quote.updated_at && (() => {
                        const createVal = (quote.quotation_date || quote.created_at || '').split('T')[0].split(' ')[0];
                        const updateVal = quote.updated_at.split('T')[0].split(' ')[0];
                        if (updateVal && updateVal !== createVal) {
                          const parts = updateVal.split('-');
                          const formattedUpdate = parts.length === 3 && parts[0].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : updateVal;
                          return (
                            <div className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded w-fit border border-amber-200 dark:border-amber-800 mt-1">
                              Edited: {formattedUpdate}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Valid: {quote.validity}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-md font-mono">
                        {quote.items?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 text-right text-neutral-600 dark:text-neutral-400">
                      ₹{Number(quote.taxable_amount || quote.subtotal).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right font-bold text-neutral-900 dark:text-white font-serif-luxury text-sm">
                      ₹{Number(quote.grand_total).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={quote.status}
                        onChange={e => handleStatusUpdate(quote.quotation_id, e.target.value as QuotationStatus)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border appearance-none cursor-pointer text-center focus:outline-none ${statusStyles[quote.status]}`}
                      >
                        <option value="DRAFT" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">DRAFT</option>
                        <option value="SENT" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">SENT</option>
                        <option value="APPROVED" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">APPROVED</option>
                        <option value="REJECTED" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">REJECTED</option>
                        <option value="EXPIRED" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">EXPIRED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewQuote(quote)}
                          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="View & Share Quotation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(quote)}
                          disabled={downloadingId === quote.quotation_id}
                          className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Download PDF directly"
                        >
                          <Download className={`w-4 h-4 ${downloadingId === quote.quotation_id ? 'animate-bounce' : ''}`} />
                        </button>
                        <button
                          onClick={() => onNavigate('new-quotation', quote.quotation_id)}
                          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Edit Quotation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(quote)}
                          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Duplicate as New Quotation"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setQuoteToDelete(quote)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Quotation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-xs">
                    No quotations found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewQuote && settings && (
        <QuotationPreviewModal
          isOpen={!!previewQuote}
          onClose={() => setPreviewQuote(null)}
          quotation={previewQuote}
          companySettings={settings}
          onStatusChange={newStatus => {
            setPreviewQuote({ ...previewQuote, status: newStatus });
            loadData();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {quoteToDelete && (
        <ConfirmModal
          isOpen={!!quoteToDelete}
          onClose={() => setQuoteToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Quotation"
          message={`Are you sure you want to delete quotation ${quoteToDelete.quotation_number} for ${quoteToDelete.party_name}? This action will remove the record from your repository.`}
          confirmText="Delete Quotation"
          isDanger
        />
      )}
    </div>
  );
};

