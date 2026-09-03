import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { TopMenu } from './components/TopMenu';

// Pages
import { Dashboard } from './pages/Dashboard';
import { NewQuotation } from './pages/NewQuotation';
import { QuotationHistory } from './pages/QuotationHistory';
import { Products } from './pages/Products';
import { FinishMaster } from './pages/FinishMaster';
import { HandleMaster } from './pages/HandleMaster';
import { CombinationMaster } from './pages/CombinationMaster';
import { Customers } from './pages/Customers';
import { PriceManagement } from './pages/PriceManagement';
import { CompanySettingsPage } from './pages/CompanySettingsPage';
import { UserManagement } from './pages/UserManagement';
import { ActivityLogs } from './pages/ActivityLogs';
import { GoogleAppsScriptSetup } from './pages/GoogleAppsScriptSetup';
import { SupabaseSetup } from './pages/SupabaseSetup';
import { BackupExport } from './pages/BackupExport';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | undefined>(undefined);

  const handleNavigate = (page: string, editId?: string) => {
    setEditingQuotationId(editId);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut: Ctrl+N or Cmd+N to open New Quotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNavigate('new-quotation');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'new-quotation':
        return <NewQuotation onNavigate={handleNavigate} editQuotationId={editingQuotationId} />;
      case 'quotations':
        return <QuotationHistory onNavigate={handleNavigate} />;
      case 'products':
        return <Products />;
      case 'finishes':
        return <FinishMaster />;
      case 'handles':
        return <HandleMaster />;
      case 'combinations':
        return <CombinationMaster />;
      case 'customers':
        return <Customers onNavigate={handleNavigate} />;
      case 'company-settings':
        return <CompanySettingsPage />;
      case 'user-management':
        return <UserManagement />;
      case 'activity-logs':
        return <ActivityLogs />;
      case 'supabase':
      case 'supabase-setup':
        return <SupabaseSetup />;
      case 'google-script':
      case 'api-settings':
        return <GoogleAppsScriptSetup />;
      case 'backup-export':
        return <BackupExport />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900/5 flex flex-col font-sans text-neutral-900 selection:bg-red-500 selection:text-neutral-950">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onNavigate={handleNavigate}
      />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopMenu
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          <div key={currentPage} className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-both">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

