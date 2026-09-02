import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  CreditCard,
  FileText,
  ShieldCheck,
  Upload,
  RefreshCw
} from 'lucide-react';
import { CompanySettings } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageUploadModal } from '../components/ImageUploadModal';

export const CompanySettingsPage: React.FC = () => {
  const { canEditSettings } = useAuth();
  const { success, error, warning } = useToast();

  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getCompanySettings();
        setSettings(data);
      } catch (err: any) {
        error('Failed to load settings', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    if (!canEditSettings) {
      warning('Permission Denied', 'Only Admins can update company commercial settings.');
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateCompanySettings(settings);
      setSettings(updated);
      success('Settings Saved', 'Company identity and quotation defaults updated.');
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Loading Company Commercial Profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            Company Profile & Quotation Master Settings
          </h1>
          <p className="text-xs text-neutral-500">
            Configure legal entity details, bank remittance coordinates, GST parameters, and standard commercial terms
          </p>
        </div>

        {canEditSettings && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-red-300 hover:text-red-200 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            id="btn-save-settings"
          >
            <Save className="w-4 h-4 text-red-400" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Legal Entity Profile */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase">
            <Building2 className="w-4 h-4 text-red-600" />
            1. Legal Entity & Brand Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Company Legal Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Brand Tagline</label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-700 uppercase mb-1">Registered Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Telephone / Hotline</label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Commercial Sales Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">GSTIN Number</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={e => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">PAN Number</label>
              <input
                type="text"
                value={settings.pan}
                onChange={e => setSettings({ ...settings, pan: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank Remittance Coordinates */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase">
            <CreditCard className="w-4 h-4 text-red-600" />
            2. Bank Remittance & Electronic Settlement Coordinates
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Bank Name</label>
              <input
                type="text"
                value={settings.bank_name}
                onChange={e => setSettings({ ...settings, bank_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Account Number</label>
              <input
                type="text"
                value={settings.account_number}
                onChange={e => setSettings({ ...settings, account_number: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">IFSC Code</label>
              <input
                type="text"
                value={settings.ifsc}
                onChange={e => setSettings({ ...settings, ifsc: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Branch Name</label>
              <input
                type="text"
                value={settings.branch}
                onChange={e => setSettings({ ...settings, branch: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Quotation Format & Standard Terms */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase">
            <FileText className="w-4 h-4 text-red-600" />
            3. Quotation Numbering Rules & Default Terms
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Quotation Prefix</label>
              <input
                type="text"
                value={settings.quotation_prefix}
                onChange={e => setSettings({ ...settings, quotation_prefix: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Example: PIR/QT/</p>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Financial Year</label>
              <input
                type="text"
                value={settings.financial_year}
                onChange={e => setSettings({ ...settings, financial_year: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Example: 26-27</p>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                value={settings.default_gst}
                onChange={e => setSettings({ ...settings, default_gst: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Default Validity</label>
              <input
                type="text"
                value={settings.default_validity}
                onChange={e => setSettings({ ...settings, default_validity: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Default Payment Terms</label>
              <input
                type="text"
                value={settings.default_payment_terms}
                onChange={e => setSettings({ ...settings, default_payment_terms: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase mb-1">Default Delivery Terms</label>
              <input
                type="text"
                value={settings.default_delivery_terms}
                onChange={e => setSettings({ ...settings, default_delivery_terms: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-2 text-xs">
            <label className="block font-bold text-neutral-700 uppercase mb-1">
              Authorized Signatory Designation
            </label>
            <input
              type="text"
              value={settings.authorized_signatory}
              onChange={e => setSettings({ ...settings, authorized_signatory: e.target.value })}
              className="w-full sm:w-80 p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 text-xs">
            <label className="block font-bold text-neutral-700 uppercase mb-1">
              Standard Quotation Terms & Conditions (Appears on A4 PDF)
            </label>
            <textarea
              rows={4}
              value={settings.terms_conditions}
              onChange={e => setSettings({ ...settings, terms_conditions: e.target.value })}
              className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500 leading-relaxed font-sans text-xs"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

