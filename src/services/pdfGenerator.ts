import { Quotation, CompanySettings } from '../types';
import { api } from './api';
import { getVisualizerDataUrl } from '../components/InteractiveVisualizer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PdfGeneratorService {
  /**
   * Builds the clean, selectable, corporate A4 quotation HTML
   */
  public static generateHtml(quotation: Quotation, settings: CompanySettings): string {
    const items = quotation.items || [];
    const isInterState = (quotation.billing_address || '').toLowerCase().indexOf('maharashtra') === -1 &&
                         (quotation.shipping_address || '').toLowerCase().indexOf('maharashtra') === -1;

    // Check if items have sections
    const hasSections = items.some(item => !!item.section_name);

    let itemsRows = '';

    if (hasSections) {
      // Group items by section
      const sectionOrder: string[] = [];
      const sectionMap: { [key: string]: typeof items } = {};

      items.forEach(item => {
        const sec = item.section_name || 'General Items';
        if (!sectionMap[sec]) {
          sectionMap[sec] = [];
          sectionOrder.push(sec);
        }
        sectionMap[sec].push(item);
      });

      let globalIdx = 1;
      itemsRows = sectionOrder.map(secName => {
        const secItems = sectionMap[secName];
        const secSubtotal = secItems.reduce((acc, it) => acc + (Number(it.line_total) || 0), 0);
        
        const secHeader = `
          <tr style="background-color: #f7f3ed; border-top: 2px solid #e0d3c1; border-bottom: 1px solid #d4c3ae;">
            <td colspan="6" style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #784c1f; text-transform: uppercase; letter-spacing: 0.8px;">
              <span style="display: inline-block; width: 6px; height: 12px; background: #9a6a38; vertical-align: middle; margin-right: 6px; border-radius: 1px;"></span>
              SECTION: ${secName}
              <span style="float: right; font-weight: 700; color: #4a3319; font-size: 11px;">
                Section Subtotal: ₹${secSubtotal.toLocaleString('en-IN')}
              </span>
            </td>
          </tr>
        `;

        const secRows = secItems.map(item => {
          const customization: any = item.customization_json || {};
          const itemImg =
            item.product_image_url && item.product_image_url.startsWith('data:image/svg')
              ? item.product_image_url
              : item.finish_name || item.handle_name || (item.model_number && (item.model_number.startsWith('F5801') || item.model_number.startsWith('K-77959') || item.model_number.includes('SLIDE')))
                ? getVisualizerDataUrl(
                    { finish_name: item.finish_name, finish_code: item.finish_id },
                    { handle_name: item.handle_name, handle_model: item.handle_id }
                  )
                : item.product_image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80';

          const rowHtml = `
            <tr class="item-row" style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 9px 8px; text-align: center; vertical-align: middle; font-size: 11px; color: #6b7280;">${globalIdx++}</td>
              <td style="padding: 9px 8px; vertical-align: middle; text-align: center; width: 60px;">
                <img src="${itemImg}"
                     alt="${item.product_name}"
                     style="width: 48px; height: 48px; object-fit: contain; border-radius: 4px; border: 1px solid #e5e7eb; background: #fff;"
                     referrerpolicy="no-referrer" />
              </td>
              <td style="padding: 9px 8px; vertical-align: middle;">
                <div style="font-weight: 700; font-size: 12px; color: #111827;">${item.model_number ? `${item.model_number} - ` : ''}${item.product_name}</div>
                <div style="font-size: 11px; color: #4b5563; margin-top: 1px;">Code: <strong style="color: #111827;">${item.model_number || 'N/A'}</strong></div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px;">
                  ${item.finish_name ? `<span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 3px; border: 1px solid #fde68a;">Finish: ${item.finish_name}</span>` : ''}
                  ${item.handle_name ? `<span style="display: inline-block; background-color: #f3f4f6; color: #374151; font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 3px; border: 1px solid #e5e7eb;">Handle: ${item.handle_name}</span>` : ''}
                </div>
                ${customization.notes ? `<div style="font-size: 10px; color: #6b7280; font-style: italic; margin-top: 3px;">Note: ${customization.notes}</div>` : ''}
              </td>
              <td style="padding: 9px 8px; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600;">
                ${item.quantity} <span style="font-size: 10px; color: #6b7280; font-weight: normal;">${item.unit || 'PCS'}</span>
              </td>
              <td style="padding: 9px 8px; text-align: right; vertical-align: middle; font-size: 12px;">
                ₹${Number(item.unit_final_price || item.clp || item.mrp || item.base_price).toLocaleString('en-IN')}
              </td>
              <td style="padding: 9px 8px; text-align: right; vertical-align: middle; font-size: 12px; font-weight: 700; color: #111827;">
                ₹${Number(item.line_total).toLocaleString('en-IN')}
              </td>
            </tr>
          `;
          return rowHtml;
        }).join('');

        return secHeader + secRows;
      }).join('');
    } else {
      itemsRows = items.map((item, index) => {
        const customization: any = item.customization_json || {};
        const itemImg =
          item.product_image_url && item.product_image_url.startsWith('data:image/svg')
            ? item.product_image_url
            : item.finish_name || item.handle_name || (item.model_number && (item.model_number.startsWith('F5801') || item.model_number.startsWith('K-77959') || item.model_number.includes('SLIDE')))
              ? getVisualizerDataUrl(
                  { finish_name: item.finish_name, finish_code: item.finish_id },
                  { handle_name: item.handle_name, handle_model: item.handle_id }
                )
              : item.product_image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80';

        return `
          <tr class="item-row" style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 8px; text-align: center; vertical-align: middle; font-size: 11px; color: #6b7280;">${index + 1}</td>
            <td style="padding: 10px 8px; vertical-align: middle; text-align: center; width: 65px;">
              <img src="${itemImg}"
                   alt="${item.product_name}"
                   style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; border: 1px solid #e5e7eb; background: #fff;"
                   referrerpolicy="no-referrer" />
            </td>
            <td style="padding: 10px 8px; vertical-align: middle;">
              <div style="font-weight: 700; font-size: 13px; color: #111827;">${item.model_number ? `${item.model_number} - ` : ''}${item.product_name}</div>
              <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Code: <strong style="color: #111827;">${item.model_number || 'N/A'}</strong></div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                ${item.finish_name ? `<span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 10px; font-weight: 500; padding: 2px 6px; border-radius: 3px; border: 1px solid #fde68a;">Finish: ${item.finish_name}</span>` : ''}
                ${item.handle_name ? `<span style="display: inline-block; background-color: #f3f4f6; color: #374151; font-size: 10px; font-weight: 500; padding: 2px 6px; border-radius: 3px; border: 1px solid #e5e7eb;">Handle: ${item.handle_name}</span>` : ''}
              </div>
              ${customization.notes ? `<div style="font-size: 10px; color: #6b7280; font-style: italic; margin-top: 4px;">Note: ${customization.notes}</div>` : ''}
            </td>
            <td style="padding: 10px 8px; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600;">
              ${item.quantity} <span style="font-size: 10px; color: #6b7280; font-weight: normal;">${item.unit || 'PCS'}</span>
            </td>
            <td style="padding: 10px 8px; text-align: right; vertical-align: middle; font-size: 12px;">
              ₹${Number(item.unit_final_price || item.clp || item.mrp || item.base_price).toLocaleString('en-IN')}
            </td>
            <td style="padding: 10px 8px; text-align: right; vertical-align: middle; font-size: 12px; font-weight: 600; color: #111827;">
              ₹${Number(item.line_total).toLocaleString('en-IN')}
            </td>
          </tr>
        `;
      }).join('');
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Quotation ${quotation.quotation_number}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            background: #ffffff;
            font-size: 12px;
            line-height: 1.45;
            padding: 30px;
          }
          .page-container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header-table { width: 100%; border-bottom: 2px solid #C5A880; padding-bottom: 15px; margin-bottom: 20px; }
          .company-name { font-size: 20px; font-weight: 700; color: #111827; letter-spacing: 0.5px; }
          .gold-text { color: #9A7B4F; font-weight: 600; }
          .meta-box { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
          .info-table { width: 100%; margin-bottom: 20px; }
          .info-td { width: 50%; vertical-align: top; padding-right: 15px; }
          .table-products { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
          .table-products th { background: #111827; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px; font-weight: 600; }
          .summary-table { width: 320px; margin-left: auto; border-collapse: collapse; }
          .summary-table td { padding: 5px 8px; font-size: 12px; }
          .summary-table .grand-row { border-top: 2px solid #111827; border-bottom: 2px solid #111827; font-weight: 700; font-size: 14px; background: #fffbeb; }
          .footer-section { margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          .bank-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 12px; margin-top: 10px; font-size: 11px; }
          @media print {
            body { padding: 0; }
            .page-container { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="page-container" id="quotation-print-root">
          <!-- Header -->
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle; width: 65%;">
                <div class="company-name">${settings.company_name}</div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                  ${settings.address}<br>
                  Tel: ${settings.phone} | Email: ${settings.email} | Web: ${settings.website}<br>
                  <strong>GSTIN:</strong> ${settings.gstin} | <strong>PAN:</strong> ${settings.pan}
                </div>
              </td>
              <td style="text-align: right; vertical-align: middle; width: 35%;">
                <div style="display: inline-block; text-align: right;">
                  <div style="font-size: 22px; font-weight: 800; color: #C5A880; letter-spacing: 1px;">QUOTATION</div>
                  <div style="font-size: 13px; font-weight: 700; color: #111827; margin-top: 2px;">${quotation.quotation_number}</div>
                  <div style="font-size: 11px; color: #4b5563;">Date: ${quotation.quotation_date}</div>
                  <div style="font-size: 11px; color: #059669; font-weight: 600;">Status: ${quotation.status}</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Client Details & Dispatch Info -->
          <table class="info-table">
            <tr>
              <td class="info-td">
                <div class="meta-box">
                  <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 4px;">Quotation For:</div>
                  <div style="font-size: 14px; font-weight: 700; color: #111827;">${quotation.party_name}</div>
                  ${quotation.company_name ? `<div style="font-size: 12px; color: #374151;">${quotation.company_name}</div>` : ''}
                  <div style="font-size: 11px; color: #4b5563; margin-top: 4px;">
                    <strong>Contact:</strong> ${quotation.contact_person || 'Client Representative'}<br>
                    <strong>Mobile:</strong> ${quotation.mobile || '-'} | <strong>Email:</strong> ${quotation.email || '-'}<br>
                    ${quotation.gstin ? `<strong>GSTIN:</strong> ${quotation.gstin}<br>` : ''}
                    <strong>Billing:</strong> ${quotation.billing_address || '-'}
                  </div>
                </div>
              </td>
              <td class="info-td" style="padding-right: 0;">
                <div class="meta-box">
                  <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 4px;">Commercial Terms:</div>
                  <div style="font-size: 11px; color: #374151; line-height: 1.6;">
                    <strong>Quotation Validity:</strong> ${quotation.validity || settings.default_validity}<br>
                    <strong>Payment Terms:</strong> ${quotation.payment_terms || settings.default_payment_terms}<br>
                    <strong>Delivery Period:</strong> ${quotation.delivery_terms || settings.default_delivery_terms}<br>
                    <strong>Created By:</strong> ${quotation.created_by || 'Commercial Sales Desk'}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Line Items Table -->
          <table class="table-products">
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th style="width: 65px; text-align: center;">Image</th>
                <th style="text-align: left;">Product & Customization Details</th>
                <th style="width: 70px; text-align: center;">Qty</th>
                <th style="width: 100px; text-align: right;">Unit Rate</th>
                <th style="width: 110px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Financial Calculation Breakdown -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 10px;">
            <div style="width: 45%; font-size: 11px; color: #4b5563;">
              <div class="bank-box">
                <strong style="color: #111827;">Bank Remittance Details:</strong><br>
                Bank: <strong>${settings.bank_name}</strong><br>
                A/C No: <strong>${settings.account_number}</strong><br>
                IFSC: <strong>${settings.ifsc}</strong> | Branch: ${settings.branch}
              </div>
            </div>
            <div style="width: 50%;">
              <table class="summary-table">
                <tr>
                  <td>Subtotal:</td>
                  <td style="text-align: right;">₹${Number(quotation.subtotal).toLocaleString('en-IN')}</td>
                </tr>
                ${quotation.discount > 0 ? `
                <tr style="color: #dc2626;">
                  <td>Discount:</td>
                  <td style="text-align: right;">- ₹${Number(quotation.discount).toLocaleString('en-IN')}</td>
                </tr>` : ''}
                ${quotation.freight > 0 ? `
                <tr>
                  <td>Freight / Logistics:</td>
                  <td style="text-align: right;">+ ₹${Number(quotation.freight).toLocaleString('en-IN')}</td>
                </tr>` : ''}
                ${quotation.other_charges > 0 ? `
                <tr>
                  <td>Packing / Other Charges:</td>
                  <td style="text-align: right;">+ ₹${Number(quotation.other_charges).toLocaleString('en-IN')}</td>
                </tr>` : ''}
                <tr style="font-weight: 600; border-top: 1px solid #e5e7eb;">
                  <td>Taxable Amount:</td>
                  <td style="text-align: right;">₹${Number(quotation.taxable_amount || quotation.subtotal).toLocaleString('en-IN')}</td>
                </tr>
                ${quotation.igst > 0 ? `
                <tr>
                  <td>IGST (${settings.default_gst || 18}%):</td>
                  <td style="text-align: right;">₹${Number(quotation.igst).toLocaleString('en-IN')}</td>
                </tr>` : `
                <tr>
                  <td>CGST (${(settings.default_gst || 18) / 2}%):</td>
                  <td style="text-align: right;">₹${Number(quotation.cgst || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>SGST (${(settings.default_gst || 18) / 2}%):</td>
                  <td style="text-align: right;">₹${Number(quotation.sgst || 0).toLocaleString('en-IN')}</td>
                </tr>`}
                <tr class="grand-row">
                  <td style="padding: 8px;">Grand Total (INR):</td>
                  <td style="text-align: right; color: #9A7B4F; padding: 8px; font-size: 15px;">₹${Number(quotation.grand_total).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Terms & Authorized Signatory -->
          <div class="footer-section">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div style="width: 60%;">
                <div style="font-size: 11px; font-weight: 700; color: #111827; margin-bottom: 4px;">Terms & Conditions:</div>
                <div style="font-size: 10px; color: #4b5563; line-height: 1.5; white-space: pre-line;">
                  ${settings.terms_conditions}
                </div>
              </div>
              <div style="width: 35%; text-align: center; border-top: 1px dashed #9ca3af; padding-top: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #111827;">${settings.authorized_signatory}</div>
                <div style="font-size: 10px; color: #6b7280;">For ${settings.company_name}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Direct PDF File Generation & Download via jsPDF + html2canvas
   * Directly downloads a .pdf file to the user's computer/device
   */
  public static async downloadDirectPdf(quotation: Quotation, settings: CompanySettings): Promise<void> {
    const cleanNumber = (quotation.quotation_number || 'Quote').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Kohler_Quotation_${cleanNumber}.pdf`;

    // Create an offscreen render container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.backgroundColor = '#ffffff';
    container.style.zIndex = '-1000';
    container.innerHTML = this.generateHtml(quotation, settings);
    document.body.appendChild(container);

    try {
      // Wait for all images inside container to be fully loaded
      const images = Array.from(container.querySelectorAll('img'));
      await Promise.all(
        images.map(
          img =>
            new Promise<void>(resolve => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            })
        )
      );

      // Target the print root inside container
      const printRoot = (container.querySelector('#quotation-print-root') as HTMLElement) || container;

      const canvas = await html2canvas(printRoot, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);

      // Update status & log
      await api.updateQuotation(quotation.quotation_id, {
        status: quotation.status === 'DRAFT' ? 'SENT' : quotation.status
      });
      api.logActivity('DOWNLOAD_PDF', 'PDF_SERVICE', quotation.quotation_number, `Downloaded PDF for ${quotation.party_name}`);
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * Generates PDF via Google Apps Script Backend or triggers direct PDF download
   */
  public static async generateAndSavePdf(
    quotation: Quotation,
    settings: CompanySettings
  ): Promise<{ fileId: string; pdfUrl: string; downloadUrl: string }> {
    const config = api.getConfig();

    // If actual Google Apps Script backend is hooked up and active
    if (config.appsScriptUrl && !api.isUsingDemoMode()) {
      try {
        const response = await fetch(config.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'generateQuotationPDF',
            payload: {
              quotation,
              companySettings: settings
            }
          })
        });
        const res = await response.json();
        if (res.success && res.data && res.data.pdfUrl) {
          await api.updateQuotation(quotation.quotation_id, {
            pdf_file_id: res.data.fileId,
            pdf_url: res.data.pdfUrl,
            status: 'SENT'
          });
          return res.data;
        }
      } catch (err) {
        console.warn('Google Apps Script PDF service unreachable, using client printable document:', err);
      }
    }

    // Direct client PDF download
    await this.downloadDirectPdf(quotation, settings);

    return {
      fileId: `LOCAL_PDF_${Date.now()}`,
      pdfUrl: '',
      downloadUrl: ''
    };
  }

  /**
   * Direct Standalone Printable HTML file download
   */
  public static downloadHtmlDocument(quotation: Quotation, settings: CompanySettings): void {
    const html = this.generateHtml(quotation, settings);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanNumber = (quotation.quotation_number || 'Quote').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.href = url;
    a.download = `Kohler_Quotation_${cleanNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Opens print preview window for physical printing or instant Save as PDF
   */
  public static printQuotation(quotation: Quotation, settings: CompanySettings): void {
    const html = this.generateHtml(quotation, settings);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }
}
