import { Quotation, CompanySettings } from '../types';
import { api } from './api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PdfGeneratorService {
  /**
   * Builds the clean, selectable, corporate A4 quotation HTML
   */
  public static generateHtml(quotation: Quotation, settings: CompanySettings): string {
    const items = quotation.items || [];

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
          <tr style="background-color: #fff5f5; border-top: 2px solid #fecaca; border-bottom: 1px solid #fca5a5;">
            <td colspan="6" style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.8px;">
              <span style="display: inline-block; width: 6px; height: 12px; background: #ef4444; vertical-align: middle; margin-right: 6px; border-radius: 1px;"></span>
              SECTION: ${secName}
              <span style="float: right; font-weight: 700; color: #7f1d1d; font-size: 11px;">
                Section Subtotal: ₹${secSubtotal.toLocaleString('en-IN')}
              </span>
            </td>
          </tr>
        `;

        const secRows = secItems.map(item => {
          const customization: any = item.customization_json || {};
          const itemImg = item.product_image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80';

          const rowHtml = `
            <tr class="item-row" style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 8px; text-align: center; vertical-align: middle; font-size: 11px; color: #6b7280;">${globalIdx++}</td>
              <td style="padding: 10px 8px; vertical-align: middle; text-align: center; width: 95px;">
                <img src="${itemImg}"
                     alt="${item.product_name}"
                     style="width: 80px; height: 80px; object-fit: contain; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; padding: 2px;"
                     referrerpolicy="no-referrer" />
              </td>
              <td style="padding: 10px 8px; vertical-align: middle;">
                <div style="font-weight: 700; font-size: 12px; color: #111827;">${item.model_number ? `${item.model_number} - ` : ''}${item.product_name}</div>
                <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Code: <strong style="color: #111827;">${item.model_number || 'N/A'}</strong></div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                  ${item.finish_name ? `<span style="display: inline-block; background-color: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; border: 1px solid #fca5a5;">Finish: ${item.finish_name}</span>` : ''}
                  ${item.handle_name ? `<span style="display: inline-block; background-color: #f3f4f6; color: #374151; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; border: 1px solid #e5e7eb;">Handle: ${item.handle_name}</span>` : ''}
                </div>
                ${customization.notes ? `<div style="font-size: 10px; color: #6b7280; font-style: italic; margin-top: 4px;">Note: ${customization.notes}</div>` : ''}
              </td>
              <td style="padding: 10px 8px; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600;">
                ${item.quantity} <span style="font-size: 10px; color: #6b7280; font-weight: normal;">${item.unit || 'PCS'}</span>
              </td>
              <td style="padding: 10px 8px; text-align: right; vertical-align: middle; font-size: 12px;">
                ₹${Number(item.unit_final_price || item.clp || item.mrp || item.base_price).toLocaleString('en-IN')}
              </td>
              <td style="padding: 10px 8px; text-align: right; vertical-align: middle; font-size: 12px; font-weight: 700; color: #111827;">
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
        const itemImg = item.product_image_url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80';

        return `
          <tr class="item-row" style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 8px; text-align: center; vertical-align: middle; font-size: 11px; color: #6b7280;">${index + 1}</td>
            <td style="padding: 10px 8px; vertical-align: middle; text-align: center; width: 95px;">
              <img src="${itemImg}"
                   alt="${item.product_name}"
                   style="width: 80px; height: 80px; object-fit: contain; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; padding: 2px;"
                   referrerpolicy="no-referrer" />
            </td>
            <td style="padding: 10px 8px; vertical-align: middle;">
              <div style="font-weight: 700; font-size: 13px; color: #111827;">${item.model_number ? `${item.model_number} - ` : ''}${item.product_name}</div>
              <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Code: <strong style="color: #111827;">${item.model_number || 'N/A'}</strong></div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                ${item.finish_name ? `<span style="display: inline-block; background-color: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 500; padding: 2px 6px; border-radius: 4px; border: 1px solid #fca5a5;">Finish: ${item.finish_name}</span>` : ''}
                ${item.handle_name ? `<span style="display: inline-block; background-color: #f3f4f6; color: #374151; font-size: 10px; font-weight: 500; padding: 2px 6px; border-radius: 4px; border: 1px solid #e5e7eb;">Handle: ${item.handle_name}</span>` : ''}
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
            line-height: 1.5;
            padding: 30px;
          }
          .page-container {
            width: 730px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header-table { width: 100%; border-bottom: 2.5px solid #e30613; padding-bottom: 12px; margin-bottom: 20px; }
          .company-name { font-size: 18px; font-weight: 800; color: #111827; letter-spacing: -0.2px; }
          .meta-box { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; }
          .info-table { width: 100%; margin-bottom: 20px; border-collapse: separate; border-spacing: 10px 0; margin-left: -10px; margin-right: -10px; }
          .info-td { width: 50%; vertical-align: top; }
          .table-products { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
          .table-products th { background: #111827; color: #ffffff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; padding: 9px 8px; font-weight: 700; }
          .summary-table { width: 100%; border-collapse: collapse; }
          .summary-table td { padding: 6px 10px; font-size: 12px; }
          .summary-table .grand-row { border-top: 2px solid #111827; border-bottom: 2px solid #111827; font-weight: 800; font-size: 14px; background: #fffbeb; }
          .footer-section { margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          .bank-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; font-size: 11px; line-height: 1.6; }
          @media print {
            body { padding: 0; }
            .page-container { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="page-container" id="quotation-print-root">
          <!-- Header -->
          <table class="header-table">
            <tr>
              <td style="vertical-align: top; width: 62%;">
                <div style="margin-bottom: 6px;">
                  <img src="${settings.logo_drive_url || '/fima-logo.png'}" 
                       alt="${settings.company_name}" 
                       style="max-height: 48px; max-width: 220px; object-fit: contain; display: block;" 
                       onerror="this.style.display='none'" />
                </div>
                <div class="company-name">${settings.company_name}</div>
                <div style="font-size: 11px; color: #4b5563; margin-top: 4px; line-height: 1.5;">
                  ${settings.address || 'FIMA Carlo Frattini Experience Centre, Mumbai, Maharashtra 400052'}<br>
                  Tel: ${settings.phone || '+91 22 1234 5678'} | Email: ${settings.email || 'info@fimacf.in'} | Web: ${settings.website || 'www.fimacf.com'}<br>
                  ${settings.gstin ? `<strong>GSTIN:</strong> ${settings.gstin}` : ''} ${settings.pan ? `| <strong>PAN:</strong> ${settings.pan}` : ''}
                </div>
              </td>
              <td style="text-align: right; vertical-align: top; width: 38%;">
                <div style="font-size: 22px; font-weight: 900; color: #e30613; letter-spacing: 1px; line-height: 1;">QUOTATION</div>
                <div style="font-size: 13px; font-weight: 700; color: #111827; margin-top: 4px;">${quotation.quotation_number}</div>
                <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">Date: <strong>${quotation.quotation_date}</strong></div>
                <div style="font-size: 11px; color: #059669; font-weight: 700; margin-top: 2px;">Status: ${quotation.status}</div>
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
                  <div style="font-size: 11px; color: #4b5563; margin-top: 4px; line-height: 1.5;">
                    <strong>Contact:</strong> ${quotation.contact_person || 'Client Representative'}<br>
                    <strong>Mobile:</strong> ${quotation.mobile || '-'} | <strong>Email:</strong> ${quotation.email || '-'}<br>
                    ${quotation.gstin ? `<strong>GSTIN:</strong> ${quotation.gstin}<br>` : ''}
                    <strong>Billing:</strong> ${quotation.billing_address || '-'}
                  </div>
                </div>
              </td>
              <td class="info-td">
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
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 15px;">
            <div style="width: 48%; font-size: 11px; color: #4b5563;">
              <div class="bank-box">
                <strong style="color: #111827;">Bank Remittance Details:</strong><br>
                Bank: <strong>${settings.bank_name}</strong><br>
                A/C No: <strong>${settings.account_number}</strong><br>
                IFSC: <strong>${settings.ifsc}</strong> | Branch: ${settings.branch}
              </div>
            </div>
            <div style="width: 48%;">
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
                  <td style="text-align: right; color: #e30613; padding: 8px; font-size: 15px;">₹${Number(quotation.grand_total).toLocaleString('en-IN')}</td>
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

  public static async downloadDirectPdf(quotation: Quotation, settings: CompanySettings): Promise<void> {
    const cleanNumber = (quotation.quotation_number || 'Quote').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `FIMA_Quotation_${cleanNumber}.pdf`;

    // Create an offscreen render container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '0';
    container.style.width = '794px';
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

      const printRoot = (container.querySelector('#quotation-print-root') as HTMLElement) || container;
      
      const canvas = await html2canvas(printRoot, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(fileName);

      // Update status & log
      await api.updateQuotation(quotation.quotation_id, {
        status: quotation.status === 'DRAFT' ? 'SENT' : quotation.status
      });
      api.logActivity('DOWNLOAD_PDF', 'PDF_SERVICE', quotation.quotation_number, `Downloaded PDF for ${quotation.party_name}`);
    } catch (err) {
      console.error('Error generating PDF', err);
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
    a.download = `FIMA_Quotation_${cleanNumber}.html`;
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



