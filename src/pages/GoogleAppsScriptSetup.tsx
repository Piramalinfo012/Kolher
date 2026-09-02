import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  RefreshCw,
  FolderSync,
  HelpCircle,
  FileSpreadsheet,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const GoogleAppsScriptSetup: React.FC = () => {
  const { success, error, info } = useToast();
  const [copied, setCopied] = useState(false);
  const [testingUrl, setTestingUrl] = useState(api.getAppsScriptUrl() || '');
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testResult, setTestResult] = useState<any>(null);

  const appsScriptCode = `/**
 * PIRAMAL SANITARYWARE ENTERPRISE BACKEND
 * Google Apps Script Web App for Google Sheets & Google Drive
 * Version: 2.4.0 (Production)
 */

const CONFIG = {
  DRIVE_ROOT_FOLDER: "PIRAMAL_SANITARYWARE_ASSETS",
  PDF_QUOTATIONS_FOLDER: "QUOTATION_PDFS",
  PRODUCTS_FOLDER: "PRODUCT_CATALOG_IMAGES",
  FINISHES_FOLDER: "FINISH_SWATCHES",
  HANDLES_FOLDER: "HANDLE_TEXTURES"
};

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || 'ping';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let responseData = {};

    switch (action) {
      case 'ping':
        responseData = {
          status: 'success',
          message: 'FIMA Apps Script Backend is Live and Connected',
          spreadsheetName: ss.getName(),
          spreadsheetId: ss.getId(),
          timestamp: new Date().toISOString()
        };
        break;

      case 'getProducts':
        responseData = { status: 'success', data: getSheetDataAsJson(ss, 'PRODUCTS') };
        break;

      case 'getFinishes':
        responseData = { status: 'success', data: getSheetDataAsJson(ss, 'FINISHES') };
        break;

      case 'getHandles':
        responseData = { status: 'success', data: getSheetDataAsJson(ss, 'HANDLES') };
        break;

      case 'getCombinations':
        responseData = { status: 'success', data: getSheetDataAsJson(ss, 'COMBINATIONS') };
        break;

      case 'getCustomers':
        responseData = { status: 'success', data: getSheetDataAsJson(ss, 'CUSTOMERS') };
        break;

      case 'getQuotations':
        responseData = { status: 'success', data: getSheetDataAsJson(ss, 'QUOTATIONS') };
        break;

      case 'getCompanySettings':
        const settingsArr = getSheetDataAsJson(ss, 'SETTINGS');
        responseData = { status: 'success', data: settingsArr[0] || null };
        break;

      case 'saveQuotation':
        responseData = handleSaveQuotation(ss, payload.data);
        break;

      case 'uploadFile':
        responseData = handleDriveUpload(payload);
        break;

      case 'generatePdf':
        responseData = handleGeneratePdf(payload);
        break;

      case 'initializeSheets':
        responseData = initializeAllSheets(ss);
        break;

      default:
        responseData = { status: 'error', message: 'Unknown action: ' + action };
    }

    output.setContent(JSON.stringify(responseData));
  } catch (err) {
    output.setContent(JSON.stringify({
      status: 'error',
      message: err.toString(),
      stack: err.stack
    }));
  }

  return output;
}

function getSheetDataAsJson(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    return [];
  }
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch(e) {}
      }
      obj[h] = val;
    });
    return obj;
  });
}

function handleSaveQuotation(ss, quoteData) {
  let sheet = ss.getSheetByName('QUOTATIONS');
  if (!sheet) {
    initializeAllSheets(ss);
    sheet = ss.getSheetByName('QUOTATIONS');
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
  const data = sheet.getDataRange().getValues();

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === quoteData.quotation_id || data[i][1] === quoteData.quotation_number) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowValues = headers.map(h => {
    let val = quoteData[h];
    if (typeof val === 'object') return JSON.stringify(val);
    return val !== undefined ? val : '';
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { status: 'success', message: 'Quotation synchronized to Google Sheets' };
}

function handleDriveUpload(payload) {
  const folderName = payload.folderName || CONFIG.PRODUCTS_FOLDER;
  const base64Data = payload.base64Data;
  const fileName = payload.fileName || 'upload_' + new Date().getTime() + '.png';
  const mimeType = payload.mimeType || 'image/png';

  const decoded = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decoded, mimeType, fileName);

  const rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER);
  let rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER);

  const subFolders = rootFolder.getFoldersByName(folderName);
  let targetFolder = subFolders.hasNext() ? subFolders.next() : rootFolder.createFolder(folderName);

  const file = targetFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    status: 'success',
    fileId: file.getId(),
    fileName: file.getName(),
    fileUrl: "https://lh3.googleusercontent.com/d/" + file.getId()
  };
}

function handleGeneratePdf(payload) {
  const htmlContent = payload.htmlContent;
  const fileName = payload.fileName || "Quotation_" + new Date().getTime() + ".pdf";

  const blob = Utilities.newBlob(htmlContent, "text/html", "quote.html");
  const pdfBlob = blob.getAs("application/pdf").setName(fileName);

  const rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER);
  let rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER);

  const pdfFolders = rootFolder.getFoldersByName(CONFIG.PDF_QUOTATIONS_FOLDER);
  let targetFolder = pdfFolders.hasNext() ? pdfFolders.next() : rootFolder.createFolder(CONFIG.PDF_QUOTATIONS_FOLDER);

  const pdfFile = targetFolder.createFile(pdfBlob);
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    status: 'success',
    pdfUrl: pdfFile.getUrl(),
    downloadUrl: pdfFile.getDownloadUrl(),
    fileId: pdfFile.getId()
  };
}

function initializeAllSheets(ss) {
  const schema = {
    PRODUCTS: ['product_id', 'model_number', 'product_name', 'category', 'description', 'base_price', 'unit', 'hsn_code', 'gst_percentage', 'main_image_url', 'has_customization', 'status'],
    FINISHES: ['finish_id', 'finish_name', 'finish_code', 'finish_type', 'color_hex', 'texture_css', 'additional_price', 'status'],
    HANDLES: ['handle_id', 'handle_name', 'handle_model', 'material', 'texture_image_url', 'preview_image_url', 'additional_price', 'status'],
    COMBINATIONS: ['combination_id', 'product_id', 'finish_id', 'handle_id', 'combination_image_url', 'additional_price', 'status'],
    CUSTOMERS: ['customer_id', 'party_name', 'company_name', 'contact_person', 'mobile', 'email', 'billing_address', 'shipping_address', 'gstin', 'city', 'state', 'status'],
    QUOTATIONS: ['quotation_id', 'quotation_number', 'revision_number', 'date', 'customer_id', 'customer_snapshot', 'items', 'subtotal', 'overall_discount_percent', 'overall_discount_amount', 'taxable_amount', 'cgst_amount', 'sgst_amount', 'igst_amount', 'grand_total', 'amount_in_words', 'status', 'validity', 'payment_terms', 'delivery_terms', 'pdf_url', 'created_by_user_id', 'created_by_name', 'created_at', 'updated_at'],
    SETTINGS: ['company_name', 'tagline', 'address', 'phone', 'email', 'gstin', 'pan', 'bank_name', 'account_number', 'ifsc', 'branch', 'quotation_prefix', 'financial_year', 'default_gst', 'default_validity', 'default_payment_terms', 'default_delivery_terms', 'authorized_signatory', 'terms_conditions']
  };

  Object.keys(schema).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const headers = schema[sheetName];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#262626').setFontColor('#F59E0B');
  });

  return { status: 'success', message: 'All Google Sheets tab schemas initialized with headers.' };
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    success('Script Copied', 'Google Apps Script code copied to clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([appsScriptCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FIMA_GoogleAppsScript_Backend.js';
    a.click();
    URL.revokeObjectURL(url);
    success('Downloaded', 'Script file saved to your downloads.');
  };

  const handleTestConnection = async () => {
    if (!testingUrl) {
      error('URL Required', 'Please enter your Google Apps Script Web App URL.');
      return;
    }

    try {
      setTestStatus('TESTING');
      setTestResult(null);

      // Save into storage for live mode testing
      api.setAppsScriptUrl(testingUrl);

      const res = await api.testBackendConnection(testingUrl);
      setTestResult(res);
      setTestStatus('SUCCESS');
      success('Connection Verified', 'Connected to Google Sheets & Drive backend successfully!');
    } catch (err: any) {
      setTestStatus('ERROR');
      setTestResult({ error: err.message });
      error('Connection Failed', err.message || 'Make sure Web App is deployed as Anyone.');
    }
  };

  const handleInitializeSheets = async () => {
    try {
      setTestStatus('TESTING');
      const res = await api.initializeRemoteSheets();
      success('Sheets Initialized', res.message || 'Headers and tabs configured.');
      setTestStatus('SUCCESS');
    } catch (err: any) {
      error('Init Failed', err.message);
      setTestStatus('ERROR');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
              Enterprise Google Cloud Integration
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950 mt-1">
            Google Sheets & Drive Backend Setup Assistant
          </h1>
          <p className="text-xs text-neutral-500">
            Deploy the serverless Google Apps Script code to use Google Sheets as your database and Google Drive for asset/PDF storage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCode}
            className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .js</span>
          </button>
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-red-300 hover:text-red-200 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-red-400" />}
            <span>{copied ? 'Copied!' : 'Copy Script Code'}</span>
          </button>
        </div>
      </div>

      {/* Live Connection Configuration Card */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
          <Server className="w-4 h-4 text-red-600" />
          Live Google Apps Script Web App Endpoint
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testingUrl}
            onChange={e => setTestingUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
            className="flex-1 p-3 rounded-xl border border-neutral-300 font-mono text-xs focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'TESTING'}
            className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 text-red-400 ${testStatus === 'TESTING' ? 'animate-bounce' : ''}`} />
            <span>{testStatus === 'TESTING' ? 'Testing...' : 'Test & Save Endpoint'}</span>
          </button>
        </div>

        {testStatus === 'SUCCESS' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Connected to Production Google Sheets & Drive!
            </div>
            <p>
              Spreadsheet Name: <strong>{testResult?.spreadsheetName || 'Connected'}</strong>
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={handleInitializeSheets}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                Initialize All Sheet Tabs & Headers
              </button>
            </div>
          </div>
        )}

        {testStatus === 'ERROR' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
            <div className="font-bold">Connection Check Failed</div>
            <p className="font-mono text-[11px]">{testResult?.error}</p>
            <p className="text-neutral-600 pt-1">
              Hint: Verify you deployed the Apps Script as a <strong>Web App</strong> with access set to <strong>"Anyone"</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Step-by-Step Deployment Instructions */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
          Step-by-Step 3-Minute Deployment Guide
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="w-7 h-7 rounded-full bg-neutral-900 text-red-300 font-bold flex items-center justify-center font-mono">
              1
            </div>
            <h4 className="font-bold text-sm text-neutral-950 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Create Google Sheet
            </h4>
            <p className="text-neutral-600 leading-relaxed">
              Create a new blank Google Spreadsheet in your Google Drive (e.g. named <code>FIMA Quotation Database</code>).
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Open <strong>Extensions</strong> → <strong>Apps Script</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="w-7 h-7 rounded-full bg-neutral-900 text-red-300 font-bold flex items-center justify-center font-mono">
              2
            </div>
            <h4 className="font-bold text-sm text-neutral-950 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-red-600" /> Paste Code & Save
            </h4>
            <p className="text-neutral-600 leading-relaxed">
              Replace any default code in <code>Code.gs</code> by pasting the complete script below.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Click the <strong>Save</strong> (floppy disk) icon.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="w-7 h-7 rounded-full bg-neutral-900 text-red-300 font-bold flex items-center justify-center font-mono">
              3
            </div>
            <h4 className="font-bold text-sm text-neutral-950 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-600" /> Deploy as Web App
            </h4>
            <p className="text-neutral-600 leading-relaxed">
              Click <strong>Deploy</strong> → <strong>New Deployment</strong>.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Select <strong>Web app</strong>, set <em>Execute as: Me</em>, and <em>Who has access: <strong>Anyone</strong></em>.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Copy the resulting <code>/exec</code> URL and paste it into the test box above.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white text-xs font-mono">
            <Code2 className="w-4 h-4 text-red-400" />
            <span>Code.gs (Complete Backend Implementation)</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-red-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-6 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
          {appsScriptCode}
        </pre>
      </div>
    </div>
  );
};

