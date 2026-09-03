import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Sliders,
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Save,
  FileText,
  Percent,
  Truck,
  Package,
  Layers,
  Search,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  X,
  FileSpreadsheet,
  RefreshCw,
  Clock,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Customer, QuotationItem, Quotation, CompanySettings, QuotationSection } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ProductCustomizerModal } from './ProductCustomizerModal';
import { QuotationPreviewModal } from './QuotationPreviewModal';
import { getVisualizerDataUrl } from '../components/InteractiveVisualizer';

interface NewQuotationProps {
  onNavigate: (page: string) => void;
  editQuotationId?: string | null;
}

interface SectionDefinition {
  id: string;
  name: string;
}

const COMMON_SECTIONS = [
  'Kids Washroom',
  'Master Washroom',
  'Kitchen',
  'Guest Bathroom',
  'Powder Room',
  'Living Area',
  'Balcony',
  'Staff Toilet'
];

export const NewQuotation: React.FC<NewQuotationProps> = ({ onNavigate, editQuotationId }) => {
  const { success, error, warning, info } = useToast();

  // Master lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);

  // Form State
  const [quotationNumber, setQuotationNumber] = useState<string>('');
  const [quotationDate, setQuotationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [clientToName, setClientToName] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState<boolean>(false);

  // New Customer Quick-Add Form
  const [newCustParty, setNewCustParty] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustContact, setNewCustContact] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustState, setNewCustState] = useState('Maharashtra');

  // Sections State
  const [sections, setSections] = useState<SectionDefinition[]>([
    { id: 'sec_kids', name: 'KIDS' }
  ]);
  const [newSectionInput, setNewSectionInput] = useState<string>('');
  const [sectionSearchQueries, setSectionSearchQueries] = useState<{ [sectionId: string]: string }>({});
  const [activeDropdownSection, setActiveDropdownSection] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState<string>('');

  // Quotation Cart & Pricing
  const [cartItems, setCartItems] = useState<QuotationItem[]>([]);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<string>('');
  const [deliveryTerms, setDeliveryTerms] = useState<string>('');
  const [validity, setValidity] = useState<string>('30 Days');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Modals
  const [customizerProduct, setCustomizerProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<QuotationItem | null>(null);
  const [targetSectionForCustomizer, setTargetSectionForCustomizer] = useState<SectionDefinition | null>(null);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [savedQuotationForPreview, setSavedQuotationForPreview] = useState<Quotation | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const searchContainerRefs = useRef<{ [sectionId: string]: HTMLDivElement | null }>({});

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDropdownSection) {
        const ref = searchContainerRefs.current[activeDropdownSection];
        if (ref && !ref.contains(e.target as Node)) {
          setActiveDropdownSection(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownSection]);

  // Load Data on Mount
  useEffect(() => {
    const initData = async () => {
      try {
        const [cList, pList, settings] = await Promise.all([
          api.getCustomers(),
          api.getProducts(),
          api.getCompanySettings()
        ]);

        setCustomers(cList.filter(c => c.status === 'Active'));
        setProducts(pList.filter(p => p.status === 'ACTIVE'));
        setCompanySettings(settings);

        setPaymentTerms(settings.default_payment_terms);
        setDeliveryTerms(settings.default_delivery_terms);
        setValidity(settings.default_validity);

        if (editQuotationId) {
          const quoteToEdit = await api.getQuotationById(editQuotationId);
          if (quoteToEdit) {
            setQuotationNumber(quoteToEdit.quotation_number);
            setQuotationDate(quoteToEdit.quotation_date);
            setClientToName(quoteToEdit.party_name || '');
            setSelectedCustomerId(quoteToEdit.customer_id);
            setSelectedCustomer(cList.find(c => c.customer_id === quoteToEdit.customer_id) || null);
            setCartItems(quoteToEdit.items || []);
            setOverallDiscount(quoteToEdit.discount || 0);
            setFreightCharges(quoteToEdit.freight || 0);
            setOtherCharges(quoteToEdit.other_charges || 0);
            setPaymentTerms(quoteToEdit.payment_terms || settings.default_payment_terms);
            setDeliveryTerms(quoteToEdit.delivery_terms || settings.default_delivery_terms);
            setValidity(quoteToEdit.validity || settings.default_validity);

            // Reconstruct sections from quotation items if present
            if (quoteToEdit.items && quoteToEdit.items.length > 0) {
              const loadedSections: SectionDefinition[] = [];
              const seenNames = new Set<string>();
              quoteToEdit.items.forEach(it => {
                const sName = (it.section_name || 'KIDS').toUpperCase();
                if (!seenNames.has(sName)) {
                  seenNames.add(sName);
                  loadedSections.push({
                    id: it.section_id || `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    name: sName
                  });
                }
              });
              if (loadedSections.length > 0) {
                setSections(loadedSections);
              }
            }
            return;
          }
        }

        // Auto-generate next quotation number
        const nextNum = await api.generateNextQuotationNumber();
        setQuotationNumber(nextNum);

        // Check for cached draft
        const draft = api.getQuotationDraft();
        if (draft && !editQuotationId) {
          if (draft.clientToName) setClientToName(draft.clientToName);
          if (draft.customerId) {
            setSelectedCustomerId(draft.customerId);
            const found = cList.find(c => c.customer_id === draft.customerId);
            if (found) setSelectedCustomer(found);
          }
          if (draft.sections && draft.sections.length > 0) {
            setSections(draft.sections);
          }
          if (draft.cartItems && draft.cartItems.length > 0) {
            setCartItems(draft.cartItems);
            info('Draft Restored', 'Restored previously saved local quotation draft.');
          }
          if (draft.savedAt) {
            setLastSavedTime(new Date(draft.savedAt).toLocaleString());
          }
        } else {
          setLastSavedTime(new Date().toLocaleString());
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    initData();
  }, [editQuotationId]);

  // Auto-save draft on updates
  useEffect(() => {
    if (cartItems.length > 0 || clientToName || selectedCustomerId || sections.length > 0) {
      const now = new Date();
      api.saveQuotationDraft({
        clientToName,
        customerId: selectedCustomerId,
        sections,
        cartItems,
        overallDiscount,
        freightCharges,
        otherCharges,
        quotationDate
      });
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', month: 'numeric', day: 'numeric', year: 'numeric' }));
    }
  }, [cartItems, clientToName, selectedCustomerId, sections, overallDiscount, freightCharges, otherCharges, quotationDate]);

  // Customer Selection Handlers
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.customer_id);
    setSelectedCustomer(cust);
    setClientToName(cust.party_name);
    setShowClientDropdown(false);
    setShowNewCustomerForm(false);
  };

  const handleQuickCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustParty) {
      warning('Validation Error', 'Party / Client Name is required');
      return;
    }
    try {
      const created = await api.createCustomer({
        party_name: newCustParty,
        company_name: newCustCompany,
        contact_person: newCustContact,
        mobile: newCustMobile,
        email: newCustEmail,
        billing_address: newCustAddress,
        shipping_address: newCustAddress,
        gstin: newCustGstin,
        state: newCustState
      });
      const updatedList = await api.getCustomers();
      setCustomers(updatedList);
      setSelectedCustomerId(created.customer_id);
      setSelectedCustomer(created);
      setClientToName(created.party_name);
      setShowNewCustomerForm(false);
      setShowClientDropdown(false);
      success('Customer Added', `${created.party_name} registered successfully.`);
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  // --- Section Management ---
  const handleAddSection = (nameToAdd?: string) => {
    const rawName = nameToAdd || newSectionInput;
    if (!rawName.trim()) {
      warning('Section Name Required', 'Please type a section name like "Master Washroom" or "Kitchen".');
      return;
    }
    const cleanName = rawName.trim().toUpperCase();
    const newSec: SectionDefinition = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName
    };
    setSections(prev => [...prev, newSec]);
    setNewSectionInput('');
    success('Section Added', `Section "${cleanName}" created.`);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSections(updated);
  };

  const handleDeleteSection = (sectionId: string, sectionName: string) => {
    const sectionItemsCount = cartItems.filter(i => i.section_id === sectionId || i.section_name === sectionName).length;
    if (sectionItemsCount > 0) {
      if (!confirm(`Section "${sectionName}" contains ${sectionItemsCount} product(s). Do you want to remove this section and its items?`)) {
        return;
      }
    }
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setCartItems(prev => prev.filter(i => i.section_id !== sectionId && i.section_name !== sectionName));
    info('Section Removed', `Removed section "${sectionName}".`);
  };

  const handleStartRenameSection = (sec: SectionDefinition) => {
    setEditingSectionId(sec.id);
    setEditingSectionName(sec.name);
  };

  const handleSaveRenameSection = (secId: string) => {
    if (!editingSectionName.trim()) {
      setEditingSectionId(null);
      return;
    }
    const upper = editingSectionName.trim().toUpperCase();
    setSections(prev => prev.map(s => s.id === secId ? { ...s, name: upper } : s));
    setCartItems(prev => prev.map(i => i.section_id === secId ? { ...i, section_name: upper } : i));
    setEditingSectionId(null);
  };

  // --- Product Addition into Section ---
  const handleAddProductToSection = (prod: Product, section: SectionDefinition) => {
    const baseMRP = Number(prod.base_price) || 0;
    const newItem: QuotationItem = {
      quotation_item_id: `QITM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      quotation_number: quotationNumber,
      section_id: section.id,
      section_name: section.name,
      product_id: prod.product_id,
      product_name: prod.product_name,
      model_number: prod.model_number,
      finish_id: '',
      finish_name: '',
      handle_id: '',
      handle_name: '',
      combination_id: '',
      product_image_url: prod.main_image_url,
      quantity: 1,
      unit: 'PCS',
      base_price: baseMRP,
      mrp: baseMRP,
      clp: undefined,
      finish_price: 0,
      handle_price: 0,
      additional_price: 0,
      discount: 0,
      gst: companySettings?.default_gst || 18,
      unit_final_price: baseMRP,
      line_total: baseMRP,
      customization_json: { quantity: 1 }
    };

    setCartItems(prev => [...prev, newItem]);
    setSectionSearchQueries(prev => ({ ...prev, [section.id]: '' }));
    setActiveDropdownSection(null);
    success('Product Added', `${prod.model_number} added to ${section.name}`);
  };

  const handleOpenCustomizerForSection = (prod: Product, section: SectionDefinition, existingItem: QuotationItem | null = null) => {
    setCustomizerProduct(prod);
    setTargetSectionForCustomizer(section);
    setEditingCartItem(existingItem);
    setShowCustomizer(true);
    setActiveDropdownSection(null);
  };

  const handleOpenCustomizerForItem = (item: QuotationItem, section: SectionDefinition) => {
    let prod = products.find(p => p.product_id === item.product_id || p.model_number === item.model_number);
    if (!prod) {
      prod = {
        product_id: item.product_id || `PROD_${Date.now()}`,
        model_number: item.model_number || 'FIMA_ITEM',
        product_name: item.product_name || 'FIMA Architectural Fitting',
        category: 'Faucets & Sanitaryware',
        sub_category: '',
        description: item.product_name || '',
        base_price: item.base_price || item.mrp || 15000,
        unit: item.unit || 'PCS',
        hsn_code: '84818020',
        gst_percentage: item.gst || 18,
        main_image_url: item.product_image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        has_customization: true,
        has_combinations: true,
        has_layer_assets: true,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };
    }
    setCustomizerProduct(prod);
    setTargetSectionForCustomizer(section);
    setEditingCartItem(item);
    setShowCustomizer(true);
    setActiveDropdownSection(null);
  };

  const handleSaveCustomizedItem = (item: QuotationItem) => {
    if (editingCartItem) {
      setCartItems(prev =>
        prev.map(i => {
          if (i.quotation_item_id === editingCartItem.quotation_item_id) {
            const unitRate = item.clp !== undefined && item.clp > 0 ? item.clp : (item.mrp || item.unit_final_price || item.base_price || 0);
            return {
              ...i,
              ...item,
              section_id: editingCartItem.section_id || i.section_id,
              section_name: editingCartItem.section_name || i.section_name,
              mrp: item.mrp || item.unit_final_price || item.base_price,
              line_total: item.quantity * unitRate
            };
          }
          return i;
        })
      );
      success('Configuration Updated', `${item.model_number} updated with new finish & handle.`);
    } else {
      const unitRate = item.clp !== undefined && item.clp > 0 ? item.clp : (item.mrp || item.unit_final_price || item.base_price || 0);
      const itemWithSection: QuotationItem = {
        ...item,
        section_id: targetSectionForCustomizer?.id || sections[0]?.id || 'sec_kids',
        section_name: targetSectionForCustomizer?.name || sections[0]?.name || 'KIDS',
        mrp: item.mrp || item.unit_final_price || item.base_price,
        unit_final_price: item.unit_final_price || item.base_price,
        line_total: item.quantity * unitRate
      };
      setCartItems(prev => [...prev, itemWithSection]);
      success('Product Configured & Added', `${item.model_number} configured and added to ${itemWithSection.section_name}.`);
    }
    setEditingCartItem(null);
    setTargetSectionForCustomizer(null);
    setShowCustomizer(false);
  };

  // Item Line Adjustments
  const handleUpdateItemQuantity = (itemId: string, newQty: number) => {
    const qty = Math.max(1, newQty);
    setCartItems(prev =>
      prev.map(i => {
        if (i.quotation_item_id === itemId) {
          const unitRate = Number(i.clp && i.clp > 0 ? i.clp : (i.mrp || i.base_price || 0));
          return {
            ...i,
            quantity: qty,
            line_total: qty * unitRate,
            customization_json: { ...i.customization_json, quantity: qty }
          };
        }
        return i;
      })
    );
  };

  const handleUpdateItemMrp = (itemId: string, newMrp: number) => {
    const mrpVal = Math.max(0, newMrp);
    setCartItems(prev =>
      prev.map(i => {
        if (i.quotation_item_id === itemId) {
          const unitRate = Number(i.clp && i.clp > 0 ? i.clp : mrpVal);
          return {
            ...i,
            mrp: mrpVal,
            base_price: mrpVal,
            line_total: i.quantity * unitRate
          };
        }
        return i;
      })
    );
  };

  const handleUpdateItemClp = (itemId: string, newClp: number | undefined) => {
    setCartItems(prev =>
      prev.map(i => {
        if (i.quotation_item_id === itemId) {
          const clpVal = newClp !== undefined && !isNaN(newClp) && newClp > 0 ? newClp : undefined;
          const unitRate = clpVal !== undefined ? clpVal : (i.mrp || i.base_price || 0);
          return {
            ...i,
            clp: clpVal,
            unit_final_price: unitRate,
            line_total: i.quantity * unitRate
          };
        }
        return i;
      })
    );
  };

  const handleDeleteCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.quotation_item_id !== itemId));
  };

  // Financial Calculations
  const totalMrp = cartItems.reduce((sum, item) => sum + (Number(item.mrp || item.base_price) * item.quantity), 0);
  const totalClp = cartItems.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
  const subtotal = totalClp;
  const taxableAmount = Math.max(0, subtotal - Number(overallDiscount) + Number(freightCharges) + Number(otherCharges));

  const isInterState =
    selectedCustomer?.state &&
    selectedCustomer.state.toLowerCase() !== 'maharashtra' &&
    selectedCustomer.state.toLowerCase() !== '';

  const gstRate = companySettings?.default_gst || 18;
  const igstAmount = isInterState ? (taxableAmount * gstRate) / 100 : 0;
  const cgstAmount = !isInterState ? (taxableAmount * (gstRate / 2)) / 100 : 0;
  const sgstAmount = !isInterState ? (taxableAmount * (gstRate / 2)) / 100 : 0;
  const totalTax = igstAmount + cgstAmount + sgstAmount;
  const grandTotal = taxableAmount; // In commercial sanitaryware, grand total aligns directly with total CLP / pricing or includes tax as configured

  // Save Quotation Handler
  const handleSaveQuotation = async () => {
    const finalPartyName =
      clientToName.trim() ||
      selectedCustomer?.party_name ||
      customers.find(c => c.customer_id === selectedCustomerId)?.party_name ||
      'VALUED CLIENT';
    if (cartItems.length === 0) {
      warning('Quotation is Empty', 'Please add at least one product into a section before generating.');
      return;
    }

    try {
      setIsSaving(true);
      const quotationSections: QuotationSection[] = sections.map(sec => {
        const secItems = cartItems.filter(i => i.section_id === sec.id || i.section_name === sec.name);
        return {
          section_id: sec.id,
          section_name: sec.name,
          items: secItems,
          subtotal: secItems.reduce((s, it) => s + (Number(it.line_total) || 0), 0),
          total_mrp: secItems.reduce((s, it) => s + ((Number(it.mrp || it.base_price) || 0) * it.quantity), 0)
        };
      });

      const quotationData: Partial<Quotation> = {
        quotation_number: quotationNumber,
        quotation_date: quotationDate,
        customer_id: selectedCustomer?.customer_id || '',
        party_name: finalPartyName,
        company_name: selectedCustomer?.company_name || '',
        contact_person: selectedCustomer?.contact_person || finalPartyName,
        mobile: selectedCustomer?.mobile || '',
        email: selectedCustomer?.email || '',
        gstin: selectedCustomer?.gstin || '',
        billing_address: selectedCustomer?.billing_address || 'As per project instructions',
        shipping_address: selectedCustomer?.shipping_address || selectedCustomer?.billing_address || 'Site Delivery',
        subtotal,
        total_mrp: totalMrp,
        total_clp: totalClp,
        discount: overallDiscount,
        freight: freightCharges,
        other_charges: otherCharges,
        taxable_amount: taxableAmount,
        cgst: cgstAmount,
        sgst: sgstAmount,
        igst: igstAmount,
        grand_total: grandTotal,
        payment_terms: paymentTerms,
        delivery_terms: deliveryTerms,
        validity,
        status: 'DRAFT',
        sections: quotationSections,
        items: cartItems
      };

      let saved: Quotation;
      if (editQuotationId) {
        saved = await api.updateQuotation(editQuotationId, quotationData);
        success('Quotation Updated', `Quotation ${saved.quotation_number} updated successfully.`);
      } else {
        saved = await api.createQuotation(quotationData);
        success('Quotation Created', `Quotation ${saved.quotation_number} generated successfully!`);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setSavedQuotationForPreview(saved);
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to New Fresh Quotation
  const handleResetNewQuotation = async () => {
    if (cartItems.length > 0) {
      if (!confirm('Start a new quotation? Any unsaved changes in current quotation will be cleared.')) {
        return;
      }
    }
    api.clearQuotationDraft();
    const nextNum = await api.generateNextQuotationNumber();
    setQuotationNumber(nextNum);
    setQuotationDate(new Date().toISOString().split('T')[0]);
    setClientToName('');
    setSelectedCustomerId('');
    setSelectedCustomer(null);
    setSections([{ id: 'sec_kids', name: 'KIDS' }]);
    setCartItems([]);
    setOverallDiscount(0);
    setFreightCharges(0);
    setOtherCharges(0);
    success('New Quotation', 'Fresh quotation sheet initialized.');
  };

  // Export Excel / CSV with Section Hierarchy
  const handleDownloadExcel = () => {
    if (cartItems.length === 0) {
      warning('Empty Quotation', 'Add products to quotation before downloading Excel.');
      return;
    }

    const rows: string[][] = [
      ['FIMA INDIA LUXURY SANITARYWARE & BATHWARE'],
      ['QUOTATION DETAILS'],
      ['Quotation Number:', quotationNumber, 'Date:', quotationDate],
      ['Client / Party Name:', clientToName || selectedCustomer?.party_name || 'Client', 'Status:', 'DRAFT'],
      [],
      ['SECTION', 'SL NO', 'IMAGE URL', 'ITEM CODE', 'DESCRIPTION', 'MRP (INR)', 'CLP (INR)', 'QTY', 'AMOUNT (INR)']
    ];

    let overallIndex = 1;
    sections.forEach(sec => {
      const secItems = cartItems.filter(i => i.section_id === sec.id || i.section_name === sec.name);
      if (secItems.length > 0) {
        rows.push([`>>> SECTION: ${sec.name}`, '', '', '', '', '', '', '', '']);
        secItems.forEach(item => {
          rows.push([
            sec.name,
            (overallIndex++).toString(),
            item.product_image_url || '',
            item.model_number || '',
            `"${(item.product_name || '').replace(/"/g, '""')}"`,
            (item.mrp || item.base_price || 0).toString(),
            item.clp ? item.clp.toString() : '—',
            item.quantity.toString(),
            item.line_total.toString()
          ]);
        });
        const secTotal = secItems.reduce((acc, it) => acc + Number(it.line_total), 0);
        rows.push([`SECTION ${sec.name} SUBTOTAL`, '', '', '', '', '', '', '', secTotal.toString()]);
        rows.push([]);
      }
    });

    rows.push(['SUMMARY TOTALS']);
    rows.push(['TOTAL MRP:', '', '', '', '', totalMrp.toString()]);
    rows.push(['TOTAL CLP / PRICE:', '', '', '', '', totalClp.toString()]);
    rows.push(['GRAND TOTAL:', '', '', '', '', grandTotal.toString()]);

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FIMA_Quotation_${quotationNumber.replace(/\//g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Excel / CSV Exported', 'Quotation sheet downloaded successfully.');
  };

  // Filtered customer list for quick suggestion
  const filteredCustomers = customers.filter(
    c =>
      c.party_name.toLowerCase().includes(clientToName.toLowerCase()) ||
      c.mobile.includes(clientToName) ||
      (c.gstin && c.gstin.toLowerCase().includes(clientToName.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-neutral-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#9A6A38]/15 text-[#784c1f] px-2.5 py-0.5 rounded-md border border-[#9A6A38]/30">
              {quotationNumber || `${companySettings?.quotation_prefix || 'FIMA'}/${companySettings?.financial_year || '26-27'}/0001`}
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              Financial Year: {companySettings?.financial_year || '26-27'}
            </span>
          </div>
          <h1 className="text-xl font-bold font-serif-luxury text-neutral-950 mt-1">
            {editQuotationId ? 'Edit Quotation' : 'New Commercial Quotation'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onNavigate('quotation-history')}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Quotation History
          </button>
          <button
            type="button"
            onClick={handleSaveQuotation}
            disabled={isSaving || cartItems.length === 0}
            className="px-4 py-2 rounded-xl bg-[#9A6A38] hover:bg-[#835627] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            id="btn-save-quotation-top"
          >
            <Save className="w-3.5 h-3.5 text-red-200" />
            <span>{isSaving ? 'Saving...' : 'Save & Preview'}</span>
          </button>
        </div>
      </div>

      {/* CLIENT DETAILS CARD */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
            CLIENT DETAILS
          </h3>
          <button
            type="button"
            onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
            className="text-xs font-semibold text-[#8d5b28] hover:text-[#704419] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {showNewCustomerForm ? 'Cancel Customer Form' : '+ Register New Customer'}
          </button>
        </div>

        {/* Quick Add Form Drawer */}
        {showNewCustomerForm && (
          <form onSubmit={handleQuickCreateCustomer} className="p-4 bg-[#faf6f0] rounded-xl border border-[#e8dac7] space-y-3">
            <div className="text-xs font-bold text-neutral-900 uppercase font-mono">New Customer Master Entry</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Party / Client Name *"
                value={newCustParty}
                onChange={e => setNewCustParty(e.target.value)}
                className="p-2.5 text-xs bg-white rounded-lg border border-neutral-300 focus:outline-none focus:border-[#9A6A38]"
              />
              <input
                type="text"
                placeholder="Company / Firm Name"
                value={newCustCompany}
                onChange={e => setNewCustCompany(e.target.value)}
                className="p-2.5 text-xs bg-white rounded-lg border border-neutral-300 focus:outline-none focus:border-[#9A6A38]"
              />
              <input
                type="text"
                placeholder="Mobile (+91 98200 12345)"
                value={newCustMobile}
                onChange={e => setNewCustMobile(e.target.value)}
                className="p-2.5 text-xs bg-white rounded-lg border border-neutral-300 focus:outline-none focus:border-[#9A6A38]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewCustomerForm(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 rounded-lg hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-[#9A6A38] text-white font-bold rounded-lg hover:bg-[#835627]"
              >
                Save & Select Client
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Client Name Input with Auto-Suggest */}
          <div className="md:col-span-8 relative">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5 font-mono">
              CLIENT / TO NAME
            </label>
            <div className="relative">
              <input
                type="text"
                value={clientToName}
                onChange={e => {
                  setClientToName(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                placeholder="e.g. VIPUL SIR"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A38]/30 focus:border-[#9A6A38] bg-white"
                id="input-client-to-name"
              />
              {selectedCustomer && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Verified Master
                  </span>
                </div>
              )}
            </div>

            {/* Client Suggestion Dropdown */}
            {showClientDropdown && clientToName && filteredCustomers.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-neutral-100">
                {filteredCustomers.map(c => (
                  <div
                    key={c.customer_id}
                    onMouseDown={() => handleSelectCustomer(c)}
                    className="p-2.5 hover:bg-[#faf6f0] cursor-pointer text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-neutral-900">{c.party_name}</div>
                      <div className="text-[11px] text-neutral-500">{c.contact_person} • {c.mobile} • {c.city}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#8d5b28]">Select →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quotation Date */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5 font-mono">
              QUOTATION DATE
            </label>
            <input
              type="date"
              value={quotationDate}
              onChange={e => setQuotationDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A38]/30 focus:border-[#9A6A38] bg-white"
              id="input-quotation-date"
            />
          </div>
        </div>
      </div>

      {/* SECTIONS CONTAINER */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
              SECTIONS
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              {sections.length} Active Section{sections.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Add Section Input Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
            <input
              type="text"
              value={newSectionInput}
              onChange={e => setNewSectionInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSection();
                }
              }}
              placeholder="e.g. Kids Washroom, Master Washroom, Kitchen..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#9A6A38]/30 focus:border-[#9A6A38] bg-white"
              id="input-add-section"
            />
            <button
              type="button"
              onClick={() => handleAddSection()}
              className="px-6 py-2.5 rounded-xl bg-[#9A6A38] hover:bg-[#835627] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
              id="btn-add-section"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>

          {/* Quick Preset Section Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-1">
            <span className="text-[11px] text-neutral-400 font-medium">Quick add:</span>
            {COMMON_SECTIONS.map(name => {
              const alreadyExists = sections.some(s => s.name.toUpperCase() === name.toUpperCase());
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleAddSection(name)}
                  disabled={alreadyExists}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    alreadyExists
                      ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                      : 'bg-[#faf6f0] hover:bg-[#f2e6d6] text-[#704419] border-[#e0cfb8] hover:border-[#9A6A38]'
                  }`}
                >
                  + {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Sections List */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const sectionItems = cartItems.filter(
              item => item.section_id === section.id || item.section_name === section.name
            );
            const sectionSubtotal = sectionItems.reduce(
              (sum, it) => sum + (Number(it.line_total) || 0),
              0
            );
            const searchQuery = sectionSearchQueries[section.id] || '';
            const matchingProducts = searchQuery.trim()
              ? products.filter(
                  p =>
                    p.model_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : products.slice(0, 10);

            const isDropdownOpen = activeDropdownSection === section.id;

            return (
              <div
                key={section.id}
                className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs"
                id={`section-container-${section.id}`}
              >
                {/* Beige Section Header Bar */}
                <div className="bg-[#f2e8dc] px-4 py-3 border-b border-[#e3d3be] flex items-center justify-between">
                  {editingSectionId === section.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={editingSectionName}
                        onChange={e => setEditingSectionName(e.target.value)}
                        onBlur={() => handleSaveRenameSection(section.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveRenameSection(section.id);
                        }}
                        className="px-2 py-1 text-xs font-bold uppercase rounded border border-[#9A6A38] bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRenameSection(section.id)}
                        className="text-xs text-emerald-800 font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartRenameSection(section)}
                      className="font-bold text-xs uppercase tracking-wider text-[#633e14] font-mono cursor-pointer flex items-center gap-2 hover:opacity-80"
                      title="Click to edit section name"
                    >
                      <span>{section.name}</span>
                      <Edit2 className="w-3 h-3 text-[#9A6A38] opacity-60 hover:opacity-100" />
                    </div>
                  )}

                  {/* Section Controls: Up, Down, Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveSection(index, 'up')}
                      disabled={index === 0}
                      className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-300 flex items-center justify-center text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Section Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-300 flex items-center justify-center text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Section Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id, section.name)}
                      className="w-7 h-7 rounded-lg bg-white/90 hover:bg-rose-50 text-neutral-600 hover:text-rose-600 border border-neutral-300 hover:border-rose-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Remove Section"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Section Content: Product Search + Items Table */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Search Product Bar */}
                  <div
                    className="relative"
                    ref={el => (searchContainerRefs.current[section.id] = el)}
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => {
                          setSectionSearchQueries(prev => ({ ...prev, [section.id]: e.target.value }));
                          setActiveDropdownSection(section.id);
                        }}
                        onFocus={() => setActiveDropdownSection(section.id)}
                        placeholder="Search product code or des"
                        className="w-full sm:max-w-md px-3.5 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#9A6A38]/30 focus:border-[#9A6A38] bg-white"
                        id={`search-input-${section.id}`}
                      />
                    </div>

                    {/* Autocomplete Dropdown List */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-full sm:max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-xl z-40 max-h-72 overflow-y-auto divide-y divide-neutral-100">
                        <div className="p-2 bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 font-mono tracking-wider flex justify-between">
                          <span>FIMA Products Master Catalog</span>
                          <span>{matchingProducts.length} Results</span>
                        </div>
                        {matchingProducts.map(prod => (
                          <div
                            key={prod.product_id}
                            className="p-3 hover:bg-[#faf6f0] flex items-center justify-between gap-3 transition-colors group"
                          >
                            <div
                              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                              onMouseDown={e => {
                                e.preventDefault();
                                handleAddProductToSection(prod, section);
                              }}
                            >
                              <div className="w-11 h-11 rounded-lg border border-neutral-200 bg-white p-1 flex items-center justify-center shrink-0 group-hover:border-[#9A6A38]">
                                <img
                                  src={prod.main_image_url}
                                  alt={prod.product_name}
                                  className="max-h-full max-w-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-neutral-950 font-mono flex items-center gap-2">
                                  <span>{prod.model_number}</span>
                                  {prod.category && (
                                    <span className="text-[9px] font-sans px-1.5 py-0.2 bg-neutral-100 text-neutral-500 rounded font-normal">
                                      {prod.category}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-600 truncate uppercase font-medium">
                                  {prod.product_name}
                                </div>
                                <div className="text-[10px] text-neutral-400 truncate">
                                  {prod.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right mr-1">
                                <div className="text-[10px] text-neutral-400 uppercase font-mono">MRP</div>
                                <div className="font-bold text-xs text-neutral-900">
                                  ₹{Number(prod.base_price).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <button
                                type="button"
                                onMouseDown={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddProductToSection(prod, section);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                                title="Quick Add to Section"
                              >
                                + Add
                              </button>
                              <button
                                type="button"
                                onMouseDown={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleOpenCustomizerForSection(prod, section);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#9A6A38] hover:bg-[#835627] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                                title="Configure Finish, Handle & Add"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Configure</span>
                              </button>
                            </div>
                          </div>
                        ))}

                        {matchingProducts.length === 0 && (
                          <div className="p-4 text-center text-xs text-neutral-400">
                            No matching FIMA product found for "{searchQuery}".
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Line Items Table */}
                  {sectionItems.length > 0 ? (
                    <div className="overflow-x-auto border-t border-neutral-100 pt-2">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-500 uppercase font-mono tracking-wider">
                            <th className="py-2.5 px-2 w-16 text-center">IMAGE</th>
                            <th className="py-2.5 px-3 w-36">CODE</th>
                            <th className="py-2.5 px-3">DESCRIPTION</th>
                            <th className="py-2.5 px-3 w-24 text-right">MRP</th>
                            <th className="py-2.5 px-3 w-24 text-right">CLP</th>
                            <th className="py-2.5 px-3 w-20 text-center">QTY</th>
                            <th className="py-2.5 px-3 w-28 text-right">AMOUNT</th>
                            <th className="py-2.5 px-2 w-20 text-center">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-xs">
                          {sectionItems.map((item, itmIdx) => {
                            const unitRate = Number(item.clp && item.clp > 0 ? item.clp : (item.mrp || item.base_price || 0));
                            const displayImageUrl = item.product_image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80';

                            return (
                              <tr key={item.quotation_item_id || itmIdx} className="hover:bg-neutral-50/70 transition-colors">
                                {/* Image */}
                                <td className="py-3 px-2 text-center align-middle">
                                  <div
                                    onClick={() => handleOpenCustomizerForItem(item, section)}
                                    className="w-20 h-20 rounded-lg border border-neutral-200 bg-white p-1 flex items-center justify-center mx-auto shadow-2xs cursor-pointer group/img relative hover:border-[#9A6A38] transition-colors overflow-hidden"
                                    title="Click to Configure Finish, Handle & Preview"
                                  >
                                    <img
                                      src={displayImageUrl}
                                      alt={item.product_name}
                                      className="w-full h-full object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-neutral-900/60 rounded-lg opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                      <Sliders className="w-3.5 h-3.5 text-red-300" />
                                    </div>
                                  </div>
                                </td>

                                {/* Code */}
                                <td className="py-3 px-3 align-middle font-bold text-neutral-900 font-mono text-xs">
                                  <div
                                    onClick={() => handleOpenCustomizerForItem(item, section)}
                                    className="cursor-pointer hover:text-[#9A6A38] transition-colors"
                                    title="Click to Configure"
                                  >
                                    {item.model_number}
                                  </div>
                                </td>

                                {/* Description */}
                                <td className="py-3 px-3 align-middle">
                                  <div className="font-medium text-neutral-800 uppercase text-[11px] leading-snug">
                                    {item.product_name}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    {item.finish_name ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] bg-red-50 text-red-900 border border-red-200 px-1.5 py-0.5 rounded font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                        Finish: {item.finish_name}
                                      </span>
                                    ) : null}
                                    {item.handle_name ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] bg-neutral-100 text-neutral-800 border border-neutral-200 px-1.5 py-0.5 rounded font-medium">
                                        Handle: {item.handle_name}
                                      </span>
                                    ) : null}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCustomizerForItem(item, section)}
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8d5b28] hover:text-[#6a3f14] hover:underline cursor-pointer"
                                    >
                                      <Sliders className="w-3 h-3" />
                                      {item.finish_name || item.handle_name ? 'Change Config' : '+ Configure Finish/Handle'}
                                    </button>
                                  </div>
                                </td>

                                {/* MRP */}
                                <td className="py-3 px-3 align-middle text-right font-mono">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.mrp || item.base_price || ''}
                                    onChange={e => handleUpdateItemMrp(item.quotation_item_id, Number(e.target.value))}
                                    className="w-20 p-1 text-right text-xs font-semibold rounded border border-neutral-200 focus:outline-none focus:border-[#9A6A38]"
                                  />
                                </td>

                                {/* CLP (Customer Landing Price) */}
                                <td className="py-3 px-3 align-middle text-right font-mono">
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="—"
                                    value={item.clp !== undefined ? item.clp : ''}
                                    onChange={e => {
                                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                                      handleUpdateItemClp(item.quotation_item_id, val);
                                    }}
                                    className="w-20 p-1 text-right text-xs font-semibold rounded border border-neutral-200 focus:outline-none focus:border-[#9A6A38] placeholder-neutral-400"
                                  />
                                </td>

                                {/* Quantity */}
                                <td className="py-3 px-3 align-middle text-center">
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={e => handleUpdateItemQuantity(item.quotation_item_id, Number(e.target.value))}
                                    className="w-14 p-1 text-center text-xs font-bold rounded border border-neutral-300 focus:outline-none focus:border-[#9A6A38]"
                                  />
                                </td>

                                {/* Amount */}
                                <td className="py-3 px-3 align-middle text-right font-bold text-neutral-950 font-mono text-xs">
                                  ₹{Number(item.line_total).toLocaleString('en-IN')}
                                </td>

                                {/* Action Buttons: Configure & Remove */}
                                <td className="py-3 px-2 align-middle text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCustomizerForItem(item, section)}
                                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#754E24] bg-[#faf6f0] hover:bg-[#9A6A38] hover:text-white border border-[#debfa2] rounded-lg transition-all cursor-pointer shadow-2xs"
                                      title="Configure finish, handle and live preview"
                                      id={`btn-configure-${item.quotation_item_id}`}
                                    >
                                      <Sliders className="w-3 h-3" />
                                      <span>Configure</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCartItem(item.quotation_item_id)}
                                      className="px-2 py-1 text-[11px] font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Remove item"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-6 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                      <p className="text-xs text-neutral-400">
                        No products added to <strong>{section.name}</strong> yet.
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Type product code or description in the search bar above to add items.
                      </p>
                    </div>
                  )}

                  {/* Section Subtotal */}
                  <div className="pt-3 border-t border-neutral-100 flex justify-end items-center">
                    <div className="text-xs font-mono font-bold text-neutral-800">
                      <span className="uppercase text-neutral-500 mr-2 tracking-wider text-[11px]">SECTION SUBTOTAL</span>
                      <span className="text-sm font-bold text-neutral-950">
                        ₹{Number(sectionSubtotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM TOTALS & ACTIONS */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          {/* Action Buttons Left */}
          <div className="space-y-3 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSaveQuotation}
                disabled={isSaving || cartItems.length === 0}
                className="px-5 py-2.5 rounded-xl bg-[#9A6A38] hover:bg-[#835627] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                id="btn-bottom-generate-pdf"
              >
                <FileText className="w-4 h-4" />
                <span>Generate PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={cartItems.length === 0}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-50 text-neutral-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                id="btn-bottom-download-excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Download Excel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  api.saveQuotationDraft({
                    clientToName,
                    customerId: selectedCustomerId,
                    sections,
                    cartItems,
                    overallDiscount,
                    freightCharges,
                    otherCharges,
                    quotationDate
                  });
                  success('Draft Saved', 'Local draft quotation updated.');
                }}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-neutral-500" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleResetNewQuotation}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                <span>New Quotation</span>
              </button>
            </div>

            {/* Last Saved Status */}
            {lastSavedTime && (
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>Last saved: {lastSavedTime}</span>
              </div>
            )}
          </div>

          {/* Totals Summary Right */}
          <div className="w-full md:w-72 bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-600">
              <span className="uppercase text-[11px]">TOTAL MRP</span>
              <span className="font-semibold text-neutral-900">₹{Number(totalMrp).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-neutral-600 pb-2 border-b border-neutral-200">
              <span className="uppercase text-[11px]">TOTAL CLP / PRICE</span>
              <span className="font-semibold text-neutral-900">₹{Number(totalClp).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pt-1 text-neutral-950 font-bold">
              <span className="text-xs uppercase font-sans">Grand Total</span>
              <span className="text-base font-bold text-neutral-950">
                ₹{Number(grandTotal).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Product Configurator Modal */}
      {showCustomizer && (
        <ProductCustomizerModal
          isOpen={showCustomizer}
          onClose={() => {
            setShowCustomizer(false);
            setEditingCartItem(null);
            setTargetSectionForCustomizer(null);
          }}
          product={customizerProduct}
          initialCustomization={editingCartItem}
          onAddToQuotation={handleSaveCustomizedItem}
        />
      )}

      {/* Saved Quotation Preview & PDF / Print Modal */}
      {savedQuotationForPreview && companySettings && (
        <QuotationPreviewModal
          isOpen={!!savedQuotationForPreview}
          onClose={() => {
            setSavedQuotationForPreview(null);
            onNavigate('quotation-history');
          }}
          quotation={savedQuotationForPreview}
          companySettings={companySettings}
          onStatusChange={newStatus => {
            if (savedQuotationForPreview) {
              setSavedQuotationForPreview({ ...savedQuotationForPreview, status: newStatus });
            }
          }}
        />
      )}
    </div>
  );
};

