import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Shield,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ActivityLog } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ActivityLogs: React.FC = () => {
  const { error } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getActivityLogs();
      setLogs(data);
    } catch (err: any) {
      error('Failed to load logs', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const actionTypes = [
    'ALL',
    'CREATE_QUOTATION',
    'UPDATE_QUOTATION',
    'DELETE_QUOTATION',
    'UPDATE_STATUS',
    'GENERATE_PDF',
    'SHARE_QUOTATION',
    'UPDATE_PRODUCT',
    'SYSTEM_INIT'
  ];

  const filtered = logs.filter(l => {
    const matchesSearch =
      l.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entity_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-neutral-900 dark:text-white">
            System Security & Audit Activity Logs
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Immutable log trail of quotations created, edits, PDF generations, and catalog updates
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by user email, quote number, or event details..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {actionTypes.map(act => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                actionFilter === act
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {act.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase font-mono bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Entity Ref</th>
                <th className="p-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map(log => (
                <tr key={log.log_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors">
                  <td className="p-4 text-neutral-600 dark:text-neutral-400 font-mono text-[11px] whitespace-nowrap flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="p-4 font-semibold text-neutral-900 dark:text-white font-mono text-[11px]">
                    {log.user_email}
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white text-[11px]">
                    {log.entity_id || '-'}
                  </td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                    No activity logs match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

