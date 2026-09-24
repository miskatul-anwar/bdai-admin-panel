'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { ResearchObjective, ObjectiveStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  Target,
  Edit2,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export default function ObjectivesManagementPage() {
  const { objectives, updateObjective, canEdit } = useAdmin();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<ResearchObjective | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    researcher: '',
    sector: '',
    status: 'in-progress' as ObjectiveStatus,
    progress: 50,
    deliverables: 2,
  });

  const handleOpenEdit = (obj: ResearchObjective) => {
    setEditingObj(obj);
    setFormData({
      title: obj.title,
      details: obj.details,
      researcher: obj.researcher,
      sector: obj.sector,
      status: obj.status,
      progress: obj.progress,
      deliverables: obj.deliverables,
    });
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingObj) {
        await updateObjective(editingObj.id, formData);
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const avgProgress = Math.round(
    objectives.reduce((acc, o) => acc + o.progress, 0) / (objectives.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">Research Objectives</h1>
            <p className="text-sm text-gray-500">
              Milestone tracking and deliverables for OB1 &ndash; OB8 work packages
            </p>
          </div>
        </div>

        {/* Milestone Indicator */}
        <div className="px-5 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0c2461]">
              Average Milestone
            </p>
            <p className="text-base font-bold text-[#0c2461] font-mono">{avgProgress}%</p>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#0c2461] flex items-center justify-center font-bold text-xs text-[#0c2461]">
            {avgProgress}%
          </div>
        </div>
      </div>

      {/* ── Objectives Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {objectives.map((obj) => {
          const isCompleted = obj.status === 'completed';
          const isInProgress = obj.status === 'in-progress';

          return (
            <div
              key={obj.id}
              className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0c2461] rounded px-2.5 py-0.5">
                      {obj.id}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {obj.sector}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isInProgress
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{obj.status}</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0c2461] leading-tight">
                  {obj.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {obj.details}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-bold text-[#0c2461] font-mono">{obj.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-600' : 'bg-[#0c2461]'
                      }`}
                      style={{ width: `${obj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Assigned: <strong className="text-slate-800">{obj.researcher}</strong></span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    {obj.deliverables} Deliverables
                  </span>
                </div>
              </div>

              {/* Edit button */}
              {canEdit && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleOpenEdit(obj)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0c2461] hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Update Milestone</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update Objective ${editingObj?.id}`}
        subtitle="Adjust progress percentage, status, and researcher assignments"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Details
            </label>
            <textarea
              rows={3}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Assigned Researcher
              </label>
              <input
                type="text"
                value={formData.researcher}
                onChange={(e) => setFormData({ ...formData, researcher: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Sector
              </label>
              <input
                type="text"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ObjectiveStatus })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              >
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="planned">Planned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Milestone Progress ({formData.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="w-full mt-2 accent-[#0c2461]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Deliverables Completed
            </label>
            <input
              type="number"
              value={formData.deliverables}
              onChange={(e) =>
                setFormData({ ...formData, deliverables: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
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
              {isSaving ? 'Writing to Database...' : 'Save Milestone'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
