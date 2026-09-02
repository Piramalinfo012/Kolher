import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isSales: boolean;
  isViewer: boolean;
  canEditSettings: boolean;
  canManageProducts: boolean;
  canManageCustomers: boolean;
  canCreateQuotations: boolean;
  canDeleteRecords: boolean;
  canViewAuditLogs: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => api.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const refreshUsers = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users);
      const current = api.getCurrentUser();
      const updated = users.find(u => u.user_id === current.user_id) || current;
      setCurrentUser(updated);
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchUser = (userId: string) => {
    const found = allUsers.find(u => u.user_id === userId);
    if (found) {
      api.setCurrentUser(found);
      setCurrentUser(found);
    }
  };

  const role: UserRole = currentUser.role;

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isSales = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SALES';
  const isViewer = role === 'VIEWER';

  const canEditSettings = isSuperAdmin || role === 'ADMIN';
  const canManageProducts = isSuperAdmin || role === 'ADMIN';
  const canManageCustomers = isSuperAdmin || role === 'ADMIN' || role === 'SALES';
  const canCreateQuotations = isSuperAdmin || role === 'ADMIN' || role === 'SALES';
  const canDeleteRecords = isSuperAdmin;
  const canViewAuditLogs = isSuperAdmin || role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        isSuperAdmin,
        isAdmin,
        isSales,
        isViewer,
        canEditSettings,
        canManageProducts,
        canManageCustomers,
        canCreateQuotations,
        canDeleteRecords,
        canViewAuditLogs,
        refreshUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
