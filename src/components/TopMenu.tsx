import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopMenuProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const TopMenu: React.FC<TopMenuProps> = ({ currentPage, onNavigate }) => {
  const { isSuperAdmin, isAdmin, isSales, canViewAuditLogs, canEditSettings } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navSections = [
    {
      title: 'OVERVIEW',
      id: 'overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
        { id: 'quotation-history', label: 'Quotation History', icon: FileText, visible: true }
      ]
    },
    {
      title: 'PRODUCT MANAGEMENT',
      id: 'products',
      items: [
        { id: 'products', label: 'Products Master', icon: Package, visible: true },
        { id: 'finishes', label: 'Finish Master', icon: Palette, visible: true }
      ]
    },
    {
      title: 'MANAGEMENT',
      id: 'management',
      items: [
        { id: 'customers', label: 'Customer Master / Directory', icon: Users, visible: true },
        { id: 'company-settings', label: 'Company Settings', icon: Building2, visible: canEditSettings },
        { id: 'user-management', label: 'Users & Roles', icon: ShieldCheck, visible: isSuperAdmin }
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const isSectionActive = (section: any) => {
    return section.items.some((item: any) => item.id === currentPage);
  };

  return (
    <div className="bg-neutral-950 border-b border-neutral-800 shadow-md relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 h-12" ref={dropdownRef}>
          {navSections.map((section) => {
            const visibleItems = section.items.filter(i => i.visible);
            if (visibleItems.length === 0) return null;

            // If section only has 1 item (like Overview), render it as a direct link
            if (visibleItems.length === 1 && section.title === 'OVERVIEW') {
              const item = visibleItems[0];
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-red-600/10 text-red-400 border border-red-500/30' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            }

            // Otherwise, render a dropdown
            const sectionActive = isSectionActive(section);
            const isDropdownOpen = activeDropdown === section.id;

            return (
              <div key={section.id} className="relative">
                <button
                  onClick={() => setActiveDropdown(isDropdownOpen ? null : section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
                    sectionActive || isDropdownOpen
                      ? 'bg-neutral-800 text-white' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {section.title}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {visibleItems.map(item => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors text-left ${
                            isActive
                              ? 'bg-red-600/10 text-red-400 border-l-2 border-red-500'
                              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-l-2 border-transparent'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-neutral-500'}`} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex lg:hidden items-center justify-between h-12">
          <div className="text-xs font-bold text-neutral-400 tracking-wider">MENU</div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-neutral-950 border-b border-neutral-800 shadow-2xl animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
            {navSections.map((section, sIdx) => {
              const visibleItems = section.items.filter(i => i.visible);
              if (visibleItems.length === 0) return null;

              return (
                <div key={sIdx} className="space-y-2">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {visibleItems.map(item => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                            isActive
                              ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-400' : 'text-neutral-500'}`} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
