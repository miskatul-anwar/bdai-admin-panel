'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  Image as ImageIcon,
  X,
  AlertTriangle,
  UploadCloud,
  Loader2,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';
import { useAdmin } from '@/lib/store';
import { EventItem, EventGalleryItem } from '@/types';
import ImageUpload from '@/components/ui/ImageUpload';
import { uploadImage } from '@/lib/api';
import { getEventTimestamp, extractDateAndTime, formatEventDisplayDate } from '@/lib/date-utils';

const CATEGORY_SUGGESTIONS = [
  'Workshop',
  'Seminar',
  'PhD Seminar',
  'Guest Lecture',
  'Symposium',
  'Collaboration Visit',
];

export default function EventsManagementPage() {
  const { events, addEvent, updateEvent, deleteEvent, canEdit, canDelete } = useAdmin();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'held' | 'upcoming'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<EventItem, 'id'>>({
    title: '',
    date: '',
    status: 'held',
    category: 'Workshop',
    location: 'Department of CSE, University of Chittagong',
    description: '',
    banner: '/events/workshop_banner.jpeg',
    gallery: [],
    order: 1,
  });

  // Gallery item being added inside modal
  const [newGallerySrc, setNewGallerySrc] = useState('');
  const [newGalleryAlt, setNewGalleryAlt] = useState('');

  // Gallery direct upload & drag-drop state
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const [showUrlAdd, setShowUrlAdd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Date & Time picker state inside modal
  const [pickerDate, setPickerDate] = useState('');
  const [pickerTime, setPickerTime] = useState('');
  const [showCustomDateDisplay, setShowCustomDateDisplay] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);

  // Sort events chronologically descending: latest at the top, followed by past ones
  const sortedEvents = [...events].sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));

  // Filtered Events
  const filteredEvents = sortedEvents.filter((e) => {
    const matchesStatus =
      statusFilter === 'all' || (e.status || '').toLowerCase() === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.date.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const totalEvents = events.length;
  const heldCount = events.filter((e) => (e.status || '').toLowerCase() === 'held').length;
  const upcomingCount = events.filter((e) => (e.status || '').toLowerCase() === 'upcoming').length;
  const totalSnapshots = events.reduce((acc, curr) => acc + (curr.gallery?.length || 0), 0);

  // Handler for Date & Time picker changes
  const handleDateChange = (newDate: string, newTime: string) => {
    setPickerDate(newDate);
    setPickerTime(newTime);
    const formatted = formatEventDisplayDate(newDate, newTime);
    const dateIso = newTime ? `${newDate}T${newTime}` : newDate;
    setFormData((prev) => ({
      ...prev,
      date: formatted,
      date_iso: dateIso,
    }));
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingEvent(null);
    const today = new Date().toISOString().split('T')[0];
    const initialTime = '';
    const formatted = formatEventDisplayDate(today, initialTime);
    setPickerDate(today);
    setPickerTime(initialTime);
    setShowCustomDateDisplay(false);
    setFormData({
      title: '',
      date: formatted,
      date_iso: today,
      status: 'held',
      category: 'Workshop',
      location: 'Department of CSE, University of Chittagong',
      description: '',
      banner: '/events/workshop_banner.jpeg',
      gallery: [],
      order: 1,
    });
    setNewGallerySrc('');
    setNewGalleryAlt('');
    setGalleryUploadError(null);
    setShowUrlAdd(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (event: EventItem) => {
    setEditingEvent(event);
    const extracted = extractDateAndTime(event.date, event.date_iso);
    setPickerDate(extracted.date);
    setPickerTime(extracted.time);
    setShowCustomDateDisplay(false);
    setFormData({
      title: event.title,
      date: event.date,
      date_iso: event.date_iso || (extracted.date ? (extracted.time ? `${extracted.date}T${extracted.time}` : extracted.date) : undefined),
      status: event.status,
      category: event.category || 'Workshop',
      location: event.location || '',
      description: event.description || '',
      banner: event.banner || '',
      gallery: event.gallery ? [...event.gallery] : [],
      order: event.order ?? 1,
    });
    setNewGallerySrc('');
    setNewGalleryAlt('');
    setGalleryUploadError(null);
    setShowUrlAdd(false);
    setIsModalOpen(true);
  };

  // Batch upload image files directly to Cloudinary CDN
  const handleUploadGalleryFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setGalleryUploadError('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    setIsUploadingGallery(true);
    setGalleryUploadError(null);

    const newItems: EventGalleryItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgressText(`Uploading ${i + 1} of ${fileArray.length} (${file.name})...`);
      try {
        const url = await uploadImage(file, 'bdai/events');
        const cleanCaption = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();
        newItems.push({
          src: url,
          alt: cleanCaption || formData.title || 'Event snapshot',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setGalleryUploadError(`Failed to upload ${file.name}: ${msg}`);
      }
    }

    if (newItems.length > 0) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...newItems],
      }));
    }

    setIsUploadingGallery(false);
    setUploadProgressText('');
    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = '';
    }
  };

  // Update caption for existing gallery item in-place
  const handleUpdateGalleryCaption = (index: number, newCaption: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.map((item, i) =>
        i === index ? { ...item, alt: newCaption } : item
      ),
    }));
  };

  // Add snapshot to modal form via direct URL
  const handleAddGalleryItem = () => {
    if (!newGallerySrc.trim()) return;
    const item: EventGalleryItem = {
      src: newGallerySrc.trim(),
      alt: newGalleryAlt.trim() || formData.title || 'Event snapshot',
    };
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, item],
    }));
    setNewGallerySrc('');
    setNewGalleryAlt('');
  };

  // Remove snapshot from modal form
  const handleRemoveGalleryItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  // Submit Modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date.trim()) return;

    if (editingEvent) {
      await updateEvent(editingEvent.id, formData);
    } else {
      await addEvent(formData);
    }

    setIsModalOpen(false);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteEvent(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Events Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage held academic workshops, research seminars, and upcoming delegations.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2461] hover:bg-[#091b48] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalEvents}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Held Events</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{heldCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Upcoming Events</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{upcomingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Gallery Snapshots</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{totalSnapshots}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalEvents})
          </button>
          <button
            onClick={() => setStatusFilter('held')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'held'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Held ({heldCount})
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'upcoming'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, location, category..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20 focus:border-[#0c2461]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Events List Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No events match "${searchTerm}". Try resetting your search filters.`
              : 'No events currently registered in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredEvents.map((event) => {
            const isHeld = (event.status || '').toLowerCase() === 'held';
            const gallery = event.gallery || [];
            return (
              <article
                key={event.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col lg:flex-row hover:shadow-md transition-shadow"
              >
                {/* Banner Thumbnail (Left Column) */}
                <div className="lg:w-80 h-52 lg:h-auto bg-slate-100 relative shrink-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100">
                  {event.banner ? (
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">No banner image</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs ${
                        isHeld
                          ? 'bg-blue-900 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isHeld ? 'Held Event' : 'Upcoming Event'}
                    </span>
                  </div>
                </div>

                {/* Details & Gallery (Right Column) */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Calendar className="w-4 h-4 text-[#0c2461]" />
                        <span>{event.date}</span>
                      </div>
                      {event.category && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {event.category}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {event.title}
                    </h2>

                    {event.location && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{event.location}</span>
                      </p>
                    )}

                    {event.description && (
                      <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    )}

                    {/* Snapshots Strip */}
                    {gallery.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Gallery Snapshots ({gallery.length})</span>
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {gallery.slice(0, 5).map((snap, sIdx) => (
                            <div
                              key={sIdx}
                              className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative"
                            >
                              <img
                                src={snap.src}
                                alt={snap.alt || 'Gallery photo'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {gallery.length > 5 && (
                            <div className="w-14 h-14 rounded-xl shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                              +{gallery.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(event)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => setDeleteTarget(event)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set event details, status, banner graphic, and gallery snapshots.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Event Title *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Professor Dr. Debasish Ghose delivers intensive quality paper writing workshop"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20 focus:border-[#0c2461]"
                />
              </div>

              {/* Event Date, Time & Status Picker */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0c2461]" />
                    Date & Time Picker *
                  </span>
                  {formData.date && (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {formData.date}
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={pickerDate}
                      onChange={(e) => handleDateChange(e.target.value, pickerTime)}
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20 focus:border-[#0c2461] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={pickerTime}
                      onChange={(e) => handleDateChange(pickerDate, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20 focus:border-[#0c2461] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Event Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'held' | 'upcoming' })}
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20 focus:border-[#0c2461] transition-colors"
                    >
                      <option value="held">Held (Archive with photos)</option>
                      <option value="upcoming">Upcoming (Future schedule)</option>
                    </select>
                  </div>
                </div>

                {/* Display Text & Customization Toggle */}
                <div className="pt-1.5 border-t border-slate-200/60 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Display on website & cards:</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomDateDisplay(!showCustomDateDisplay)}
                      className="text-[#0c2461] hover:underline font-semibold cursor-pointer"
                    >
                      {showCustomDateDisplay ? 'Use standard auto-format' : 'Customize display text'}
                    </button>
                  </div>
                  {showCustomDateDisplay ? (
                    <input
                      type="text"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="e.g. 29th July 2026 or 2.00PM · 19th May 2026"
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200/70">
                      {formData.date || 'Please select a date above'}
                    </p>
                  )}
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Workshop, Seminar, PhD Seminar"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20 focus:border-[#0c2461]"
                  />
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {CATEGORY_SUGGESTIONS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. BDAI Lab, Department of CSE, University of Chittagong"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20 focus:border-[#0c2461]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide background, key participants, and discussion highlights..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c2461]/20 focus:border-[#0c2461]"
                />
              </div>

              {/* Banner Image */}
              <div>
                <ImageUpload
                  label="Event Banner Image *"
                  value={formData.banner}
                  onChange={(url) => setFormData({ ...formData, banner: url })}
                  folder="bdai/events"
                  helperText="Upload official announcement poster or supply image URL (e.g. /events/workshop_banner.jpeg)"
                />
              </div>

              {/* Gallery Snapshots Manager */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0c2461]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Gallery Snapshots ({formData.gallery.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUrlAdd(!showUrlAdd)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showUrlAdd ? 'Hide URL input' : 'Add via Image URL'}</span>
                  </button>
                </div>

                {/* Direct Upload Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) handleUploadGalleryFiles(e.dataTransfer.files);
                  }}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className={`cursor-pointer border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-[#0c2461] hover:bg-slate-100/70 bg-white'
                  } ${isUploadingGallery ? 'pointer-events-none opacity-80' : ''}`}
                >
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleUploadGalleryFiles(e.target.files)}
                    className="hidden"
                  />
                  {isUploadingGallery ? (
                    <div className="flex flex-col items-center justify-center py-2 text-[#0c2461]">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-800">
                        {uploadProgressText || 'Uploading photos to Cloudinary CDN...'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Please wait while photos are optimized and uploaded
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload or drag & drop event photos
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        PNG, JPG, WebP up to 10MB each • Select multiple photos at once
                      </p>
                    </div>
                  )}
                </div>

                {galleryUploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{galleryUploadError}</span>
                  </div>
                )}

                {/* Optional Direct URL Addition */}
                {showUrlAdd && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-xs font-semibold text-slate-700">Add Snapshot via Direct URL</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newGallerySrc}
                        onChange={(e) => setNewGallerySrc(e.target.value)}
                        placeholder="Image URL or /events/photo.jpeg"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0c2461]"
                      />
                      <input
                        type="text"
                        value={newGalleryAlt}
                        onChange={(e) => setNewGalleryAlt(e.target.value)}
                        placeholder="Short caption / alt text"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0c2461]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddGalleryItem}
                        disabled={!newGallerySrc.trim()}
                        className="px-3 py-1.5 rounded-lg bg-[#0c2461] hover:bg-[#091b48] text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        + Add URL to Gallery
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Snapshots List with In-Line Caption Editing */}
                {formData.gallery.length > 0 && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Current Snapshots ({formData.gallery.length})
                    </p>
                    {formData.gallery.map((snap, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative border border-slate-200">
                          <img
                            src={snap.src}
                            alt={snap.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <input
                            type="text"
                            value={snap.alt}
                            onChange={(e) => handleUpdateGalleryCaption(idx, e.target.value)}
                            placeholder="Snapshot caption..."
                            className="w-full text-xs font-medium text-slate-800 px-2 py-1 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0c2461]"
                          />
                          <p className="text-[10px] text-slate-400 truncate px-0.5">{snap.src}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove snapshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0c2461] hover:bg-[#091b48] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Event?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete &quot;<strong className="text-slate-800">{deleteTarget.title}</strong>&quot;? This will remove its announcement and associated gallery snapshots from the public portal.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
