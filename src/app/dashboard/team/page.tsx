'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { TeamMember } from '@/types';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export default function TeamManagementPage() {
  const { team, addTeamMember, updateTeamMember, deleteTeamMember, canEdit, canDelete, isAdmin, user } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Student Researchers',
    designation: '',
    institution: 'Department of CSE, University of Chittagong',
    email: '',
    bio: '',
    image: '/team/miskat.jpg',
    scholarUrl: '',
    linkedinUrl: '',
    order: 1,
  });

  // Standard initial categories as requested
  const standardCategories = [
    'SPM Team',
    'Student Researchers',
    'Data Annotators',
    'Administrative Staff',
  ];

  // Dynamic Categories (User can type any custom category, standard ones are suggested)
  const dynamicCategories = [
    'All',
    ...Array.from(
      new Set([
        ...standardCategories,
        ...team.map((m) => m.category?.trim()).filter(Boolean) as string[],
      ])
    ),
  ];

  // Dynamic Designations
  const dynamicDesignations = [
    'All',
    ...Array.from(
      new Set(
        team
          .map((m) => (m.designation || m.role)?.trim())
          .filter(Boolean) as string[]
      )
    ),
  ];

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      category: 'Student Researchers',
      designation: '',
      institution: 'Dept. of CSE, University of Chittagong',
      email: '',
      bio: '',
      image: '/team/miskat.jpg',
      scholarUrl: '',
      linkedinUrl: '',
      order: team.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      category: member.category || 'Student Researchers',
      designation: member.designation || member.role || '',
      institution: member.institution,
      email: member.email,
      bio: member.bio,
      image: member.image || '/team/miskat.jpg',
      scholarUrl: member.scholarUrl || '',
      linkedinUrl: member.linkedinUrl || '',
      order: member.order,
    });
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      ...formData,
      category: formData.category.trim(),
      designation: formData.designation.trim(),
      role: formData.designation.trim(), // keep role in sync
    };

    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, payload);
      } else {
        await addTeamMember(payload);
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the team?`)) {
      deleteTeamMember(id);
    }
  };

  // Filtered members by category and search query
  const filteredTeam = team.filter((m) => {
    const memberCat = (m.category || '').toLowerCase();
    const memberDesig = (m.designation || m.role || '').toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' ||
      memberCat === selectedCategory.toLowerCase();

    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberDesig.includes(searchQuery.toLowerCase()) ||
      memberCat.includes(searchQuery.toLowerCase()) ||
      m.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header (Matching bdai-web Team header) ──────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">Team Directory</h1>
            <p className="text-sm text-gray-500">
              Category + Designation = Employee placement • Fully customizable
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* ── Dynamic Category Filter Bar (Customizable Categories) ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Dynamic Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0c2461] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, category, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#0c2461]"
          />
        </div>
      </div>

      {/* ── Team Grid (Matching bdai-web card design) ──────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
          <h2 className="font-bold text-[#0c2461] text-base">
            Personnel Roster ({filteredTeam.length} Members)
          </h2>
          <span className="text-xs text-gray-500">
            Category Filter: <strong className="text-[#0c2461]">{selectedCategory}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all relative group"
            >
              {/* Circular Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm relative bg-slate-100">
                <img
                  src={member.image || '/team/miskat.jpg'}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                {/* Category & Designation Badges */}
                <div className="flex items-center justify-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="inline-block text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 shadow-xs">
                    {member.category || 'General'}
                  </span>
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-white bg-[#0c2461] rounded px-2.5 py-0.5 shadow-xs">
                    {member.designation || member.role || 'Member'}
                  </span>
                </div>
                <p className="font-semibold text-[#0c2461] text-sm leading-snug">
                  {member.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{member.institution}</p>
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-xs text-[#0c2461]/70 hover:text-[#0c2461] hover:underline break-all block mt-0.5"
                  >
                    {member.email}
                  </a>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#0c2461] hover:bg-white border border-slate-200 transition-colors shadow-xs cursor-pointer"
                    title="Edit Designation & Info"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors shadow-xs cursor-pointer"
                    title="Remove Employee (Admin Only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {member.scholarUrl && (
                  <a
                    href={member.scholarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-white border border-slate-200 transition-colors shadow-xs"
                    title="Google Scholar"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTeam.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No team members found matching your search.</p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal (Customizable Category + Designation = Placement) ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Employee Details' : 'Add Employee'}
        subtitle="Category + Designation = Employee placement. Free text input with suggestions."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Input (Under which category he falls) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <label className="block text-xs font-semibold text-[#0c2461] flex items-center justify-between">
              <span>Category (Section Placement) *</span>
              <span className="text-[10px] text-blue-600 font-medium">Customizable Text Input</span>
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              list="category-suggestions"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="e.g. SPM Team, Student Researchers, Data Annotators, Administrative Staff, or custom..."
            />
            <datalist id="category-suggestions">
              {dynamicCategories
                .filter((c) => c !== 'All')
                .map((c) => (
                  <option key={c} value={c} />
                ))}
            </datalist>

            {/* Quick-choice chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-medium mr-1">Standard:</span>
              {standardCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    formData.category.trim().toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#0c2461] text-white border-[#0c2461] shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              <strong>Category + Designation = Placement:</strong> Category groups the employee under the corresponding section on the website. Type any custom category freely.
            </p>
          </div>

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
                placeholder="Prof. Dr. Rudra Pratap Deb Nath"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1 flex items-center justify-between">
                <span>Designation (Role Title) *</span>
                <span className="text-[10px] text-blue-600 font-normal">Fully Customizable</span>
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                list="designation-suggestions"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="e.g. SPM, Research Assistant, Data Annotator, AI Scientist..."
              />
              {/* Datalist suggestions from existing designations */}
              <datalist id="designation-suggestions">
                {dynamicDesignations
                  .filter((d) => d !== 'All')
                  .map((d) => (
                    <option key={d} value={d} />
                  ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Institution / Department
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="Dept. of CSE, University of Chittagong"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="user@cu.ac.bd"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Employee Photo (Cloudinary)"
                folder="bdai/team"
                helperText="Upload employee photo to Cloudinary CDN or specify image URL"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Google Scholar URL
              </label>
              <input
                type="url"
                value={formData.scholarUrl}
                onChange={(e) => setFormData({ ...formData, scholarUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="https://scholar.google.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Short Research Summary / Bio
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="Focus areas, methodologies, work package contribution..."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0c2461] hover:bg-[#0c2461]/90 text-white shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving
                ? 'Writing to Database...'
                : editingMember
                ? 'Save Changes'
                : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
