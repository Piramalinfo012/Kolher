import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  LayoutGrid,
  List
} from 'lucide-react';
import { Customer, Quotation } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface CustomersProps {
  onNavigate: (page: string, editId?: string) => void;
}

export const Customers: React.FC<CustomersProps> = ({ onNavigate }) => {
  const { canManageCustomers, canDeleteRecords, isSales } = useAuth();
  const { success, error, warning } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    party_name: '',
    company_name: '',
    contact_person: '',
    mobile: '',
    email: '',
    billing_address: '',
    shipping_address: '',
    gstin: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    status: 'Active'
  });

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, qData] = await Promise.all([
        api.getCustomers(),
        api.getQuotations()
      ]);
      setCustomers(cData);
      setQuotations(qData);
    } catch (err: any) {
      error('Failed to load customers', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      party_name: '',
      company_name: '',
      contact_person: '',
      mobile: '',
      email: '',
      billing_address: '',
      shipping_address: '',
      gstin: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData(c);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.party_name) {
      warning('Validation Error', 'Party / Client Name is required');
      return;
    }

    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.customer_id, formData);
        success('Customer Updated', `${formData.party_name} saved.`);
      } else {
        await api.createCustomer(formData);
        success('Customer Created', `${formData.party_name} added to client directory.`);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      error('Save Failed', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await api.deleteCustomer(customerToDelete.customer_id);
      success('Customer Removed', `${customerToDelete.party_name} removed.`);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setCustomerToDelete(null);
    }
  };

  const getCustomerQuotations = (cust: Customer, allQuotes: Quotation[], allCustomers: Customer[]) => {
    const custParty = (cust.party_name || '').trim().toLowerCase();
    const custCompany = (cust.company_name || '').trim().toLowerCase();
    const custMobile = (cust.mobile || '').trim();

    return allQuotes.filter(q => {
      if (q.customer_id && q.customer_id === cust.customer_id) return true;

      const qParty = (q.party_name || '').trim().toLowerCase();
      const qCompany = (q.company_name || '').trim().toLowerCase();
      const qMobile = (q.mobile || '').trim();

      if (qParty && custParty && (qParty === custParty || qParty.includes(custParty) || custParty.includes(qParty))) return true;
      if (custCompany && (qParty.includes(custCompany) || (qCompany && qCompany.includes(custCompany)))) return true;
      if (custMobile && qMobile && (qMobile.includes(custMobile) || custMobile.includes(qMobile))) return true;

      // Fallback: match unlinked or legacy "VALUED CLIENT" quotations when this is the only or primary customer
      if (!q.customer_id || qParty === 'valued client' || qParty === '') {
        if (allCustomers.length === 1) return true;
      }

      return false;
    });
  };

  const handleCreateQuotationForCustomer = (cust: Customer) => {
    api.saveQuotationDraft({
      customerId: cust.customer_id,
      clientToName: cust.party_name,
      cartItems: []
    });
    onNavigate('new-quotation');
  };

  const handleExportCustomersExcel = () => {
    if (customers.length === 0) {
      warning('No Data', 'There are no customer records available to export.');
      return;
    }

    const headers = [
      'Customer ID',
      'Party / Client Name',
      'Company Name',
      'Contact Person',
      'Mobile Number',
      'Email Address',
      'GSTIN',
      'City',
      'State',
      'Billing Address',
      'Shipping Address',
      'Sales Executive',
      'Status',
      'Created Date'
    ];

    const csvRows = [headers.join(',')];

    customers.forEach(c => {
      const row = [
        `"${c.customer_id || ''}"`,
        `"${(c.party_name || '').replace(/"/g, '""')}"`,
        `"${(c.company_name || '').replace(/"/g, '""')}"`,
        `"${(c.contact_person || '').replace(/"/g, '""')}"`,
        `"${(c.mobile || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.gstin || '').replace(/"/g, '""')}"`,
        `"${(c.city || '').replace(/"/g, '""')}"`,
        `"${(c.state || '').replace(/"/g, '""')}"`,
        `"${(c.billing_address || '').replace(/"/g, '""')}"`,
        `"${(c.shipping_address || '').replace(/"/g, '""')}"`,
        `"${(c.sales_person || '').replace(/"/g, '""')}"`,
        `"${(c.status || '').replace(/"/g, '""')}"`,
        `"${(c.created_at || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `FIMA_Customer_Master_Data_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Excel / CSV Exported', `Successfully downloaded ${customers.length} customer master records.`);
  };

  const filtered = customers.filter(
    c =>
      c.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company_name && c.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.mobile && c.mobile.includes(searchTerm)) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.contact_person && c.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            Customers & Architectural Accounts Master
          </h1>
          <p className="text-xs text-neutral-500">
            Directory of Architects, Interior Designers, Real Estate Developers, and Luxury Homeowners
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCustomersExcel}
            className="px-4 py-2.5 rounded-xl border border-emerald-600/60 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Download Customer Master Data in Excel / CSV format"
            id="btn-export-customers-excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Download Customer Excel</span>
          </button>

          {canManageCustomers && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-red-300 hover:text-red-200 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              id="btn-add-customer"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & View Mode Switcher */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by party, firm, phone, or GSTIN..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl border border-neutral-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'GRID'
                ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="Grid View"
            id="btn-cust-view-grid"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('LIST')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'LIST'
                ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="List Table View"
            id="btn-cust-view-list"
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* Customer Content: Grid vs List Table View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(cust => {
            const custQuotes = getCustomerQuotations(cust, quotations, customers);
            const totalSpent = custQuotes.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);

            return (
              <div
                key={cust.customer_id}
                className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-red-800 flex items-center justify-center font-bold text-sm">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 
                          onClick={() => setSelectedCustomerForHistory(cust)}
                          className="font-bold text-sm text-neutral-900 leading-snug cursor-pointer hover:text-red-600 hover:underline transition-colors"
                          title="Click to view quotation history"
                        >
                          {cust.party_name}
                        </h3>
                        {cust.company_name && (
                          <div className="text-[11px] text-neutral-500 font-medium truncate max-w-[180px]">
                            {cust.company_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-mono text-[10px] font-bold text-red-900 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-md">
                        {cust.customer_id}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        cust.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {cust.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{cust.mobile || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{cust.email || '-'}</span>
                    </div>
                    {cust.gstin && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-emerald-900 font-semibold">{cust.gstin}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-[11px] text-neutral-500 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                      <span className="truncate">{cust.billing_address || `${cust.city}, ${cust.state}`}</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedCustomerForHistory(cust)}
                    className="bg-neutral-50 hover:bg-red-50/50 p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between text-xs cursor-pointer transition-colors"
                    title="Click to view customer quotation history"
                  >
                    <span className="text-neutral-500">Quotations: <strong>{custQuotes.length}</strong></span>
                    <span className="font-bold text-neutral-900">Total: ₹{totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  {isSales ? (
                    <button
                      onClick={() => handleCreateQuotationForCustomer(cust)}
                      className="text-xs font-bold text-red-800 hover:text-red-900 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Quote</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-1">
                    {canManageCustomers && (
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDeleteRecords && (
                      <button
                        onClick={() => setCustomerToDelete(cust)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-3xl border border-neutral-200 text-center text-neutral-400 text-xs">
              No customer records found matching your search.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-900 text-white uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="p-4">Customer ID</th>
                  <th className="p-4">Party / Client Name</th>
                  <th className="p-4">Company / Firm</th>
                  <th className="p-4">Mobile & Email</th>
                  <th className="p-4">Location & GSTIN</th>
                  <th className="p-4 text-center">Quotations</th>
                  <th className="p-4 text-right">Total Value</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(cust => {
                  const custQuotes = getCustomerQuotations(cust, quotations, customers);
                  const totalSpent = custQuotes.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);

                  return (
                    <tr key={cust.customer_id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-red-900 text-xs">
                        <span className="bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                          {cust.customer_id}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-neutral-950 text-xs">
                        <div 
                          onClick={() => setSelectedCustomerForHistory(cust)}
                          className="cursor-pointer hover:text-red-600 hover:underline transition-colors"
                          title="Click to view quotation history"
                        >
                          {cust.party_name}
                        </div>
                        {cust.contact_person && (
                          <div className="text-[11px] font-normal text-neutral-500">Contact: {cust.contact_person}</div>
                        )}
                      </td>
                      <td className="p-4 text-neutral-700 font-medium">
                        {cust.company_name || '—'}
                      </td>
                      <td className="p-4 text-neutral-600">
                        <div className="font-mono">{cust.mobile || '—'}</div>
                        <div className="text-[10px] text-neutral-400">{cust.email || ''}</div>
                      </td>
                      <td className="p-4 text-neutral-600">
                        <div>{cust.city ? `${cust.city}, ${cust.state}` : '—'}</div>
                        {cust.gstin && <div className="text-[10px] text-neutral-400 font-mono">GST: {cust.gstin}</div>}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold font-mono bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-md text-xs">
                          {custQuotes.length}
                        </span>
                      </td>
                      <td className="p-4 text-right font-serif-luxury font-bold text-neutral-950 text-sm">
                        ₹{totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cust.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {cust.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCreateQuotationForCustomer(cust)}
                            className="px-2.5 py-1 text-[11px] font-bold text-red-900 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
                            title="New Quotation for this Client"
                          >
                            + New Quote
                          </button>
                          {canManageCustomers && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cust)}
                              className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                              title="Edit Customer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteRecords && (
                            <button
                              type="button"
                              onClick={() => setCustomerToDelete(cust)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-400 text-xs">
                      No customer records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-neutral-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingCustomer ? 'Edit Customer Account' : 'Register New Client / Firm'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="bg-red-50/70 p-3 rounded-2xl border border-red-200/80 flex items-center justify-between">
                <span className="font-bold text-red-900 text-xs uppercase tracking-wide font-mono">System Customer ID:</span>
                <span className="font-mono font-bold text-red-950 text-xs bg-white px-2.5 py-1 rounded-xl border border-red-300 shadow-2xs">
                  {editingCustomer ? editingCustomer.customer_id : `CUST-${('000' + (customers.length + 1)).slice(-4)}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Party / Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.party_name || ''}
                    onChange={e => setFormData({ ...formData, party_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Company / Firm Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name || ''}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person || ''}
                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.mobile || ''}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={formData.gstin || ''}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Billing Address
                </label>
                <textarea
                  rows={2}
                  value={formData.billing_address || ''}
                  onChange={e => setFormData({ ...formData, billing_address: e.target.value, shipping_address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city || 'Mumbai'}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state || 'Maharashtra'}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Quotation History Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  Quotation History — {selectedCustomerForHistory.party_name}
                </h3>
                {selectedCustomerForHistory.company_name && (
                  <p className="text-xs text-neutral-400 font-normal mt-0.5">
                    Firm: {selectedCustomerForHistory.company_name} | Phone: {selectedCustomerForHistory.mobile || 'N/A'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerForHistory(null)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {(() => {
                const customerQuotes = getCustomerQuotations(selectedCustomerForHistory, quotations, customers);
                const totalValue = customerQuotes.reduce((acc, q) => acc + (Number(q.grand_total) || 0), 0);

                if (customerQuotes.length === 0) {
                  return (
                    <div className="py-12 text-center text-neutral-400 text-xs bg-neutral-50 rounded-2xl border border-neutral-200">
                      No quotations found for this client.
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex items-center justify-between bg-red-50/70 p-4 rounded-2xl border border-red-200/80 text-xs">
                      <div>
                        <span className="text-neutral-600 font-medium">Total Quotations Issued: </span>
                        <strong className="text-red-950 font-bold font-mono text-sm">{customerQuotes.length}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-600 font-medium">Total Proposals Value: </span>
                        <strong className="text-red-950 font-bold font-serif-luxury text-base">₹{totalValue.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-neutral-200 max-h-80 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-neutral-900 text-white font-mono text-[10px] uppercase sticky top-0">
                          <tr>
                            <th className="p-3">Quotation #</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-center">Items</th>
                            <th className="p-3 text-right">Grand Total</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {customerQuotes.map(q => (
                            <tr key={q.quotation_id} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="p-3 font-mono font-bold text-neutral-900">{q.quotation_number}</td>
                              <td className="p-3 text-neutral-600">
                                {q.quotation_date
                                  ? q.quotation_date.includes('-')
                                    ? q.quotation_date.split('-').reverse().join('-')
                                    : q.quotation_date
                                  : '-'}
                              </td>
                              <td className="p-3 text-center font-mono font-semibold">{q.items?.length || 0}</td>
                              <td className="p-3 text-right font-bold text-neutral-900 font-mono">₹{Number(q.grand_total).toLocaleString('en-IN')}</td>
                              <td className="p-3 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  q.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                  q.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {q.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomerForHistory(null);
                                    onNavigate('new-quotation', q.quotation_id);
                                  }}
                                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  View / Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomerForHistory(null)}
                className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

