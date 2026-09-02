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
  ShieldCheck
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

  const handleCreateQuotationForCustomer = (cust: Customer) => {
    api.saveQuotationDraft({
      customerId: cust.customer_id,
      cartItems: []
    });
    onNavigate('new-quotation');
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

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
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
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(cust => {
          const custQuotes = quotations.filter(q => q.customer_id === cust.customer_id);
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
                      <h3 className="font-bold text-sm text-neutral-900 leading-snug">
                        {cust.party_name}
                      </h3>
                      {cust.company_name && (
                        <div className="text-[11px] text-neutral-500 font-medium truncate max-w-[180px]">
                          {cust.company_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    cust.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {cust.status}
                  </span>
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

                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
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
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                      title="Edit Customer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDeleteRecords && (
                    <button
                      onClick={() => setCustomerToDelete(cust)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
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
      </div>

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

      {/* Delete Confirmation */}
      {customerToDelete && (
        <ConfirmModal
          isOpen={!!customerToDelete}
          onClose={() => setCustomerToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Customer"
          message={`Are you sure you want to delete ${customerToDelete.party_name}?`}
          confirmText="Delete Customer"
          isDanger
        />
      )}
    </div>
  );
};

