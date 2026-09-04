import React, { useState } from 'react';
import {
  Sparkles,
  Database,
  ChevronDown,
  PlusCircle,
  Menu,
  ShieldCheck,
  Server,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabase';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentPage?: string;
  onNavigate: (page: string) => void;
  onToggleSidebar?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onToggleSidebar,
  onOpenMobileMenu
}) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleOpenMobile = onToggleSidebar || onOpenMobileMenu || (() => {});
  const isSupabaseConfigured = supabaseService.isConfigured();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onNavigate('dashboard')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <img 
                src="/fima-logo.png" 
                alt="FIMA Carlo Frattini" 
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 dark:brightness-110" 
              />
            </div>
          </div>

          {/* Center / Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              id="btn-theme-toggle"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-neutral-700" />
                  <span className="hidden md:inline text-neutral-700">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-amber-300">Light</span>
                </>
              )}
            </button>

            {/* Quick Action: New Quotation */}
            <button
              onClick={() => onNavigate('new-quotation')}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shadow-red-600/20"
              id="btn-quick-new-quotation"
            >
              <PlusCircle className="w-4 h-4 text-red-200" />
              <span className="hidden md:inline">New Quotation</span>
              <span className="md:hidden">Quote</span>
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 transition-all text-xs font-medium text-neutral-800 dark:text-neutral-100 cursor-pointer"
                id="btn-user-profile-menu"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-700 text-red-400 dark:text-red-300 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-neutral-900 dark:text-white leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-red-700 dark:text-red-400 font-bold uppercase mt-0.5">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{currentUser.email}</div>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 font-bold text-[10px] border border-red-200 dark:border-red-800/50">
                        <ShieldCheck className="w-3 h-3 text-red-700 dark:text-red-400" />
                        Role: {currentUser.role}
                      </div>
                    </div>

                    <div className="px-2 py-1">
                      <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 py-1">
                        Switch Role / User
                      </div>
                      {allUsers.map(user => (
                        <button
                          key={user.user_id}
                          onClick={() => {
                            switchUser(user.user_id);
                            setShowUserMenu(false);
                            success('User Switched', `Logged in as ${user.name} (${user.role})`);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            user.user_id === currentUser.user_id
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300 font-semibold'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <div>
                            <div>{user.name}</div>
                            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{user.role}</div>
                          </div>
                          {user.user_id === currentUser.user_id && (
                            <span className="w-2 h-2 rounded-full bg-red-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


