import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  Ban,
  SlidersHorizontal,
  Trash2,
  Shield,
  AlertCircle,
  RefreshCw,
  Building2,
  Stethoscope,
  MessageSquare
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';
import { AdminUser, SystemModuleKey } from '../types/admin';
import { AddUserPage } from './AddUserPage';
import { BlockUserModal } from '../components/modals/BlockUserModal';
import { EditUserModal } from '../components/modals/EditUserModal';

export const UserManagementPage: React.FC = () => {
  const { refreshTrigger, showToast } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: 'list' directory vs 'add' dedicated creation page
  const [viewMode, setViewMode] = useState<'list' | 'add'>('list');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');

  // Modals state (Actions on specific users)
  const [userToBlock, setUserToBlock] = useState<AdminUser | null>(null);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, [search, selectedRole, selectedStatus, selectedModule, refreshTrigger]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getUsers({
        search,
        role: selectedRole,
        status: selectedStatus,
        module: selectedModule
      });
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      showToast('Failed to load users from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (user: AdminUser) => {
    try {
      await adminApi.approveUser(user.id);
      showToast(`User ${user.full_name} has been approved and activated!`, 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve user', 'error');
    }
  };

  const handleUnblock = async (user: AdminUser) => {
    try {
      await adminApi.unblockUser(user.id);
      showToast(`User ${user.full_name} has been unblocked.`, 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to unblock user', 'error');
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${user.full_name}?`)) return;
    try {
      await adminApi.deleteUser(user.id);
      showToast(`User ${user.full_name} deleted.`, 'info');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // Metrics
  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === 'active' || u.is_active).length;
  const pendingCount = users.filter(u => u.status === 'pending_approval').length;
  const blockedCount = users.filter(u => u.status === 'blocked').length;

  // If adding a new user, render the dedicated full AddUserPage
  if (viewMode === 'add') {
    return (
      <AddUserPage
        onBack={() => setViewMode('list')}
        onUserCreated={() => {
          setViewMode('list');
          loadUsers();
        }}
      />
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* 1. Header Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <Users size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>User & Credential Governance</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage accounts, verify clinical credentials, assign module permissions, and enforce security policies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('add')}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* 2. Mini Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Loaded</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[10px] font-bold text-emerald-500 uppercase">Active Accounts</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[10px] font-bold text-amber-500 uppercase">Pending Approval</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700">
          <div className="text-[10px] font-bold text-rose-500 uppercase">Blocked Accounts</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{blockedCount}</div>
        </div>
      </div>

      {/* 3. Filter Ribbon */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or license #..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/70 dark:bg-charcoal-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="central">Central Access</option>
            <option value="home_health">Home Health Access</option>
            <option value="connect">Connect Access</option>
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="clinician">Clinicians</option>
            <option value="case_manager">Case Managers</option>
            <option value="qa_reviewer">QA Reviewers</option>
            <option value="intake_coordinator">Intake Coordinators</option>
            <option value="physician">Physicians</option>
            <option value="admin">Administrators</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* 4. Users Data Table */}
      <div className="rounded-2xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-850 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pearl-50/80 dark:bg-charcoal-800/80 border-b border-pearl-200 dark:border-charcoal-700 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="py-3 px-4">User Identity</th>
                <th className="py-3 px-4">Role & Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Module Permissions</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">License Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pearl-100 dark:divide-charcoal-750">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-rose-600 mb-2" />
                    <span>Loading users from database...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users size={28} className="mx-auto text-slate-300 mb-2" />
                    <span>No users found matching current filters.</span>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isBlocked = u.status === 'blocked';
                  const isPending = u.status === 'pending_approval';

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-pearl-50/60 dark:hover:bg-charcoal-800/40 transition ${
                        isBlocked ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Identity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            u.is_super_admin
                              ? 'bg-rose-600 text-white'
                              : isBlocked
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60'
                              : 'bg-pearl-200 dark:bg-charcoal-750 text-slate-700 dark:text-slate-300'
                          }`}>
                            {u.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {u.is_super_admin && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[9px] font-black uppercase">
                                  Super Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Title */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200 capitalize">
                          {u.role.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-slate-400">{u.title || 'Staff Member'}</div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {u.department || 'Clinical Operations'}
                      </td>

                      {/* Module Permissions */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {(u.module_access || []).map((m: SystemModuleKey) => (
                            <span
                              key={m}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                                m === 'central'
                                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50'
                                  : m === 'home_health'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                                  : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50'
                              }`}
                            >
                              {m === 'home_health' ? 'HH' : m}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                          u.status === 'active' || (!u.status && u.is_active)
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                            : u.status === 'pending_approval'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                            : u.status === 'blocked'
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                            : 'bg-slate-100 dark:bg-charcoal-750 text-slate-600 dark:text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'active' || (!u.status && u.is_active)
                              ? 'bg-emerald-500'
                              : u.status === 'pending_approval'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}></span>
                          <span>{u.status?.replace('_', ' ') || 'Active'}</span>
                        </span>
                        {isBlocked && u.blocked_reason && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5 max-w-[200px] truncate" title={u.blocked_reason}>
                            {u.blocked_reason}
                          </div>
                        )}
                      </td>

                      {/* License */}
                      <td className="py-3 px-4">
                        {u.license_number ? (
                          <div>
                            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{u.license_number}</div>
                            <div className={`text-[10px] font-bold ${
                              u.license_status === 'verified'
                                ? 'text-emerald-600'
                                : u.license_status === 'expired'
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }`}>
                              {u.license_status?.toUpperCase() || 'VERIFIED'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve (for pending) */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleApprove(u)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition cursor-pointer shadow-xs"
                              title="Approve User Account"
                            >
                              Approve
                            </button>
                          )}

                          {/* Block (for active) */}
                          {!isBlocked && !u.is_super_admin && (
                            <button
                              type="button"
                              onClick={() => setUserToBlock(u)}
                              className="p-1.5 rounded-lg border border-pearl-200 dark:border-charcoal-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
                              title="Block User for Policy Violation"
                            >
                              <Ban size={13} />
                            </button>
                          )}

                          {/* Unblock (for blocked) */}
                          {isBlocked && (
                            <button
                              type="button"
                              onClick={() => handleUnblock(u)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-[11px] transition cursor-pointer shadow-xs"
                              title="Unblock User Account"
                            >
                              Unblock
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setUserToEdit(u)}
                            className="p-1.5 rounded-lg border border-pearl-200 dark:border-charcoal-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                            title="Edit Permissions & Credentials"
                          >
                            <SlidersHorizontal size={13} />
                          </button>

                          {/* Delete */}
                          {!u.is_super_admin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-lg border border-pearl-200 dark:border-charcoal-700 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Permanently Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BlockUserModal
        user={userToBlock}
        isOpen={Boolean(userToBlock)}
        onClose={() => setUserToBlock(null)}
        onUserBlocked={loadUsers}
      />

      <EditUserModal
        user={userToEdit}
        isOpen={Boolean(userToEdit)}
        onClose={() => setUserToEdit(null)}
        onUserUpdated={loadUsers}
      />
    </div>
  );
};
