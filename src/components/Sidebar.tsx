import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Sliders,
  FileText,
  Clock,
  Users,
  DollarSign,
  Building2,
  ShieldCheck,
  Activity,
  Settings,
  HardDriveDownload,
  Boxes,
  Palette,
  Database,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabase';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  isOpenMobile,
  onCloseMobile
}) => {
  const { isSuperAdmin, isAdmin, isSales, canViewAuditLogs, canEditSettings } = useAuth();
  const isMobileOpen = isOpen !== undefined ? isOpen : (isOpenMobile || false);
  const handleClose = onClose || onCloseMobile || (() => {});
  const isSupabaseConfigured = supabaseService.isConfigured();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true }
      ]
    },
    {
      title: 'PRODUCT MANAGEMENT',
      items: [
        { id: 'products', label: 'Products Master', icon: Package, visible: true },
        { id: 'product-assets', label: 'Product Assets', icon: Layers, visible: true },
        { id: 'finishes', label: 'Finish Master', icon: Palette, visible: true },
        { id: 'handles', label: 'Handle / Knob Master', icon: Sliders, visible: true },
        { id: 'combinations', label: 'Combination Master', icon: Boxes, visible: true }
      ]
    },
    {
      title: 'SALES & QUOTATIONS',
      items: [
        { id: 'new-quotation', label: 'New Quotation', icon: Sparkles, visible: isSales },
        { id: 'quotations', label: 'Quotation History', icon: Clock, visible: true },
        { id: 'customers', label: 'Customers Master', icon: Users, visible: true }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'price-matrix', label: 'Price Management', icon: DollarSign, visible: isAdmin },
        { id: 'company-settings', label: 'Company Settings', icon: Building2, visible: canEditSettings },
        { id: 'user-management', label: 'Users & Roles', icon: ShieldCheck, visible: isSuperAdmin }
      ]
    },
    {
      title: 'DATABASE & INTEGRATION',
      items: [
        { id: 'supabase', label: 'Supabase Database', icon: Database, visible: true, badge: isSupabaseConfigured ? 'Live' : 'Connect' },
        { id: 'activity-logs', label: 'Activity Logs', icon: Activity, visible: canViewAuditLogs },
        { id: 'google-script', label: 'Google Apps Script API', icon: Settings, visible: true },
        { id: 'backup-export', label: 'Backup & Export', icon: HardDriveDownload, visible: isAdmin }
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    handleClose();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-200 w-64 border-r border-neutral-800 select-none">
      {/* Sidebar Header for Mobile / Branding */}
      <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
            K
          </div>
          <div>
            <div className="font-serif-luxury font-bold text-sm tracking-wider text-white">
              KOHLER INDIA
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono tracking-tight uppercase">
              B2B Configurator
            </div>
          </div>
        </div>
        {isMobileOpen && (
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(i => i.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                {section.title}
              </div>
              <div className="space-y-0.5 pt-1">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      id={`nav-link-${item.id}`}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-xs'
                          : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {(item as any).badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wider ${
                            (item as any).badge === 'Live'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/50 text-[11px] text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Ready'}
          </span>
          <span className="font-mono text-[10px] text-neutral-500">v2.5.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
          />
          <div className="relative flex-1 max-w-xs w-full bg-neutral-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
