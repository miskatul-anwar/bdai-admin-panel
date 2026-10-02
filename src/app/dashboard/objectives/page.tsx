'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { ResearchObjective, ObjectiveStatus, ObjectiveTask } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  Target,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Plus,
  Trash2,
  AlertCircle,
  ListTodo,
} from 'lucide-react';

export default function ObjectivesManagementPage() {
  const {
    objectives,
    addObjective,
    updateObjective,
    deleteObjective,
    toggleObjectiveTask,
    canEdit,
    canDelete,
  } = useAdmin();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<ResearchObjective | null>(null);
  const [objToDelete, setObjToDelete] = useState<ResearchObjective | null>(null);

  // Quick inline add task state: objectiveId -> text
  const [inlineTaskText, setInlineTaskText] = useState<Record<string, string>>({});
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    details: '',
    researcher: '',
    sector: '',
    status: 'in-progress' as ObjectiveStatus,
    progress: 50,
    deliverables: 2,
    tasks: [] as ObjectiveTask[],
  });
  const [newModalTaskTitle, setNewModalTaskTitle] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInlineAddTask = async (objId: string) => {
    const text = (inlineTaskText[objId] || '').trim();
    if (!text) return;
    setAddingTaskId(objId);
    try {
      const obj = objectives.find((o) => o.id === objId);
      if (!obj) return;
      const existingTasks = obj.tasks || [];
      const newTask: ObjectiveTask = {
        id: `${objId.toLowerCase()}-t${Date.now()}`,
        title: text,
        completed: false,
      };
      const updatedTasks = [...existingTasks, newTask];
      await updateObjective(objId, { tasks: updatedTasks });
      setInlineTaskText((prev) => ({ ...prev, [objId]: '' }));
    } finally {
      setAddingTaskId(null);
    }
  };

  const handleInlineDeleteTask = async (objId: string, taskId: string) => {
    const obj = objectives.find((o) => o.id === objId);
    if (!obj) return;
    const existingTasks = obj.tasks || [];
    const updatedTasks = existingTasks.filter((t) => t.id !== taskId);
    await updateObjective(objId, { tasks: updatedTasks });
  };

  const handleOpenAdd = () => {
    setEditingObj(null);
    const nextNum = objectives.length + 1;
    setFormData({
      id: `OB${nextNum}`,
      title: '',
      details: '',
      researcher: '',
      sector: '',
      status: 'in-progress',
      progress: 0,
      deliverables: 1,
      tasks: [],
    });
    setNewModalTaskTitle('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (obj: ResearchObjective) => {
    setEditingObj(obj);
    setFormData({
      id: obj.id,
      title: obj.title,
      details: obj.details,
      researcher: obj.researcher,
      sector: obj.sector,
      status: obj.status,
      progress: obj.progress,
      deliverables: obj.deliverables,
      tasks: obj.tasks || [],
    });
    setNewModalTaskTitle('');
    setIsModalOpen(true);
  };

  const handleModalAddTask = () => {
    if (!newModalTaskTitle.trim()) return;
    const newTask: ObjectiveTask = {
      id: `${formData.id.toLowerCase() || 'task'}-t${Date.now()}`,
      title: newModalTaskTitle.trim(),
      completed: false,
    };
    setFormData({
      ...formData,
      tasks: [...formData.tasks, newTask],
    });
    setNewModalTaskTitle('');
  };

  const handleModalToggleTask = (taskId: string) => {
    const updatedTasks = formData.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setFormData({
      ...formData,
      tasks: updatedTasks,
    });
  };

  const handleModalEditTask = (taskId: string, newTitle: string) => {
    const updatedTasks = formData.tasks.map((t) =>
      t.id === taskId ? { ...t, title: newTitle } : t
    );
    setFormData({
      ...formData,
      tasks: updatedTasks,
    });
  };

  const handleModalRemoveTask = (taskId: string) => {
    const updatedTasks = formData.tasks.filter((t) => t.id !== taskId);
    setFormData({
      ...formData,
      tasks: updatedTasks,
    });
  };

  const handleOpenDelete = (obj: ResearchObjective) => {
    setObjToDelete(obj);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.id.trim()) return;
    setIsSaving(true);
    try {
      if (editingObj) {
        await updateObjective(editingObj.id, formData);
      } else {
        await addObjective(formData);
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!objToDelete) return;
    setIsDeleting(true);
    try {
      await deleteObjective(objToDelete.id);
      setIsDeleteModalOpen(false);
      setObjToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const avgProgress = Math.round(
    objectives.reduce((acc, o) => acc + (o.progress || 0), 0) / (objectives.length || 1)
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
              Manage research packages, milestone tracking, and deliverables
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Average Milestone Metric */}
          <div className="px-4 py-2 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0c2461]">
                Avg Milestone
              </p>
              <p className="text-sm font-bold text-[#0c2461] font-mono">{avgProgress}%</p>
            </div>
            <div className="w-8 h-8 rounded-full border-3 border-slate-100 border-t-[#0c2461] flex items-center justify-center font-bold text-[11px] text-[#0c2461]">
              {avgProgress}%
            </div>
          </div>

          {/* Add Objective Button */}
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0c2461] hover:bg-[#0c2461]/90 shadow-sm transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Objective</span>
            </button>
          )}
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
                    {obj.sector && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        {obj.sector}
                      </span>
                    )}
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
                  <span>Assigned: <strong className="text-slate-800">{obj.researcher || 'Unassigned'}</strong></span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    {obj.deliverables} Deliverables
                  </span>
                </div>

                {/* Objective Tasks Checklist */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c2461] flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-blue-600" />
                      Tasks Checklist
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                      {(obj.tasks || []).filter((t) => t.completed).length} / {(obj.tasks || []).length} Done
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {obj.tasks && obj.tasks.length > 0 ? (
                      obj.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`group flex items-center justify-between gap-2 p-2 rounded-xl text-xs transition-all ${
                            task.completed
                              ? 'bg-emerald-50/70 border border-emerald-100/90 text-emerald-950'
                              : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100/70'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => canEdit && toggleObjectiveTask(obj.id, task.id)}
                            disabled={!canEdit}
                            className="flex items-center gap-2 text-left flex-1 cursor-pointer bg-transparent border-none p-0 min-w-0"
                            title={task.completed ? 'Click to mark as not done' : 'Click to mark as done'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0 hover:text-blue-600" />
                            )}
                            <span
                              className={`truncate leading-snug ${
                                task.completed
                                  ? 'line-through text-emerald-800/80 font-medium'
                                  : 'font-normal'
                              }`}
                            >
                              {task.title}
                            </span>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                task.completed
                                  ? 'bg-emerald-200/60 text-emerald-800'
                                  : 'bg-slate-200/60 text-slate-600'
                              }`}
                            >
                              {task.completed ? 'Done' : 'Pending'}
                            </span>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleInlineDeleteTask(obj.id, task.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Remove task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic py-1">No tasks assigned yet.</p>
                    )}
                  </div>

                  {/* Inline quick-add task */}
                  {canEdit && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder={`Add new task to ${obj.id}...`}
                        value={inlineTaskText[obj.id] || ''}
                        onChange={(e) =>
                          setInlineTaskText({ ...inlineTaskText, [obj.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInlineAddTask(obj.id);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                      />
                      <button
                        type="button"
                        onClick={() => handleInlineAddTask(obj.id)}
                        disabled={addingTaskId === obj.id || !(inlineTaskText[obj.id] || '').trim()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#0c2461] hover:bg-[#0c2461]/90 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end items-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit(obj)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0c2461] hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleOpenDelete(obj)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit Modal ────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingObj ? `Update Objective ${editingObj.id}` : 'Create Research Objective'}
        subtitle="Adjust work package details, progress percentage, and assignments"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Objective ID / Code *
              </label>
              <input
                type="text"
                required
                disabled={!!editingObj}
                placeholder="e.g. OB9"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461] disabled:opacity-60"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Sector / Field
              </label>
              <input
                type="text"
                placeholder="e.g. Health & Clinical AI"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Development of Bangla NLP Diagnostic Framework"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Details & Scope
            </label>
            <textarea
              rows={3}
              placeholder="Comprehensive description of the research objective and scope..."
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
                placeholder="e.g. Prof. Dr. M. Shahadat Hossain"
                value={formData.researcher}
                onChange={(e) => setFormData({ ...formData, researcher: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Deliverables Planned / Completed
              </label>
              <input
                type="number"
                min="0"
                value={formData.deliverables}
                onChange={(e) =>
                  setFormData({ ...formData, deliverables: parseInt(e.target.value) || 0 })
                }
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

          {/* Tasks & Checklist Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#0c2461] flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-blue-600" />
                Actionable Tasks & Milestones
                <span className="text-[11px] font-normal text-slate-500">
                  ({formData.tasks.filter((t) => t.completed).length}/{formData.tasks.length} Done)
                </span>
              </label>
              {formData.tasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const comp = formData.tasks.filter((t) => t.completed).length;
                    const autoProg = Math.round((comp / formData.tasks.length) * 100);
                    setFormData({
                      ...formData,
                      progress: autoProg,
                      status: autoProg === 100 ? 'completed' : formData.status === 'planned' ? 'planned' : 'in-progress',
                    });
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Auto-sync progress %
                </button>
              )}
            </div>

            {/* Quick Add Task Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add an actionable milestone task..."
                value={newModalTaskTitle}
                onChange={(e) => setNewModalTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleModalAddTask();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
              <button
                type="button"
                onClick={handleModalAddTask}
                disabled={!newModalTaskTitle.trim()}
                className="px-3 py-2 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* Task Items List */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {formData.tasks.length === 0 ? (
                <div className="p-3 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
                  No tasks added yet. Enter a task above and click Add.
                </div>
              ) : (
                formData.tasks.map((task, idx) => (
                  <div
                    key={task.id || idx}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-colors ${
                      task.completed
                        ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleModalToggleTask(task.id)}
                      className="flex-shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                      title={task.completed ? 'Mark as Not Done' : 'Mark as Done'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleModalEditTask(task.id, e.target.value)}
                      className={`flex-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-xs ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                      placeholder="Task description..."
                    />
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider ${
                        task.completed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {task.completed ? 'Done' : 'Pending'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleModalRemoveTask(task.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded-lg"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
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
              {isSaving ? 'Writing to Database...' : editingObj ? 'Save Changes' : 'Create Objective'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Objective Deletion"
        subtitle="This action will delete the research objective permanently from the database"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">Are you sure you want to delete this objective?</p>
              <p className="mt-1 text-rose-700">
                Objective <strong>{objToDelete?.id}: {objToDelete?.title}</strong> will be removed from both the public portal and the database.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Objective'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
