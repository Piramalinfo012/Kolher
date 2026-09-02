import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Mail,
  Loader2,
  FileCheck,
  ExternalLink,
  Building2,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';
import { Quotation, CompanySettings } from '../types';
import { PdfGeneratorService } from '../services/pdfGenerator';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { getVisualizerDataUrl } from '../components/InteractiveVisualizer';

interface QuotationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  companySettings: CompanySettings;
  onStatusChange?: (newStatus: any) => void;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  isOpen,
  onClose,
  quotation,
  companySettings,
  onStatusChange
}) => {
  const { success, error, info } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !quotation) return null;

  const items = quotation.items || [];

  const handlePrint = () => {
    PdfGeneratorService.printQuotation(quotation, companySettings);
  };

  const handleDownloadPdf = async () => {
    try {
      setGeneratingPdf(true);
      await PdfGeneratorService.downloadDirectPdf(quotation, companySettings);
      success('PDF Downloaded', `Quotation ${quotation.quotation_number} downloaded successfully as PDF.`);
      if (onStatusChange) onStatusChange('SENT');
    } catch (err: any) {
      error('PDF Generation Failed', err.message || 'Unable to generate PDF. You can also use the Print button to Save as PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    PdfGeneratorService.downloadHtmlDocument(quotation, companySettings);
    success('HTML Document Downloaded', 'Self-contained printable quotation document saved.');
  };

  const handleCopyLink = () => {
    const link = quotation.pdf_url && !quotation.pdf_url.includes('DRV_PDF_') ? quotation.pdf_url : window.location.href;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    success('Link Copied', 'Quotation access link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Quotation ${quotation.quotation_number} - ${companySettings.company_name}`);
    const body = encodeURIComponent(
      `Dear ${quotation.contact_person || quotation.party_name},\n\nPlease find attached the quotation ${quotation.quotation_number} for your review.\n\nTotal Value: INR ${Number(quotation.grand_total).toLocaleString('en-IN')}\n\nRegards,\n${companySettings.company_name}`
    );
    window.open(`mailto:${quotation.email || ''}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-neutral-200 overflow-hidden flex flex-col max-h-[94vh]"
          id="quotation-preview-modal"
        >
          {/* Action Toolbar Header */}
          <div className="px-6 py-4 bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {quotation.quotation_number}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {quotation.party_name}
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Valued at ₹{Number(quotation.grand_total).toLocaleString('en-IN')} (Status: {quotation.status})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print or Save as PDF"
                id="btn-print-quotation"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={generatingPdf}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                id="btn-download-pdf"
              >
                {generatingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>PDF</span>
              </button>

              <button
                onClick={handleEmailShare}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                id="btn-email-share"
                title="Share via Email"
              >
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Email</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Copy PDF link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable A4 Formatted Document Viewer */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-100/70">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-neutral-200/80 p-6 sm:p-10 font-sans text-neutral-900 print-page">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-amber-600/60 gap-4">
                <div>
                  <div className="font-serif-luxury font-bold text-lg sm:text-xl tracking-wider text-neutral-950">
                    {companySettings.company_name}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {companySettings.address}<br />
                    Tel: {companySettings.phone} | Email: {companySettings.email}<br />
                    <strong>GSTIN:</strong> {companySettings.gstin} | <strong>PAN:</strong> {companySettings.pan}
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-bold font-serif-luxury text-amber-700 tracking-wider">
                    QUOTATION
                  </div>
                  <div className="text-sm font-bold text-neutral-950 mt-1">
                    {quotation.quotation_number}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Date: {quotation.quotation_date}
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                    Status: {quotation.status}
                  </div>
                </div>
              </div>

              {/* Customer & Terms Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">
                    Quotation Prepared For:
                  </div>
                  <div className="text-sm font-bold text-neutral-900">
                    {quotation.party_name}
                  </div>
                  {quotation.company_name && (
                    <div className="text-xs text-neutral-600 font-medium">
                      {quotation.company_name}
                    </div>
                  )}
                  <div className="text-xs text-neutral-600 mt-2 space-y-0.5">
                    <div><strong>Contact:</strong> {quotation.contact_person || 'Client Representative'}</div>
                    <div><strong>Mobile:</strong> {quotation.mobile}</div>
                    <div><strong>Email:</strong> {quotation.email}</div>
                    {quotation.gstin && <div><strong>GSTIN:</strong> {quotation.gstin}</div>}
                    <div><strong>Billing Address:</strong> {quotation.billing_address}</div>
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">
                    Commercial Terms:
                  </div>
                  <div className="text-xs text-neutral-700 space-y-1.5 leading-relaxed">
                    <div><strong>Validity:</strong> {quotation.validity || companySettings.default_validity}</div>
                    <div><strong>Payment Terms:</strong> {quotation.payment_terms || companySettings.default_payment_terms}</div>
                    <div><strong>Delivery Period:</strong> {quotation.delivery_terms || companySettings.default_delivery_terms}</div>
                    <div><strong>Account Exec:</strong> {quotation.created_by || 'Rajeev Sharma'}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto my-6 border border-neutral-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-900 text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 text-center w-10">#</th>
                      <th className="p-3 w-16 text-center">Image</th>
                      <th className="p-3">Product & Customization</th>
                      <th className="p-3 text-center w-20">Qty</th>
                      <th className="p-3 text-right w-24">Unit Rate</th>
                      <th className="p-3 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {(() => {
                      const hasSections = items.some(it => !!it.section_name);
                      if (!hasSections) {
                        return items.map((item, idx) => {
                          const itemImg =
                            item.product_image_url && item.product_image_url.startsWith('data:image/svg')
                              ? item.product_image_url
                              : item.finish_name || item.handle_name || (item.model_number && (item.model_number.startsWith('F5801') || item.model_number.startsWith('K-77959') || item.model_number.includes('SLIDE')))
                                ? getVisualizerDataUrl(
                                    { finish_name: item.finish_name, finish_code: item.finish_id },
                                    { handle_name: item.handle_name, handle_model: item.handle_id }
                                  )
                                : item.product_image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80';

                          return (
                            <tr key={idx} className="hover:bg-neutral-50/50">
                              <td className="p-3 text-center text-neutral-500 font-mono">{idx + 1}</td>
                              <td className="p-3 text-center">
                                <img
                                  src={itemImg}
                                  alt={item.product_name}
                                  className="w-12 h-12 rounded-lg object-contain border border-neutral-200 mx-auto bg-neutral-50"
                                  referrerPolicy="no-referrer"
                                />
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-neutral-900 text-xs">{item.model_number ? `${item.model_number} - ` : ''}{item.product_name}</div>
                                <div className="text-neutral-500 text-[11px] font-mono">Code: {item.model_number}</div>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {item.finish_name && (
                                    <span className="bg-amber-50 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-200">
                                      Finish: {item.finish_name}
                                    </span>
                                  )}
                                  {item.handle_name && (
                                    <span className="bg-neutral-100 text-neutral-800 text-[10px] font-medium px-2 py-0.5 rounded border border-neutral-200">
                                      Handle: {item.handle_name}
                                    </span>
                                  )}
                                </div>
                                {item.customization_json?.notes && (
                                  <div className="text-[10px] text-neutral-500 italic mt-1">
                                    Note: {item.customization_json.notes}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center font-bold text-neutral-900">
                                {item.quantity} <span className="text-[10px] font-normal text-neutral-500">{item.unit || 'PCS'}</span>
                              </td>
                              <td className="p-3 text-right text-neutral-700">
                                ₹{Number(item.unit_final_price || item.clp || item.mrp || item.base_price).toLocaleString('en-IN')}
                              </td>
                              <td className="p-3 text-right font-bold text-neutral-900">
                                ₹{Number(item.line_total).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        });
                      }

                      // Group by section
                      const sectionOrder: string[] = [];
                      const sectionMap: { [key: string]: typeof items } = {};
                      items.forEach(it => {
                        const sec = it.section_name || 'General';
                        if (!sectionMap[sec]) {
                          sectionMap[sec] = [];
                          sectionOrder.push(sec);
                        }
                        sectionMap[sec].push(it);
                      });

                      let globalIndex = 1;
                      return sectionOrder.map(secName => {
                        const secItems = sectionMap[secName];
                        const secSubtotal = secItems.reduce((acc, it) => acc + (Number(it.line_total) || 0), 0);

                        return (
                          <React.Fragment key={secName}>
                            <tr className="bg-amber-50/80 border-t-2 border-amber-200/70 border-b border-amber-200/50">
                              <td colSpan={6} className="px-4 py-2 text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-3.5 bg-amber-700 rounded-xs inline-block"></span>
                                  SECTION: {secName}
                                </span>
                                <span className="font-semibold text-neutral-800 text-[11px]">
                                  Section Subtotal: ₹{secSubtotal.toLocaleString('en-IN')}
                                </span>
                              </td>
                            </tr>
                            {secItems.map(item => {
                              const itemImg =
                                item.product_image_url && item.product_image_url.startsWith('data:image/svg')
                                  ? item.product_image_url
                                  : item.finish_name || item.handle_name || (item.model_number && (item.model_number.startsWith('F5801') || item.model_number.startsWith('K-77959') || item.model_number.includes('SLIDE')))
                                    ? getVisualizerDataUrl(
                                        { finish_name: item.finish_name, finish_code: item.finish_id },
                                        { handle_name: item.handle_name, handle_model: item.handle_id }
                                      )
                                    : item.product_image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80';

                              return (
                                <tr key={item.quotation_item_id || globalIndex} className="hover:bg-neutral-50/50">
                                  <td className="p-3 text-center text-neutral-500 font-mono">{globalIndex++}</td>
                                  <td className="p-3 text-center">
                                    <img
                                      src={itemImg}
                                      alt={item.product_name}
                                      className="w-12 h-12 rounded-lg object-contain border border-neutral-200 mx-auto bg-neutral-50"
                                      referrerPolicy="no-referrer"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <div className="font-bold text-neutral-900 text-xs">{item.model_number ? `${item.model_number} - ` : ''}{item.product_name}</div>
                                    <div className="text-neutral-500 text-[11px] font-mono">Code: {item.model_number}</div>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {item.finish_name && (
                                        <span className="bg-amber-50 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-200">
                                          Finish: {item.finish_name}
                                        </span>
                                      )}
                                      {item.handle_name && (
                                        <span className="bg-neutral-100 text-neutral-800 text-[10px] font-medium px-2 py-0.5 rounded border border-neutral-200">
                                          Handle: {item.handle_name}
                                        </span>
                                      )}
                                    </div>
                                    {item.customization_json?.notes && (
                                      <div className="text-[10px] text-neutral-500 italic mt-1">
                                        Note: {item.customization_json.notes}
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 text-center font-bold text-neutral-900">
                                    {item.quantity} <span className="text-[10px] font-normal text-neutral-500">{item.unit || 'PCS'}</span>
                                  </td>
                                  <td className="p-3 text-right text-neutral-700">
                                    ₹{Number(item.unit_final_price || item.clp || item.mrp || item.base_price).toLocaleString('en-IN')}
                                  </td>
                                  <td className="p-3 text-right font-bold text-neutral-900">
                                    ₹{Number(item.line_total).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary & Bank Remittance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 items-start">
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
                  <div className="font-bold text-neutral-900 mb-1">
                    Bank Remittance Coordinates:
                  </div>
                  <div>Bank: <strong>{companySettings.bank_name}</strong></div>
                  <div>Account No: <strong>{companySettings.account_number}</strong></div>
                  <div>IFSC Code: <strong>{companySettings.ifsc}</strong></div>
                  <div>Branch: {companySettings.branch}</div>
                </div>

                <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal:</span>
                      <span>₹{Number(quotation.subtotal).toLocaleString('en-IN')}</span>
                    </div>
                    {quotation.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount:</span>
                        <span>- ₹{Number(quotation.discount).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {quotation.freight > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Freight / Logistics:</span>
                        <span>+ ₹{Number(quotation.freight).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {quotation.other_charges > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Other Charges:</span>
                        <span>+ ₹{Number(quotation.other_charges).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-neutral-900 pt-1 border-t border-amber-200">
                      <span>Taxable Amount:</span>
                      <span>₹{Number(quotation.taxable_amount || quotation.subtotal).toLocaleString('en-IN')}</span>
                    </div>
                    {quotation.igst > 0 ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>IGST (18%):</span>
                        <span>₹{Number(quotation.igst).toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-neutral-600">
                          <span>CGST (9%):</span>
                          <span>₹{Number(quotation.cgst || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                          <span>SGST (9%):</span>
                          <span>₹{Number(quotation.sgst || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center text-sm font-bold text-neutral-950 pt-2 border-t-2 border-neutral-900">
                      <span>Grand Total (INR):</span>
                      <span className="text-base text-amber-800 font-serif-luxury">
                        ₹{Number(quotation.grand_total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Authorized Signature */}
              <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-neutral-600">
                <div className="max-w-md">
                  <div className="font-bold text-neutral-900 mb-1">Standard Terms & Conditions:</div>
                  <div className="text-[11px] leading-relaxed whitespace-pre-line text-neutral-500">
                    {companySettings.terms_conditions}
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0 w-full sm:w-auto">
                  <div className="w-48 border-t border-dashed border-neutral-400 pt-2 mx-auto sm:ml-auto">
                    <div className="font-bold text-neutral-900 text-xs">{companySettings.authorized_signatory}</div>
                    <div className="text-[10px] text-neutral-500">Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
