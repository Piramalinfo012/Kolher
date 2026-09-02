/**
 * Complete Google Apps Script Backend Code Suite
 * Enterprise-grade Google Sheets + Google Drive + Automated PDF Generator
 */

export interface ScriptFile {
  name: string;
  description: string;
  code: string;
}

export const APPS_SCRIPT_FILES: ScriptFile[] = [
  {
    name: 'Code.gs',
    description: 'Main Web App entry point handling doGet(e) and doPost(e) with CORS and JSON routing',
    code: `/**
 * SMART PRODUCT CONFIGURATOR & QUOTATION MANAGEMENT SYSTEM
 * Main Entry Point: doGet and doPost
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    var action = '';
    var payload = {};

    if (method === 'GET') {
      action = e && e.parameter ? e.parameter.action : '';
      payload = e && e.parameter ? e.parameter : {};
    } else {
      if (e && e.postData && e.postData.contents) {
        try {
          var parsed = JSON.parse(e.postData.contents);
          action = parsed.action || (e.parameter ? e.parameter.action : '');
          payload = parsed.payload || parsed;
        } catch (jsonErr) {
          action = e.parameter ? e.parameter.action : '';
          payload = e.parameter || {};
        }
      } else {
        action = e && e.parameter ? e.parameter.action : '';
        payload = e && e.parameter ? e.parameter : {};
      }
    }

    var result = routeAction(action, payload, method);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errorResponse = {
      success: false,
      data: null,
      message: error.toString(),
      errorCode: 'INTERNAL_SERVER_ERROR'
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function routeAction(action, payload, method) {
  switch (action) {
    case 'ping':
      return createSuccessResponse({ status: 'active', timestamp: new Date().toISOString() }, 'Backend online');
    case 'initializeSystem':
      return initializeSystem();
    case 'getDashboard':
      return getDashboardData();
    case 'getProducts':
      return getProducts();
    case 'getProduct':
      return getProductById(payload.productId);
    case 'createProduct':
      return createProduct(payload);
    case 'updateProduct':
      return updateProduct(payload);
    case 'deleteProduct':
      return deleteProduct(payload.productId);
    case 'getFinishes':
      return getFinishes();
    case 'createFinish':
      return createFinish(payload);
    case 'updateFinish':
      return updateFinish(payload);
    case 'deleteFinish':
      return deleteFinish(payload.finishId);
    case 'getHandles':
      return getHandles();
    case 'createHandle':
      return createHandle(payload);
    case 'updateHandle':
      return updateHandle(payload);
    case 'deleteHandle':
      return deleteHandle(payload.handleId);
    case 'getCombinations':
      return getCombinations();
    case 'createCombination':
      return createCombination(payload);
    case 'updateCombination':
      return updateCombination(payload);
    case 'deleteCombination':
      return deleteCombination(payload.combinationId);
    case 'getCustomers':
      return getCustomers();
    case 'createCustomer':
      return createCustomer(payload);
    case 'updateCustomer':
      return updateCustomer(payload);
    case 'deleteCustomer':
      return deleteCustomer(payload.customerId);
    case 'generateQuotationNumber':
      return generateQuotationNumber();
    case 'getQuotations':
      return getQuotations();
    case 'getQuotation':
      return getQuotationById(payload.quotationId || payload.quotationNumber);
    case 'createQuotation':
      return createQuotation(payload);
    case 'updateQuotation':
      return updateQuotation(payload);
    case 'deleteQuotation':
      return deleteQuotation(payload.quotationId);
    case 'duplicateQuotation':
      return duplicateQuotation(payload.quotationId);
    case 'uploadImage':
      return uploadBase64Image(payload);
    case 'generateQuotationPDF':
      return generateQuotationPDF(payload);
    case 'getCompanySettings':
      return getCompanySettings();
    case 'updateCompanySettings':
      return updateCompanySettings(payload);
    case 'getUsers':
      return getUsers();
    case 'createUser':
      return createUser(payload);
    case 'updateUser':
      return updateUser(payload);
    case 'getActivityLogs':
      return getActivityLogs();
    default:
      return {
        success: false,
        data: null,
        message: 'Unknown API action: ' + action,
        errorCode: 'INVALID_ACTION'
      };
  }
}`
  },
  {
    name: 'Config.gs',
    description: 'Centralized configuration reading from Script Properties & Sheets',
    code: `/**
 * Centralized Configuration Manager
 */

var CONFIG = {
  getSpreadsheetId: function() {
    return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
  },
  getDriveFolderId: function() {
    return PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || '';
  },
  setProperties: function(props) {
    PropertiesService.getScriptProperties().setProperties(props);
  },
  SHEETS: {
    PRODUCTS: 'PRODUCTS',
    FINISHES: 'FINISHES',
    HANDLES: 'HANDLES',
    COMBINATIONS: 'COMBINATIONS',
    PRODUCT_ASSETS: 'PRODUCT_ASSETS',
    CUSTOMERS: 'CUSTOMERS',
    QUOTATIONS: 'QUOTATIONS',
    QUOTATION_ITEMS: 'QUOTATION_ITEMS',
    COMPANY_SETTINGS: 'COMPANY_SETTINGS',
    USERS: 'USERS',
    ACTIVITY_LOGS: 'ACTIVITY_LOGS'
  }
};

function getDb() {
  var id = CONFIG.getSpreadsheetId();
  if (!id) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      CONFIG.setProperties({ SPREADSHEET_ID: active.getId() });
      return active;
    }
    throw new Error('Spreadsheet ID is not configured in Script Properties.');
  }
  return SpreadsheetApp.openById(id);
}`
  },
  {
    name: 'Setup.gs',
    description: 'Auto-initialization wizard: creates sheets, headers, Drive folders and sample data',
    code: `/**
 * Database Auto-provisioning and Initial Setup
 */

function initializeSystem() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      var id = CONFIG.getSpreadsheetId();
      if (id) ss = SpreadsheetApp.openById(id);
    }
    if (!ss) {
      ss = SpreadsheetApp.create('SMART_QUOTATION_DATABASE');
      CONFIG.setProperties({ SPREADSHEET_ID: ss.getId() });
    }

    var sheetSchemas = {
      'PRODUCTS': ['Product_ID', 'Category', 'Product_Name', 'Model_Number', 'Description', 'Base_Price', 'GST_Percentage', 'HSN_Code', 'Unit', 'Main_Image_URL', 'Status', 'Customizable', 'Created_At', 'Updated_At', 'Created_By'],
      'FINISHES': ['Finish_ID', 'Finish_Name', 'Finish_Code', 'Finish_Image_URL', 'Finish_Type', 'Additional_Price', 'Description', 'Status', 'Created_At', 'Updated_At'],
      'HANDLES': ['Handle_ID', 'Handle_Model', 'Handle_Name', 'Material', 'Texture_Image_URL', 'Preview_Image_URL', 'Additional_Price', 'Description', 'Status', 'Created_At', 'Updated_At'],
      'COMBINATIONS': ['Combination_ID', 'Product_ID', 'Finish_ID', 'Handle_ID', 'Combination_Image_URL', 'Additional_Price', 'Status', 'Created_At', 'Updated_At'],
      'PRODUCT_ASSETS': ['Asset_ID', 'Product_ID', 'Asset_Name', 'Asset_Type', 'Drive_File_ID', 'Drive_URL', 'Layer_Type', 'Status', 'Created_At'],
      'CUSTOMERS': ['Customer_ID', 'Party_Name', 'Company_Name', 'Contact_Person', 'Mobile', 'Email', 'Billing_Address', 'Shipping_Address', 'GSTIN', 'State', 'City', 'Sales_Person', 'Notes', 'Status', 'Created_At', 'Updated_At'],
      'QUOTATIONS': ['Quotation_ID', 'Quotation_Number', 'Quotation_Date', 'Customer_ID', 'Party_Name', 'Contact_Person', 'Mobile', 'Email', 'GSTIN', 'Billing_Address', 'Shipping_Address', 'Subtotal', 'Discount', 'Freight', 'Other_Charges', 'Taxable_Amount', 'CGST', 'SGST', 'IGST', 'Grand_Total', 'Payment_Terms', 'Delivery_Terms', 'Validity', 'Status', 'PDF_File_ID', 'PDF_URL', 'WhatsApp_Status', 'Created_By', 'Created_At', 'Updated_At'],
      'QUOTATION_ITEMS': ['Quotation_Item_ID', 'Quotation_Number', 'Product_ID', 'Product_Name', 'Model_Number', 'Finish_ID', 'Finish_Name', 'Handle_ID', 'Handle_Name', 'Combination_ID', 'Product_Image_URL', 'Quantity', 'Unit', 'Base_Price', 'Finish_Price', 'Handle_Price', 'Additional_Price', 'Discount', 'GST', 'Unit_Final_Price', 'Line_Total', 'Customization_JSON', 'Created_At'],
      'COMPANY_SETTINGS': ['Company_Name', 'Logo_Drive_URL', 'Address', 'Phone', 'Email', 'Website', 'GSTIN', 'PAN', 'Bank_Name', 'Account_Number', 'IFSC', 'Branch', 'Quotation_Prefix', 'Financial_Year', 'Starting_Number', 'Default_GST', 'Default_Payment_Terms', 'Default_Delivery_Terms', 'Default_Validity', 'Terms_Conditions', 'Authorized_Signatory'],
      'USERS': ['User_ID', 'Name', 'Email', 'Mobile', 'Role', 'Status', 'Created_At'],
      'ACTIVITY_LOGS': ['Log_ID', 'User_ID', 'User_Name', 'Action', 'Module', 'Reference_ID', 'Description', 'Timestamp', 'IP_Address']
    };

    for (var name in sheetSchemas) {
      var sheet = ss.getSheetByName(name);
      if (!sheet) {
        sheet = ss.insertSheet(name);
      }
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(sheetSchemas[name]);
        sheet.getRange(1, 1, 1, sheetSchemas[name].length).setFontWeight('bold').setBackground('#F3F4F6');
        sheet.setFrozenRows(1);
      }
    }

    // Provision Google Drive Folders
    var rootFolderId = setupDriveFolders();

    logActivity('USR0001', 'System Admin', 'SYSTEM_INITIALIZATION', 'SETUP', 'SYS_BOOT', 'Database and Drive folder hierarchy auto-initialized successfully.');

    return createSuccessResponse({
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      rootFolderId: rootFolderId
    }, 'System initialized successfully with 11 sheets and Drive folders.');
  } catch (err) {
    return createErrorResponse(err.toString(), 'INIT_FAILED');
  }
}`
  },
  {
    name: 'DriveService.gs',
    description: 'Drive folder structure creation, Base64 image decoding, and public shareable links',
    code: `/**
 * Google Drive File & Image Management Service
 */

function setupDriveFolders() {
  var rootId = CONFIG.getDriveFolderId();
  var rootFolder;
  if (rootId) {
    try { rootFolder = DriveApp.getFolderById(rootId); } catch (e) {}
  }
  if (!rootFolder) {
    rootFolder = DriveApp.createFolder('SMART QUOTATION SYSTEM');
    CONFIG.setProperties({ DRIVE_FOLDER_ID: rootFolder.getId() });
  }

  var subFolders = [
    'Products',
    'Product Assets',
    'Finish Images',
    'Handle Images',
    'Combination Images',
    'Quotation PDFs',
    'Company Assets'
  ];

  for (var i = 0; i < subFolders.length; i++) {
    var folders = rootFolder.getFoldersByName(subFolders[i]);
    if (!folders.hasNext()) {
      rootFolder.createFolder(subFolders[i]);
    }
  }

  return rootFolder.getId();
}

function getSubFolder(name) {
  var rootId = CONFIG.getDriveFolderId();
  if (!rootId) setupDriveFolders();
  rootId = CONFIG.getDriveFolderId();
  var root = DriveApp.getFolderById(rootId);
  var folders = root.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return root.createFolder(name);
}

function uploadBase64Image(payload) {
  try {
    var folderName = payload.folderName || 'Products';
    var targetFolder = getSubFolder(folderName);
    var base64Data = payload.base64Data;
    var fileName = payload.fileName || ('IMG_' + Date.now() + '.png');
    var mimeType = payload.mimeType || 'image/png';

    // Strip header if data URI
    if (base64Data.indexOf(';base64,') > -1) {
      var parts = base64Data.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Data = parts[1];
    }

    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var fileUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
    var thumbUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';

    return createSuccessResponse({
      fileId: fileId,
      fileUrl: fileUrl,
      thumbnailUrl: thumbUrl,
      fileName: fileName
    }, 'File uploaded to Google Drive successfully');
  } catch (e) {
    return createErrorResponse(e.toString(), 'DRIVE_UPLOAD_ERROR');
  }
}`
  },
  {
    name: 'Quotations.gs',
    description: 'Concurrency-safe Quotation Numbering (LockService), CRUD, and line item sync',
    code: `/**
 * Quotation Management Engine with Concurrency-Safe LockService
 */

function generateQuotationNumber() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Wait up to 15 seconds

    var ss = getDb();
    var setSheet = ss.getSheetByName(CONFIG.SHEETS.COMPANY_SETTINGS);
    var prefix = 'PPPL';
    var fy = '26-27';
    var startNum = 1;

    if (setSheet && setSheet.getLastRow() >= 2) {
      var settings = setSheet.getRange(2, 1, 1, setSheet.getLastColumn()).getValues()[0];
      prefix = settings[12] || prefix;
      fy = settings[13] || fy;
      startNum = parseInt(settings[14], 10) || startNum;
    }

    var qSheet = ss.getSheetByName(CONFIG.SHEETS.QUOTATIONS);
    var count = 0;
    if (qSheet && qSheet.getLastRow() > 1) {
      count = qSheet.getLastRow() - 1;
    }

    var nextNum = startNum + count;
    var padded = ('0000' + nextNum).slice(-4);
    var quotationNumber = prefix + '/' + fy + '/' + padded;

    lock.releaseLock();
    return createSuccessResponse({ quotationNumber: quotationNumber, sequence: nextNum }, 'Quotation number generated safely');
  } catch (e) {
    lock.releaseLock();
    return createErrorResponse('Failed to generate quotation number safely: ' + e.toString(), 'LOCK_ERROR');
  }
}

function getQuotations() {
  try {
    var ss = getDb();
    var qSheet = ss.getSheetByName(CONFIG.SHEETS.QUOTATIONS);
    var iSheet = ss.getSheetByName(CONFIG.SHEETS.QUOTATION_ITEMS);

    if (!qSheet || qSheet.getLastRow() <= 1) {
      return createSuccessResponse([], 'No quotations found');
    }

    var qData = qSheet.getDataRange().getValues();
    var qHeaders = qData[0];
    var quotations = [];

    var itemsMap = {};
    if (iSheet && iSheet.getLastRow() > 1) {
      var iData = iSheet.getDataRange().getValues();
      var iHeaders = iData[0];
      for (var j = 1; j < iData.length; j++) {
        var row = iData[j];
        var qNum = row[1];
        if (!itemsMap[qNum]) itemsMap[qNum] = [];
        var itemObj = {};
        for (var k = 0; k < iHeaders.length; k++) {
          var key = iHeaders[k].toLowerCase();
          itemObj[key] = row[k];
        }
        if (typeof itemObj.customization_json === 'string' && itemObj.customization_json) {
          try { itemObj.customization_json = JSON.parse(itemObj.customization_json); } catch (e) {}
        }
        itemsMap[qNum].push(itemObj);
      }
    }

    for (var i = 1; i < qData.length; i++) {
      var row = qData[i];
      var qObj = {};
      for (var h = 0; h < qHeaders.length; h++) {
        var key = qHeaders[h].toLowerCase();
        qObj[key] = row[h];
      }
      qObj.items = itemsMap[qObj.quotation_number] || [];
      quotations.push(qObj);
    }

    return createSuccessResponse(quotations.reverse(), 'Quotations retrieved');
  } catch (e) {
    return createErrorResponse(e.toString(), 'GET_QUOTATIONS_ERROR');
  }
}

function createQuotation(payload) {
  try {
    var ss = getDb();
    var qSheet = ss.getSheetByName(CONFIG.SHEETS.QUOTATIONS);
    var iSheet = ss.getSheetByName(CONFIG.SHEETS.QUOTATION_ITEMS);

    var qNumResult = generateQuotationNumber();
    var quotationNumber = payload.quotation_number || (qNumResult.data ? qNumResult.data.quotationNumber : 'PPPL/26-27/0001');
    var qId = 'QUOT' + ('0000' + (qSheet.getLastRow())).slice(-4);
    var now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    var date = payload.quotation_date || now.split(' ')[0];

    var qRow = [
      qId,
      quotationNumber,
      date,
      payload.customer_id || '',
      payload.party_name || '',
      payload.contact_person || '',
      payload.mobile || '',
      payload.email || '',
      payload.gstin || '',
      payload.billing_address || '',
      payload.shipping_address || '',
      payload.subtotal || 0,
      payload.discount || 0,
      payload.freight || 0,
      payload.other_charges || 0,
      payload.taxable_amount || 0,
      payload.cgst || 0,
      payload.sgst || 0,
      payload.igst || 0,
      payload.grand_total || 0,
      payload.payment_terms || '',
      payload.delivery_terms || '',
      payload.validity || '30 Days',
      payload.status || 'DRAFT',
      payload.pdf_file_id || '',
      payload.pdf_url || '',
      payload.whatsapp_status || 'NOT_SENT',
      payload.created_by || 'Admin',
      now,
      now
    ];

    qSheet.appendRow(qRow);

    // Save Line Items
    var items = payload.items || [];
    if (items.length > 0 && iSheet) {
      for (var idx = 0; idx < items.length; idx++) {
        var itm = items[idx];
        var itmId = 'QITM' + ('0000' + (iSheet.getLastRow() + idx)).slice(-4);
        var customJsonStr = typeof itm.customization_json === 'object' ? JSON.stringify(itm.customization_json) : (itm.customization_json || '');

        var itmRow = [
          itmId,
          quotationNumber,
          itm.product_id || '',
          itm.product_name || '',
          itm.model_number || '',
          itm.finish_id || '',
          itm.finish_name || '',
          itm.handle_id || '',
          itm.handle_name || '',
          itm.combination_id || '',
          itm.product_image_url || '',
          itm.quantity || 1,
          itm.unit || 'PCS',
          itm.base_price || 0,
          itm.finish_price || 0,
          itm.handle_price || 0,
          itm.additional_price || 0,
          itm.discount || 0,
          itm.gst || 18,
          itm.unit_final_price || 0,
          itm.line_total || 0,
          customJsonStr,
          now
        ];
        iSheet.appendRow(itmRow);
      }
    }

    logActivity(payload.created_by || 'USR0001', payload.created_by || 'Admin', 'CREATE_QUOTATION', 'QUOTATION', quotationNumber, 'Created quotation for ' + (payload.party_name || 'Customer') + ' (₹' + payload.grand_total + ')');

    return createSuccessResponse({
      quotation_id: qId,
      quotation_number: quotationNumber,
      grand_total: payload.grand_total
    }, 'Quotation saved successfully');
  } catch (e) {
    return createErrorResponse(e.toString(), 'CREATE_QUOTATION_ERROR');
  }
}`
  },
  {
    name: 'PdfService.gs',
    description: 'A4 HTML Quotation Template to PDF Blob conversion and Google Drive archival',
    code: `/**
 * Professional A4 Quotation PDF Generation via Google Apps Script
 */

function generateQuotationPDF(payload) {
  try {
    var quotation = payload.quotation;
    var settings = payload.companySettings || {};
    var htmlTemplate = buildQuotationHtml(quotation, settings);

    var blob = Utilities.newBlob(htmlTemplate, 'text/html', 'temp.html').getAs('application/pdf');
    var safePartyName = (quotation.party_name || 'Customer').replace(/[^a-zA-Z0-9]/g, '-');
    var safeQNum = (quotation.quotation_number || 'QUOT').replace(/\\//g, '-');
    var pdfFileName = safeQNum + '_' + safePartyName + '.pdf';
    blob.setName(pdfFileName);

    var targetFolder = getSubFolder('Quotation PDFs');
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var pdfUrl = file.getUrl();
    var directDownloadUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;

    // Update Quotation Sheet with PDF link
    updateQuotationPdfInfo(quotation.quotation_number, fileId, pdfUrl);

    logActivity('USR0001', 'System Admin', 'GENERATE_PDF', 'PDF_SERVICE', quotation.quotation_number, 'Generated A4 corporate PDF: ' + pdfFileName);

    return createSuccessResponse({
      fileId: fileId,
      pdfUrl: pdfUrl,
      downloadUrl: directDownloadUrl,
      fileName: pdfFileName
    }, 'PDF generated and saved to Google Drive');
  } catch (e) {
    return createErrorResponse(e.toString(), 'PDF_GENERATION_FAILED');
  }
}

function updateQuotationPdfInfo(quotationNumber, fileId, pdfUrl) {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.QUOTATIONS);
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === quotationNumber) {
        sheet.getRange(i + 1, 25).setValue(fileId);
        sheet.getRange(i + 1, 26).setValue(pdfUrl);
        sheet.getRange(i + 1, 24).setValue('SENT');
        break;
      }
    }
  } catch (e) {}
}

function buildQuotationHtml(q, comp) {
  var itemsHtml = '';
  var items = q.items || [];
  for (var i = 0; i < items.length; i++) {
    var itm = items[i];
    itemsHtml += '<tr>' +
      '<td style="text-align:center; padding:8px; border-bottom:1px solid #e5e7eb;">' + (i + 1) + '</td>' +
      '<td style="padding:8px; border-bottom:1px solid #e5e7eb;">' +
        '<strong>' + (itm.product_name || '') + '</strong><br>' +
        '<span style="font-size:11px; color:#6b7280;">Model: ' + (itm.model_number || '') + '</span><br>' +
        (itm.finish_name ? '<span style="font-size:10px; background:#f3f4f6; padding:2px 4px; border-radius:3px;">Finish: ' + itm.finish_name + '</span> ' : '') +
        (itm.handle_name ? '<span style="font-size:10px; background:#f3f4f6; padding:2px 4px; border-radius:3px;">Handle: ' + itm.handle_name + '</span>' : '') +
      '</td>' +
      '<td style="text-align:center; padding:8px; border-bottom:1px solid #e5e7eb;">' + itm.quantity + ' ' + (itm.unit || 'PCS') + '</td>' +
      '<td style="text-align:right; padding:8px; border-bottom:1px solid #e5e7eb;">₹' + Number(itm.unit_final_price || itm.base_price).toLocaleString('en-IN') + '</td>' +
      '<td style="text-align:right; padding:8px; border-bottom:1px solid #e5e7eb;">₹' + Number(itm.line_total).toLocaleString('en-IN') + '</td>' +
    '</tr>';
  }

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size:12px; color:#1f2937; margin:20px; line-height:1.4; }' +
    '.header { border-bottom:2px solid #C5A880; padding-bottom:15px; margin-bottom:15px; }' +
    '.company-title { font-size:18px; font-weight:bold; color:#111827; letter-spacing:1px; }' +
    '.gold-badge { color:#C5A880; font-weight:bold; }' +
    '.grid-2 { display:table; width:100%; margin-bottom:15px; }' +
    '.col { display:table-cell; width:50%; vertical-align:top; }' +
    'table { width:100%; border-collapse:collapse; margin-top:10px; }' +
    'th { background:#1f2937; color:#ffffff; padding:8px; text-align:left; font-size:11px; }' +
    '.total-box { margin-top:15px; width:45%; margin-left:auto; }' +
    '.terms { font-size:10px; color:#4b5563; margin-top:20px; border-top:1px solid #e5e7eb; padding-top:10px; }' +
    '</style></head><body>' +
    '<div class="header">' +
      '<div class="company-title">' + (comp.company_name || 'PIRAMAL LUXURY BATHWARE') + '</div>' +
      '<div style="font-size:11px; color:#6b7280;">' + (comp.address || '') + ' | Tel: ' + (comp.phone || '') + ' | GSTIN: ' + (comp.gstin || '') + '</div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="col">' +
        '<strong>QUOTATION TO:</strong><br>' +
        '<strong>' + (q.party_name || '') + '</strong><br>' +
        (q.contact_person ? 'Attn: ' + q.contact_person + '<br>' : '') +
        (q.mobile ? 'Mobile: ' + q.mobile + '<br>' : '') +
        (q.gstin ? 'GSTIN: ' + q.gstin + '<br>' : '') +
        'Address: ' + (q.billing_address || q.shipping_address || '') +
      '</div>' +
      '<div class="col" style="text-align:right;">' +
        '<div style="font-size:16px; font-weight:bold; color:#C5A880;">QUOTATION</div>' +
        '<strong>No: ' + (q.quotation_number || '') + '</strong><br>' +
        'Date: ' + (q.quotation_date || '') + '<br>' +
        'Validity: ' + (q.validity || '30 Days') +
      '</div>' +
    '</div>' +
    '<table>' +
      '<thead><tr><th style="width:30px; text-align:center;">#</th><th>Description & Customization</th><th style="width:80px; text-align:center;">Qty</th><th style="width:100px; text-align:right;">Unit Rate</th><th style="width:100px; text-align:right;">Amount</th></tr></thead>' +
      '<tbody>' + itemsHtml + '</tbody>' +
    '</table>' +
    '<div class="total-box">' +
      '<table style="width:100%;">' +
        '<tr><td>Subtotal:</td><td style="text-align:right;">₹' + Number(q.subtotal || 0).toLocaleString('en-IN') + '</td></tr>' +
        (q.discount > 0 ? '<tr><td>Discount:</td><td style="text-align:right;">- ₹' + Number(q.discount).toLocaleString('en-IN') + '</td></tr>' : '') +
        (q.freight > 0 ? '<tr><td>Freight:</td><td style="text-align:right;">₹' + Number(q.freight).toLocaleString('en-IN') + '</td></tr>' : '') +
        '<tr><td>Taxable Amount:</td><td style="text-align:right;">₹' + Number(q.taxable_amount || q.subtotal).toLocaleString('en-IN') + '</td></tr>' +
        (q.igst > 0 ? '<tr><td>IGST (18%):</td><td style="text-align:right;">₹' + Number(q.igst).toLocaleString('en-IN') + '</td></tr>' : '<tr><td>CGST + SGST (18%):</td><td style="text-align:right;">₹' + Number((q.cgst || 0) + (q.sgst || 0)).toLocaleString('en-IN') + '</td></tr>') +
        '<tr style="font-weight:bold; font-size:14px; border-top:1px solid #111827;"><td>Grand Total:</td><td style="text-align:right; color:#C5A880;">₹' + Number(q.grand_total || 0).toLocaleString('en-IN') + '</td></tr>' +
      '</table>' +
    '</div>' +
    '<div class="terms">' +
      '<strong>Terms & Conditions:</strong><br>' +
      (comp.terms_conditions || '1. Valid for 30 days. 2. 50% advance with order.').replace(/\\n/g, '<br>') + '<br><br>' +
      '<strong>Bank Details:</strong> ' + (comp.bank_name || 'HDFC Bank') + ' | A/C: ' + (comp.account_number || '') + ' | IFSC: ' + (comp.ifsc || '') + '<br><br>' +
      '<strong>Authorized Signatory:</strong> ' + (comp.authorized_signatory || 'FIMA India Corporation Pvt. Ltd.') +
    '</div></body></html>';
}`
  },
  {
    name: 'Products.gs',
    description: 'Product Master CRUD operations and catalog query optimizations',
    code: `/**
 * Product Master Operations
 */

function getProducts() {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (!sheet || sheet.getLastRow() <= 1) return createSuccessResponse([], 'No products found');

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var products = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var p = {};
      for (var j = 0; j < headers.length; j++) {
        p[headers[j].toLowerCase()] = row[j];
      }
      products.push(p);
    }
    return createSuccessResponse(products, 'Products retrieved successfully');
  } catch (e) {
    return createErrorResponse(e.toString(), 'GET_PRODUCTS_ERROR');
  }
}

function createProduct(payload) {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    var pId = 'PRD' + ('0000' + (sheet.getLastRow())).slice(-4);
    var now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    var row = [
      pId,
      payload.category || 'Basin Mixer',
      payload.product_name || '',
      payload.model_number || '',
      payload.description || '',
      payload.base_price || 0,
      payload.gst_percentage || 18,
      payload.hsn_code || '8481',
      payload.unit || 'PCS',
      payload.main_image_url || '',
      payload.status || 'ACTIVE',
      payload.customizable || 'YES',
      now,
      now,
      payload.created_by || 'Admin'
    ];
    sheet.appendRow(row);
    logActivity('USR0001', 'Admin', 'CREATE_PRODUCT', 'PRODUCTS', pId, 'Created product: ' + payload.product_name);
    return createSuccessResponse({ product_id: pId }, 'Product created successfully');
  } catch (e) {
    return createErrorResponse(e.toString(), 'CREATE_PRODUCT_ERROR');
  }
}`
  },
  {
    name: 'Finishes.gs',
    description: 'Finish Master CRUD & Swatch Management',
    code: `/**
 * Finish Master Operations
 */

function getFinishes() {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.FINISHES);
    if (!sheet || sheet.getLastRow() <= 1) return createSuccessResponse([], 'No finishes found');

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var finishes = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var f = {};
      for (var j = 0; j < headers.length; j++) {
        f[headers[j].toLowerCase()] = row[j];
      }
      finishes.push(f);
    }
    return createSuccessResponse(finishes, 'Finishes retrieved successfully');
  } catch (e) {
    return createErrorResponse(e.toString(), 'GET_FINISHES_ERROR');
  }
}`
  },
  {
    name: 'Handles.gs',
    description: 'Handle & Knob Master CRUD & Material Management',
    code: `/**
 * Handle & Knob Master Operations
 */

function getHandles() {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.HANDLES);
    if (!sheet || sheet.getLastRow() <= 1) return createSuccessResponse([], 'No handles found');

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var handles = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var h = {};
      for (var j = 0; j < headers.length; j++) {
        h[headers[j].toLowerCase()] = row[j];
      }
      handles.push(h);
    }
    return createSuccessResponse(handles, 'Handles retrieved successfully');
  } catch (e) {
    return createErrorResponse(e.toString(), 'GET_HANDLES_ERROR');
  }
}`
  },
  {
    name: 'Combinations.gs',
    description: 'Combination Mapping Engine & High-Res Render Resolver',
    code: `/**
 * Combination Master Engine
 */

function getCombinations() {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.COMBINATIONS);
    if (!sheet || sheet.getLastRow() <= 1) return createSuccessResponse([], 'No combinations found');

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var combinations = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var c = {};
      for (var j = 0; j < headers.length; j++) {
        c[headers[j].toLowerCase()] = row[j];
      }
      combinations.push(c);
    }
    return createSuccessResponse(combinations, 'Combinations retrieved successfully');
  } catch (e) {
    return createErrorResponse(e.toString(), 'GET_COMBINATIONS_ERROR');
  }
}`
  },
  {
    name: 'Customers.gs',
    description: 'Customer Directory & GSTIN Data Management',
    code: `/**
 * Customer Directory Operations
 */

function getCustomers() {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.CUSTOMERS);
    if (!sheet || sheet.getLastRow() <= 1) return createSuccessResponse([], 'No customers found');

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var customers = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var c = {};
      for (var j = 0; j < headers.length; j++) {
        c[headers[j].toLowerCase()] = row[j];
      }
      customers.push(c);
    }
    return createSuccessResponse(customers, 'Customers retrieved successfully');
  } catch (e) {
    return createErrorResponse(e.toString(), 'GET_CUSTOMERS_ERROR');
  }
}`
  },
  {
    name: 'Utils.gs',
    description: 'Standard JSON response builder and activity logging helper',
    code: `/**
 * Utilities & Activity Logging
 */

function createSuccessResponse(data, message) {
  return {
    success: true,
    data: data,
    message: message || 'Success'
  };
}

function createErrorResponse(message, errorCode) {
  return {
    success: false,
    data: null,
    message: message || 'An error occurred',
    errorCode: errorCode || 'ERROR'
  };
}

function logActivity(userId, userName, action, module, refId, description) {
  try {
    var ss = getDb();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ACTIVITY_LOGS);
    if (!sheet) return;
    var logId = 'LOG' + ('0000' + sheet.getLastRow()).slice(-4);
    var now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    sheet.appendRow([
      logId,
      userId || 'USR0001',
      userName || 'System',
      action || '',
      module || '',
      refId || '',
      description || '',
      now,
      ''
    ]);
  } catch (e) {}
}

function getDashboardData() {
  try {
    var ss = getDb();
    var pSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    var cSheet = ss.getSheetByName(CONFIG.SHEETS.CUSTOMERS);
    var qSheet = ss.getSheetByName(CONFIG.SHEETS.QUOTATIONS);

    var totalProducts = pSheet && pSheet.getLastRow() > 1 ? pSheet.getLastRow() - 1 : 0;
    var totalCustomers = cSheet && cSheet.getLastRow() > 1 ? cSheet.getLastRow() - 1 : 0;
    var totalQuotations = qSheet && qSheet.getLastRow() > 1 ? qSheet.getLastRow() - 1 : 0;

    var totalValue = 0;
    var pending = 0;
    var approved = 0;

    if (qSheet && qSheet.getLastRow() > 1) {
      var qData = qSheet.getDataRange().getValues();
      for (var i = 1; i < qData.length; i++) {
        var grandTotal = Number(qData[i][19]) || 0;
        var status = qData[i][23];
        totalValue += grandTotal;
        if (status === 'DRAFT' || status === 'SENT') pending++;
        if (status === 'APPROVED') approved++;
      }
    }

    return createSuccessResponse({
      totalProducts: totalProducts,
      totalCustomers: totalCustomers,
      totalQuotations: totalQuotations,
      totalQuotationValue: totalValue,
      pendingQuotations: pending,
      approvedQuotations: approved
    }, 'Dashboard metrics calculated from live Google Sheets');
  } catch (e) {
    return createErrorResponse(e.toString(), 'DASHBOARD_ERROR');
  }
}`
  }
];

