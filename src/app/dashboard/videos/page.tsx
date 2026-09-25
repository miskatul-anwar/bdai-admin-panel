'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { AdminVideo } from '@/types';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  PlayCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Film,
  Calendar,
  AlertCircle,
  Hash,
} from 'lucide-react';

export default function VideosManagementPage() {
  const { videos, addVideo, updateVideo, deleteVideo, canEdit, canDelete } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<AdminVideo | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<AdminVideo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    thumbnail: '',
    description: '',
    postedAt: '',
    order: 1,
  });

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      url: '',
      thumbnail: '',
      description: '',
      postedAt: 'Recently added',
      order: (videos.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (video: AdminVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      url: video.url || '',
      thumbnail: video.thumbnail || '',
      description: video.description || '',
      postedAt: video.postedAt || '',
      order: video.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (video: AdminVideo) => {
    setVideoToDelete(video);
    setIsDeleteModalOpen(true);
  };

  // Helper to extract YouTube video ID if URL is from YouTube
  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleUrlBlur = () => {
    // If thumbnail is empty and URL is YouTube, auto-fill HQ YouTube thumbnail
    if (!formData.thumbnail && formData.url) {
      const ytId = extractYoutubeId(formData.url);
      if (ytId) {
        setFormData((prev) => ({
          ...prev,
          thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    setIsSaving(true);
    try {
      if (editingVideo) {
        await updateVideo(editingVideo.id, {
          title: formData.title,
          url: formData.url,
          thumbnail: formData.thumbnail,
          description: formData.description,
          postedAt: formData.postedAt,
          order: formData.order,
        });
      } else {
        await addVideo({
          title: formData.title,
          url: formData.url,
          thumbnail: formData.thumbnail,
          description: formData.description,
          postedAt: formData.postedAt || 'Recently added',
          order: formData.order,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteVideo(videoToDelete.id);
      setIsDeleteModalOpen(false);
      setVideoToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVideos = videos
    .filter((v) => {
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.url?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">BDAI Videos</h1>
            <p className="text-sm text-gray-500">
              Manage featured research videos, demonstrations, and laboratory media
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0c2461]">
                Total Videos
              </p>
              <p className="text-base font-bold text-[#0c2461] font-mono">{videos.length}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0c2461] flex items-center justify-center font-bold text-xs">
              <Film className="w-4 h-4" />
            </div>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0c2461] hover:bg-[#0c2461]/90 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Video</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search videos by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-[#0c2461] shadow-sm"
        />
      </div>

      {/* ── Videos Grid ────────────────────────────────────────── */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0c2461]">No videos found</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery ? 'Try matching another query' : 'Click "Add Video" to add your first video'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const ytId = extractYoutubeId(video.url);
            const thumbSrc =
              video.thumbnail ||
              (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/images/placeholder.jpg');

            return (
              <div
                key={video.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Video Preview */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                    <img
                      src={thumbSrc}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/600x400/0c2461/white?text=BDAI+Video';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-white/90 text-[#0c2461] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                        title="Watch Video"
                      >
                        <PlayCircle className="w-7 h-7 fill-current" />
                      </a>
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Hash className="w-3 h-3 text-blue-400" />
                      <span>Order {video.order}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{video.postedAt || 'Recently added'}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#0c2461] line-clamp-2 leading-snug">
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                        {video.description}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 break-all truncate max-w-full"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{video.url}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(video)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0c2461] hover:bg-white border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleOpenDelete(video)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-white border border-rose-200 shadow-2xs transition-colors cursor-pointer"
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
      )}

      {/* ── Add / Edit Modal ────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVideo ? `Edit Video: ${editingVideo.title}` : 'Add New Video'}
        subtitle="Configure video URL, YouTube link, thumbnail, and descriptions"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Video Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BDAI Laboratory Research Showcase"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Video URL (YouTube or Direct Video) *
            </label>
            <input
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              onBlur={handleUrlBlur}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Supports standard YouTube links, embed links, or direct MP4 URLs.
            </p>
          </div>

          {/* Cloudinary Image Upload / Custom Thumbnail */}
          <div>
            <ImageUpload
              label="Video Thumbnail Image"
              folder="bdai_videos"
              value={formData.thumbnail}
              onChange={(url) => setFormData({ ...formData, thumbnail: url })}
              helperText="Upload custom thumbnail via Cloudinary, or leave blank to auto-detect from YouTube"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of the video content, demonstration, or research context..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Posted / Recorded Date
              </label>
              <input
                type="text"
                placeholder="e.g. March 2026 or 2025"
                value={formData.postedAt}
                onChange={(e) => setFormData({ ...formData, postedAt: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
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
              {isSaving ? 'Saving to Database...' : editingVideo ? 'Save Changes' : 'Add Video'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Video Deletion"
        subtitle="This action will delete the video permanently from the database"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">Are you sure you want to delete this video?</p>
              <p className="mt-1 text-rose-700">
                Video <strong>{videoToDelete?.title}</strong> will be removed from both the public portal and the database.
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
              {isDeleting ? 'Deleting...' : 'Delete Video'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
