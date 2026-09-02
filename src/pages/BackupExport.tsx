import React, { useState } from 'react';
import {
  Download,
  Database,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Package,
  Layers,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const BackupExport: React.FC = () => {
  const { success, error } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportJson = async () => {
    try {
      setExporting(true);
      const [products, finishes, handles, combinations, customers, quotations, settings, logs] = await Promise.all([
        api.getProducts(),
        api.getFinishes(),
        api.getHandles(),
        api.getCombinations(),
        api.getCustomers(),
        api.getQuotations(),
        api.getCompanySettings(),
        api.getActivityLogs()
      ]);

      const fullBackup = {
        app: 'FIMA India Luxury Sanitaryware Smart Configurator & Quotation Management',
        version: '2.4.0',
        exportedAt: new Date().toISOString(),
        database: {
          products,
          finishes,
          handles,
          combinations,
          customers,
          quotations,
          companySettings: settings,
          activityLogs: logs
        }
      };

      const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIMA_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      success('JSON Backup Exported', 'Complete database exported to JSON.');
    } catch (err: any) {
      error('Export Failed', err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = async (tableName: string) => {
    try {
      setExporting(true);
      let data: any[] = [];

      switch (tableName) {
        case 'QUOTATIONS':
          data = await api.getQuotations();
          break;
        case 'PRODUCTS':
          data = await api.getProducts();
          break;
        case 'FINISHES':
          data = await api.getFinishes();
          break;
        case 'HANDLES':
          data = await api.getHandles();
          break;
        case 'CUSTOMERS':
          data = await api.getCustomers();
          break;
      }

      if (data.length === 0) {
        error('No Data', `Table ${tableName} is empty.`);
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row =>
          headers
            .map(h => {
              let val = row[h];
              if (typeof val === 'object') val = JSON.stringify(val);
              return `"${String(val || '').replace(/"/g, '""')}"`;
            })
            .join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIMA_${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      success('CSV Exported', `Downloaded ${tableName} data spreadsheet.`);
    } catch (err: any) {
      error('Export Error', err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            Database Backup & Table Data Export
          </h1>
          <p className="text-xs text-neutral-500">
            Export complete enterprise database, quotations history, and catalogs to JSON or Excel/CSV formats
          </p>
        </div>
      </div>

      {/* Full JSON Backup */}
      <div className="bg-neutral-950 text-white rounded-3xl p-6 border border-neutral-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-base text-white font-serif-luxury">
              Full System Snapshot (JSON Format)
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Contains all Products, Architectural Finishes, Handles, Combinations, Quotations, Customers, and Company Settings in a structured dump.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          disabled={exporting}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-neutral-950 font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export Full JSON Dump</span>
        </button>
      </div>

      {/* Individual CSV Exports */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export Individual Tables to CSV / Excel
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          {[
            { id: 'QUOTATIONS', name: 'Quotations Master', icon: FileSpreadsheet, desc: 'All quotes, line items, and status' },
            { id: 'PRODUCTS', name: 'Products Catalog', icon: Package, desc: 'Base prices, HSN, and models' },
            { id: 'FINISHES', name: 'Finish Swatches', icon: Layers, desc: 'PVD coatings and extra prices' },
            { id: 'HANDLES', name: 'Handle Inserts', icon: Database, desc: 'Marble and wood knobs' },
            { id: 'CUSTOMERS', name: 'Customer Directory', icon: Users, desc: 'Parties, firms, and GSTIN numbers' }
          ].map(tbl => (
            <div
              key={tbl.id}
              className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex flex-col justify-between space-y-3 hover:border-neutral-300 transition-all"
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-neutral-900">
                  <tbl.icon className="w-4 h-4 text-red-600" />
                  {tbl.name}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">{tbl.desc}</p>
              </div>

              <button
                onClick={() => handleExportCsv(tbl.id)}
                disabled={exporting}
                className="w-full py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Download .CSV</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

