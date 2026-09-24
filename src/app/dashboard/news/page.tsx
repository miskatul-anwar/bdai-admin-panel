'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { NewsArticle, NewsCategory, ContentStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: { label: string; value: NewsCategory | 'all' }[] = [
  { label: 'All Items', value: 'all' },
  { label: 'News', value: 'news' },
  { label: 'Seminars & Events', value: 'event' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Announcements & Tenders', value: 'announcement' },
];

export default function NewsManagementPage() {
  const { news, addNews, updateNews, deleteNews, canEdit, canDelete } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'news' as NewsCategory,
    publishDate: new Date().toISOString().split('T')[0],
    author: 'BIKE Lab',
    status: 'published' as ContentStatus,
    featured: false,
    tagsString: 'BDAI, Research, HEAT',
  });

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'news',
      publishDate: new Date().toISOString().split('T')[0],
      author: 'BIKE Lab',
      status: 'published',
      featured: false,
      tagsString: 'BDAI, Research, HEAT',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      publishDate: article.publishDate,
      author: article.author,
      status: article.status,
      featured: article.featured,
      tagsString: article.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      publishDate: formData.publishDate,
      author: formData.author,
      status: formData.status,
      featured: formData.featured,
      tags,
    };

    try {
      if (editingArticle) {
        await updateNews(editingArticle.id, payload);
      } else {
        await addNews(payload);
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteNews(id);
    }
  };

  const toggleStatus = (article: NewsArticle) => {
    const nextStatus = article.status === 'published' ? 'draft' : 'published';
    updateNews(article.id, { status: nextStatus });
  };

  // Filtered
  const filteredNews = news.filter((n) => {
    const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || n.status === selectedStatus;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">News &amp; Events</h1>
            <p className="text-sm text-gray-500">
              Project updates, research breakthroughs, seminars, and procurement notices
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        )}
      </div>

      {/* ── Filter and Search Bar ──────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-[#0c2461] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ContentStatus | 'all')}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#0c2461]"
            />
          </div>
        </div>
      </div>

      {/* ── News Articles (Matching bdai-web News view) ────────── */}
      <div className="space-y-4">
        {filteredNews.map((article) => {
          const isPublished = article.status === 'published';

          return (
            <article
              key={article.id}
              className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5"
            >
              <div className="max-w-4xl space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0c2461] rounded px-2 py-0.5">
                    {article.category}
                  </span>

                  <button
                    onClick={() => toggleStatus(article)}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                      isPublished
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isPublished ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{isPublished ? 'Published' : 'Draft'}</span>
                  </button>

                  {article.featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}

                  <time className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.publishDate}
                  </time>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0c2461] leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                  {article.excerpt || article.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto justify-end">
                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit(article)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#0c2461] hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Article"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {filteredNews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8">
            <p className="text-sm text-gray-500">No news articles found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? 'Edit Article' : 'New Article'}
        subtitle="Publish project notices, milestones, and announcements"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="e.g. Professor Dr. Debasish Ghose visited our lab..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as NewsCategory })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              >
                <option value="news">News</option>
                <option value="event">Seminar / Event</option>
                <option value="workshop">Workshop</option>
                <option value="announcement">Announcement / Tender</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Publish Date
              </label>
              <input
                type="date"
                required
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
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
                  setFormData({ ...formData, status: e.target.value as ContentStatus })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Short Summary / Excerpt
            </label>
            <input
              type="text"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="Brief sentence for card preview..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Full Details
            </label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="Full text of the announcement..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tagsString}
                onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="Workshop, BDAI, Research"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded text-[#0c2461]"
              />
              <label htmlFor="featured" className="text-xs font-semibold text-[#0c2461]">
                Mark as Featured Article
              </label>
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
              {isSaving
                ? 'Writing to Database...'
                : editingArticle
                ? 'Save Changes'
                : 'Publish Article'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
