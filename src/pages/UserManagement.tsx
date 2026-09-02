import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  Lock,
  Mail,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

export const UserManagement: React.FC = () => {
  const { isSuperAdmin, currentUser } = useAuth();
  const { success, error, warning } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'SALES',
    status: 'ACTIVE'
  });

  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      error('Failed to load users', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'SALES',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormData(u);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      warning('Validation Error', 'Name and Email are required.');
      return;
    }

    try {
      if (editingUser) {
        await api.updateUser(editingUser.user_id, formData);
        success('User Updated', `${formData.name} permissions updated.`);
      } else {
        await api.createUser(formData);
        success('User Created', `${formData.name} added to users directory.`);
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      error('Save Failed', err.message);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.user_id === currentUser.user_id) {
      warning('Forbidden', 'You cannot delete your own active session account.');
      return;
    }

    try {
      await api.deleteUser(userToDelete.user_id);
      success('User Removed', `${userToDelete.name} deleted.`);
      loadUsers();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setUserToDelete(null);
    }
  };

  const roleColors: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-amber-100 text-amber-900 border-amber-300',
    ADMIN: 'bg-blue-100 text-blue-900 border-blue-300',
    SALES: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    VIEWER: 'bg-neutral-100 text-neutral-800 border-neutral-300'
  };

  const filtered = users.filter(
    u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-950">
            User Access & Role-Based Permissions (RBAC)
          </h1>
          <p className="text-xs text-neutral-500">
            Manage sales representatives, commercial managers, and administrative governance
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            id="btn-add-user"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New User</span>
          </button>
        )}
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
          Role Permission Privilege Matrix
        </h3>

        <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-600 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">Role Level</th>
                <th className="p-3 text-center">Configure & Create Quotes</th>
                <th className="p-3 text-center">Manage Products & Finishes</th>
                <th className="p-3 text-center">Company Settings</th>
                <th className="p-3 text-center">Permanent Deletions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="p-3 font-bold text-amber-900">SUPER ADMIN</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Authorized</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-900">ADMIN</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-rose-500 font-bold">✗ Restricted</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-900">SALES EXECUTIVE</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-neutral-400">Read Only</td>
                <td className="p-3 text-center text-rose-500 font-bold">✗ Restricted</td>
                <td className="p-3 text-center text-rose-500 font-bold">✗ Restricted</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-neutral-700">VIEWER</td>
                <td className="p-3 text-center text-neutral-400">Read Only</td>
                <td className="p-3 text-center text-neutral-400">Read Only</td>
                <td className="p-3 text-center text-rose-500 font-bold">✗ Restricted</td>
                <td className="p-3 text-center text-rose-500 font-bold">✗ Restricted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-900 text-white uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(u => (
                <tr key={u.user_id} className="hover:bg-neutral-50/60">
                  <td className="p-4 font-bold text-neutral-950 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-amber-300 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div>{u.name}</div>
                      {u.user_id === currentUser.user_id && (
                        <span className="text-[10px] text-emerald-600 font-bold">You (Active Session)</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-neutral-600 font-mono text-[11px]">{u.email}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleColors[u.role]}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {u.user_id !== currentUser.user_id && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? 'Edit User Credentials & Role' : 'Add New System User'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  System Role
                </label>
                <select
                  value={formData.role || 'SALES'}
                  onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN (Full Permissions + Delete)</option>
                  <option value="ADMIN">ADMIN (Catalog & Settings Manager)</option>
                  <option value="SALES">SALES EXECUTIVE (Create Quotations & Clients)</option>
                  <option value="VIEWER">VIEWER (Read Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'ACTIVE'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {userToDelete && (
        <ConfirmModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete.name} (${userToDelete.email})?`}
          confirmText="Delete User"
          isDanger
        />
      )}
    </div>
  );
};
