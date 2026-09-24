'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAdmin } from '@/lib/store';
import { AdminUser, UserRole } from '@/types';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  UserCheck,
  ShieldAlert,
  Shield,
  Building,
  Calendar,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

const ROLES: { label: string; value: UserRole | 'all' }[] = [
  { label: 'All Users', value: 'all' },
  { label: 'Admins', value: 'Admin' },
  { label: 'Moderators', value: 'Moderator' },
  { label: 'Members', value: 'Member' },
];

export default function UserManagementPage() {
  const {
    user,
    users,
    addUser,
    updateUser,
    deleteUser,
    switchUser,
    isAdmin,
    adminOnlyProvisioning,
    toggleAdminOnlyProvisioning,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member' as UserRole,
    avatar: '/team/miskat.jpg',
    department: 'Department of CSE, University of Chittagong',
    status: 'active' as 'active' | 'inactive',
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Member',
      avatar: '/team/miskat.jpg',
      department: 'Department of CSE, University of Chittagong',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (target: AdminUser) => {
    setEditingUser(target);
    setFormData({
      name: target.name,
      email: target.email,
      role: target.role,
      avatar: target.avatar,
      department: target.department,
      status: target.status,
    });
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await addUser(formData);
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      deleteUser(id);
    }
  };

  // Stats
  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const modCount = users.filter((u) => u.role === 'Moderator').length;
  const memCount = users.filter((u) => u.role === 'Member').length;

  // Filtered
  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">User Management</h1>
            <p className="text-sm text-gray-500">
              Role assignments and access control for Admins, Moderators, and Members
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium self-start sm:self-auto">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Admin Only: Add/Remove Users</span>
          </div>
        )}
      </div>

      {/* ── Policy Banner for Non-Admins ── */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-900">
              Restricted User Management ({user?.role} Mode)
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              By security policy, <strong>Only Admins</strong> can Add, Modify, or Remove an Admin, Moderator, or Member. You can use the &ldquo;Switch&rdquo; button to switch to an Admin account to test user creation and removal.
            </p>
          </div>
        </div>
      )}

      {/* ── Admin Option & Authority Policy ─────────────────────── */}
      <div className="bg-[#0c2461] text-white rounded-2xl p-5 shadow-sm border border-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">
                Administrative Authority &amp; Security Policy
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {adminOnlyProvisioning ? 'Option: Enforced' : 'Option: Relaxed'}
              </span>
            </div>
            <p className="text-xs text-blue-100/80 mt-1 leading-relaxed max-w-2xl">
              <strong>Strict Option:</strong> Only Admin can Add or Remove an <strong>Admin</strong>, <strong>Moderator</strong>, <strong>Member</strong>, and <strong>all kinds of employees</strong>. Moderators and Members have restricted permissions and cannot alter user accounts or employee rosters.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={toggleAdminOnlyProvisioning}
            className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/10 text-xs text-white transition-colors cursor-pointer"
            title="Toggle Admin-Only Security Option"
          >
            <span className="text-blue-200">Admin-Only Policy:</span>
            <span className={`font-bold ${adminOnlyProvisioning ? 'text-emerald-300' : 'text-amber-300'}`}>
              {adminOnlyProvisioning ? 'Enabled (Strict)' : 'Disabled'}
            </span>
          </button>
        )}
      </div>

      {/* ── Role Definition Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#0c2461] text-white shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#0c2461] text-sm">Admins</h3>
              <span className="text-xs font-mono font-bold text-[#0c2461] bg-slate-100 px-2 py-0.5 rounded-full">
                {adminCount} Users
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Full system authority. Manage user accounts, wipe settings, delete records, and oversee all BDAI operations.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-600 text-white shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-blue-600 text-sm">Moderators</h3>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {modCount} Users
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Operational publishing. Create and edit news, tender notices, research progress, and team profiles.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-slate-600 text-white shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">Members</h3>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                {memCount} Users
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Contributor access. View private project metrics, research assignments, and draft content with read permissions.
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter and Search Bar ──────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRole(r.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedRole === r.value
                  ? 'bg-[#0c2461] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#0c2461]"
          />
        </div>
      </div>

      {/* ── Users Table ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Affiliation / Dept</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const isCurrentUser = user?.id === u.id;
                const roleBadgeStyles = {
                  Admin: 'bg-[#0c2461] text-white',
                  Moderator: 'bg-blue-600 text-white',
                  Member: 'bg-slate-600 text-white',
                }[u.role];

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrentUser ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0">
                          <img
                            src={u.avatar || '/team/miskat.jpg'}
                            alt={u.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0c2461] text-xs sm:text-sm">
                              {u.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500 text-[11px] block">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-[10px] font-black uppercase tracking-widest rounded px-2.5 py-0.5 ${roleBadgeStyles}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
                      {u.department}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-500 font-mono text-[11px]">
                      {u.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Switch profile button for demo */}
                        {!isCurrentUser && (
                          <button
                            onClick={() => switchUser(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-[#0c2461] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title={`Switch session to ${u.name}`}
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Switch</span>
                          </button>
                        )}

                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0c2461] hover:bg-white border border-slate-200 transition-colors cursor-pointer"
                              title="Edit User Role (Admin Only)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!isCurrentUser && (
                              <button
                                onClick={() => handleDelete(u.id, u.name)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                                title="Delete User (Admin Only)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          !isCurrentUser && (
                            <span className="text-[10px] text-gray-400 italic">View Only</span>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No users found matching your search.</p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Credentials & Role' : 'Add New User'}
        subtitle="Configure access permissions for project staff or researchers"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="Dr. Abu Nowshed Chy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="name@cu.ac.bd"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Assigned Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              >
                <option value="Admin">Admin (Full Control - Only Admins can Add/Remove Users &amp; Employees)</option>
                <option value="Moderator">Moderator (Editorial - Manage news &amp; tenders, cannot add/remove users or employees)</option>
                <option value="Member">Member (Read-only Contributor)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <ImageUpload
                value={formData.avatar}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                label="User Avatar (Cloudinary)"
                folder="bdai/avatars"
                helperText="Upload profile avatar to Cloudinary CDN or specify image URL"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Department / Affiliation
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="Dept. of CSE, University of Chittagong"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0c2461] hover:bg-[#0c2461]/90 text-white shadow-sm disabled:opacity-50"
            >
              {isSaving
                ? 'Writing to Database...'
                : editingUser
                ? 'Save Changes'
                : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
