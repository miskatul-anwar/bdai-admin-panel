'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/lib/store';
import { Vacancy, VacancyStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export default function VacanciesPage() {
  const { vacancies, addVacancy, updateVacancy, deleteVacancy, canEdit, canDelete } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<VacancyStatus | 'all'>('all');

  // Dynamic Notice Types extracted from existing notices
  const dynamicTypes = useMemo(() => {
    const types = new Set<string>();
    vacancies.forEach((v) => {
      if (v.type && v.type.trim()) {
        types.add(v.type.trim());
      }
    });
    return ['All', ...Array.from(types)];
  }, [vacancies]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVac, setEditingVac] = useState<Vacancy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vacancy | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    department: 'Department of Computer Science and Engineering',
    workPackage: 'HEAT-13211-CU ATF Sub-Project',
    type: 'e-Tender Notice (OTM Goods)',
    location: 'University of Chittagong, Chattogram',
    deadline: '2026-06-17',
    status: 'open' as VacancyStatus,
    description: '',
    requirementsText: '',
    applicantCount: 0,
  });

  const handleOpenAdd = () => {
    setEditingVac(null);
    setFormData({
      title: '',
      department: 'Department of Computer Science and Engineering',
      workPackage: 'HEAT-13211-CU ATF Sub-Project',
      type: 'e-Tender Notice (OTM Goods)',
      location: 'University of Chittagong, Chattogram',
      deadline: '2026-08-30',
      status: 'open',
      description: '',
      requirementsText: 'Submission via National e-GP System Portal (www.eprocure.gov.bd)\nValid Trade License and TIN\nAuthorized OEM distributor certification',
      applicantCount: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vac: Vacancy) => {
    setEditingVac(vac);
    setFormData({
      title: vac.title,
      department: vac.department,
      workPackage: vac.workPackage,
      type: vac.type,
      location: vac.location,
      deadline: vac.deadline,
      status: vac.status,
      description: vac.description,
      requirementsText: vac.requirements.join('\n'),
      applicantCount: vac.applicantCount,
    });
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const requirements = formData.requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      department: formData.department,
      workPackage: formData.workPackage,
      type: formData.type,
      location: formData.location,
      deadline: formData.deadline,
      status: formData.status,
      description: formData.description,
      requirements,
      applicantCount: formData.applicantCount,
    };

    try {
      if (editingVac) {
        await updateVacancy(editingVac.id, payload);
      } else {
        await addVacancy(payload);
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVacancy(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete vacancy:', err);
    }
  };

  const toggleStatus = (vac: Vacancy) => {
    const nextStatus = vac.status === 'open' ? 'closed' : 'open';
    updateVacancy(vac.id, { status: nextStatus });
  };

  // Filtered
  const filteredVacancies = vacancies.filter((v) => {
    const matchesType =
      selectedType === 'All' ||
      v.type.toLowerCase().trim() === selectedType.toLowerCase().trim();
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.workPackage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">Vacancies &amp; e-Tenders</h1>
            <p className="text-sm text-gray-500">
              Procurement notices (OTM Goods) and academic research fellowship openings
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* ── Filter and Search Bar ──────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar overscroll-contain">
          {dynamicTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === t
                  ? 'bg-[#0c2461] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'All' ? 'All Notices' : t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as VacancyStatus | 'all')}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#0c2461]"
            />
          </div>
        </div>
      </div>

      {/* ── Vacancies Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVacancies.map((vac) => {
          const isOpen = vac.status === 'open';

          return (
            <div
              key={vac.id}
              className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0c2461] rounded px-2 py-0.5">
                    {vac.type}
                  </span>

                  <button
                    onClick={() => toggleStatus(vac)}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                      isOpen
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isOpen ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span>{isOpen ? 'Open / Active' : 'Closed'}</span>
                  </button>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0c2461] leading-tight">
                  {vac.title}
                </h3>

                <p className="text-xs font-semibold text-blue-600 mt-1">
                  {vac.workPackage}
                </p>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {vac.description}
                </p>

                {/* Key criteria */}
                {vac.requirements.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0c2461] mb-1.5 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Key Specifications
                    </p>
                    <ul className="space-y-1">
                      {vac.requirements.map((req, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-[#0c2461] font-bold">&bull;</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Closing: <strong>{vac.deadline}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{vac.applicantCount} Submissions</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{vac.location}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href="https://www.eprocure.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0c2461] hover:underline"
                >
                  <span>e-GP Portal Notice</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(vac)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0c2461] hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Notice"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeleteTarget(vac)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVacancies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8">
          <p className="text-sm text-gray-500">No vacancies or notices found matching your criteria.</p>
        </div>
      )}

      {/* ── Add / Edit Modal ────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVac ? 'Edit Notice' : 'Post Vacancy or Tender'}
        subtitle="Manage public notice specifications, requirements, and deadlines"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Position or Notice Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="Supply and installation of AI workstations (OTM Goods)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#0c2461]">
                  Notice Type *
                </label>
                <span className="text-[10px] text-gray-400">Editable (Free text)</span>
              </div>
              <input
                type="text"
                required
                list="notice-types-datalist"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="e.g. e-Tender Notice (OTM Goods), Research Fellowship..."
              />
              <datalist id="notice-types-datalist">
                <option value="e-Tender Notice (OTM Goods)" />
                <option value="Research Fellowship" />
                <option value="Job Circular" />
                <option value="Expression of Interest (EOI)" />
                <option value="Request for Quotation (RFQ)" />
                <option value="Procurement Notice" />
                <option value="Full-time Position" />
                <option value="Part-time Position" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Sub-Project / Work Package
              </label>
              <input
                type="text"
                required
                value={formData.workPackage}
                onChange={(e) => setFormData({ ...formData, workPackage: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="HEAT-13211-CU ATF"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Closing Deadline
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as VacancyStatus })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Submissions
              </label>
              <input
                type="number"
                value={formData.applicantCount}
                onChange={(e) =>
                  setFormData({ ...formData, applicantCount: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="Scope of works or fellowship requirements..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Key Criteria (one line per point)
            </label>
            <textarea
              rows={3}
              value={formData.requirementsText}
              onChange={(e) => setFormData({ ...formData, requirementsText: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461] font-mono"
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
                : editingVac
                ? 'Save Changes'
                : 'Post Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Remove Notice?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-800">"{deleteTarget.title}"</strong>? This will permanently delete this notice from the public portal.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
