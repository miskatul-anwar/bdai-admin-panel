'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  TeamMember,
  NewsArticle,
  Vacancy,
  ResearchObjective,
  AdminUser,
  UserRole,
  ActivityLog,
  Tool,
  AdminVideo,
  EventItem,
} from '@/types';
import {
  DEMO_ADMIN_USER,
  INITIAL_USERS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_NEWS,
  INITIAL_VACANCIES,
  INITIAL_OBJECTIVES,
  INITIAL_ACTIVITIES,
  INITIAL_TOOLS,
  INITIAL_VIDEOS,
  INITIAL_EVENTS,
} from './demo-data';
import {
  dbGetTeam,
  dbAddTeamMember,
  dbUpdateTeamMember,
  dbDeleteTeamMember,
  dbGetNews,
  dbAddNews,
  dbUpdateNews,
  dbDeleteNews,
  dbGetVacancies,
  dbAddVacancy,
  dbUpdateVacancy,
  dbDeleteVacancy,
  dbGetObjectives,
  dbAddObjective,
  dbUpdateObjective,
  dbDeleteObjective,
  dbGetUsers,
  dbAddUser,
  dbUpdateUser,
  dbDeleteUser,
  dbGetActivities,
  dbLogActivity,
  dbGetSettings,
  dbUpdateSetting,
  dbGetTools,
  dbAddTool,
  dbUpdateTool,
  dbDeleteTool,
  dbGetVideos,
  dbAddVideo,
  dbUpdateVideo,
  dbDeleteVideo,
  dbGetEvents,
  dbAddEvent,
  dbUpdateEvent,
  dbDeleteEvent,
} from './supabase-db';
import { setCookie, deleteCookie } from './cookies';
import { api } from './api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AdminContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLiveBackend: boolean;
  login: (asRoleOrEmail?: string) => void;
  loginWithUser: (user: AdminUser, token?: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  refreshBackendData: (force?: boolean) => Promise<void>;

  // Permissions
  isAdmin: boolean;
  isModerator: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageEmployees: boolean;
  adminOnlyProvisioning: boolean;
  toggleAdminOnlyProvisioning: () => void;

  // Users Management
  users: AdminUser[];
  addUser: (userData: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<AdminUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Team CRUD
  team: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;

  // News CRUD
  news: NewsArticle[];
  addNews: (item: Omit<NewsArticle, 'id'>) => Promise<void>;
  updateNews: (id: string, item: Partial<NewsArticle>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;

  // Vacancies CRUD
  vacancies: Vacancy[];
  addVacancy: (item: Omit<Vacancy, 'id'>) => Promise<void>;
  updateVacancy: (id: string, item: Partial<Vacancy>) => Promise<void>;
  deleteVacancy: (id: string) => Promise<void>;

  // Objectives
  objectives: ResearchObjective[];
  addObjective: (item: ResearchObjective) => Promise<void>;
  updateObjective: (id: string, item: Partial<ResearchObjective>) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;

  // Showcase Tools CRUD
  tools: Tool[];
  addTool: (item: Omit<Tool, 'id'>) => Promise<void>;
  updateTool: (id: string, item: Partial<Tool>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;

  // BDAI Videos CRUD
  videos: AdminVideo[];
  addVideo: (item: Omit<AdminVideo, 'id'>) => Promise<void>;
  updateVideo: (id: string, item: Partial<AdminVideo>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;

  // Events (Held & Upcoming) CRUD
  events: EventItem[];
  addEvent: (item: Omit<EventItem, 'id'>) => Promise<void>;
  updateEvent: (id: string, item: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  activities: ActivityLog[];
  resetToDemoData: () => void;

  // Dynamic Site Settings
  settings: Record<string, any>;
  updateSiteSetting: (id: string, data: any) => Promise<void>;

  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Cache validity duration (5 minutes) to protect database from method overload & resource exhaustion
const CACHE_TTL_MS = 5 * 60 * 1000;

const STORAGE_KEYS = {
  USER: 'bdai_admin_user',
  USERS: 'bdai_admin_users',
  TEAM: 'bdai_admin_team',
  NEWS: 'bdai_admin_news',
  VACANCIES: 'bdai_admin_vacancies',
  OBJECTIVES: 'bdai_admin_objectives',
  TOOLS: 'bdai_admin_tools',
  VIDEOS: 'bdai_admin_videos',
  EVENTS: 'bdai_admin_events',
  ACTIVITIES: 'bdai_admin_activities',
  SETTINGS: 'bdai_admin_site_settings',
  ADMIN_PROVISIONING: 'bdai_admin_provisioning_policy',
  CACHE_TIMESTAMP: 'bdai_admin_cache_timestamp',
};

function normalizeEvent(e: any): EventItem {
  return {
    id: e.id,
    title: e.title,
    date: e.date,
    status: e.status || 'held',
    category: e.category || 'Event',
    location: e.location || '',
    description: e.description || '',
    banner: e.banner || '',
    gallery: Array.isArray(e.gallery) ? e.gallery : [],
    order: e.order ?? 0,
    createdAt: e.createdAt || e.created_at,
    updatedAt: e.updatedAt || e.updated_at,
  };
}

function normalizeVideo(v: any): AdminVideo {
  return {
    id: v.id,
    title: v.title,
    url: v.url,
    thumbnail: v.thumbnail || '',
    description: v.description || '',
    postedAt: v.postedAt || v.posted_at || '',
    order: v.order ?? 0,
    createdAt: v.createdAt || v.created_at,
    updatedAt: v.updatedAt || v.updated_at,
  };
}


function normalizeTool(t: any): Tool {
  return {
    id: t.id,
    title: t.title,
    subtitle: t.subtitle || '',
    description: t.description || '',
    abstract: t.abstract || t.abstract_text || '',
    paperUrl: t.paperUrl || t.paper_url || '',
    sourceUrl: t.sourceUrl || t.source_url || '',
    platformUrl: t.platformUrl || t.platform_url || '',
    videoUrl: t.videoUrl || t.video_url || '',
    imageUrl: t.imageUrl || t.image_url || '',
    authors: t.authors || '',
    features: Array.isArray(t.features) ? t.features : [],
    order: t.order ?? t.display_order ?? 0,
    badge: t.badge || 'Tool Showcase',
    createdAt: t.createdAt || t.created_at,
    updatedAt: t.updatedAt || t.updated_at,
  };
}

// Normalization helpers between Rust snake_case and frontend models
function normalizeTeamMember(m: any): TeamMember {
  let category = (m.category || '').trim();
  if (category.toLowerCase() === 'lead' || category.toLowerCase() === 'co-lead') {
    category = 'SPM Team';
  } else if (category.toLowerCase() === 'research-assistant' || category.toLowerCase() === 'researcher') {
    const des = (m.designation || '').toLowerCase();
    const role = (m.role || '').toLowerCase();
    if (des.includes('annotat') || role.includes('annotat')) {
      category = 'Data Annotators';
    } else {
      category = 'Student Researchers';
    }
  } else if (category.toLowerCase() === 'staff') {
    category = 'Administrative Staff';
  } else if (!category) {
    const des = (m.designation || '').toLowerCase();
    const role = (m.role || '').toLowerCase();
    if (des.includes('spm') || des.includes('professor') || role.includes('spm')) {
      category = 'SPM Team';
    } else if (des.includes('annotat') || role.includes('annotat')) {
      category = 'Data Annotators';
    } else if (des.includes('manager') || des.includes('accountant') || des.includes('office')) {
      category = 'Administrative Staff';
    } else {
      category = 'Student Researchers';
    }
  }

  return {
    id: m.id,
    name: m.name,
    designation: m.designation,
    role: m.role || '',
    category: category,
    institution: m.institution || 'Department of Computer Science and Engineering, University of Chittagong',
    email: m.email || '',
    bio: m.bio || '',
    image: m.image || '/team/miskat.jpg',
    scholarUrl: m.scholar_url || m.scholarUrl || '',
    linkedinUrl: m.linkedin_url || m.linkedinUrl || '',
    order: m.display_order ?? m.order ?? 0,
  };
}

function normalizeVacancy(v: any): Vacancy {
  return {
    id: v.id,
    title: v.title,
    department: v.department || '',
    workPackage: v.work_package || v.workPackage || '',
    type: v.notice_type || v.type || '',
    location: v.location || '',
    deadline: typeof v.deadline === 'string' ? v.deadline.split('T')[0] : v.deadline,
    status: v.status || 'open',
    description: v.description || '',
    requirements: Array.isArray(v.requirements) ? v.requirements : [],
    applicantCount: v.applicant_count ?? v.applicantCount ?? 0,
  };
}

function normalizeNews(n: any): NewsArticle {
  return {
    id: n.id,
    title: n.title,
    slug: n.slug,
    excerpt: n.excerpt || '',
    content: n.content || '',
    category: n.category || 'news',
    publishDate: typeof n.publish_date === 'string' ? n.publish_date.split('T')[0] : (n.publishDate || ''),
    author: n.author || '',
    status: n.status || 'published',
    featured: !!n.featured,
    tags: Array.isArray(n.tags) ? n.tags : [],
  };
}

function normalizeUser(u: any): AdminUser {
  return {
    id: u.id,
    name: u.name,
    username: u.username || (u.email ? u.email.split('@')[0] : ''),
    email: u.email,
    role: u.role,
    avatar: u.avatar || '/team/miskat.jpg',
    department: u.department || '',
    status: u.status || 'active',
    createdAt: typeof u.created_at === 'string' ? u.created_at.split('T')[0] : (u.createdAt || ''),
  };
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.exp === 'number') {
      return payload.exp * 1000 <= Date.now();
    }
    return false;
  } catch {
    return false;
  }
}

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);
  const [objectives, setObjectives] = useState<ResearchObjective[]>(INITIAL_OBJECTIVES);
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [videos, setVideos] = useState<AdminVideo[]>(INITIAL_VIDEOS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [adminOnlyProvisioning, setAdminOnlyProvisioning] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);

  // Load initial local cache on client mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        // If old mock accounts exist in localStorage, reset to registered accounts only
        if (Array.isArray(parsed) && parsed.some((u: any) => u.id?.startsWith('usr_admin_2') || u.id?.startsWith('usr_mod_'))) {
          setUsers(INITIAL_USERS);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        } else {
          setUsers(parsed);
        }
      }

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem('bdai_auth_token');
      if (storedUser) {
        if (storedToken && isTokenExpired(storedToken)) {
          console.warn('JWT session expired. Clearing authentication state.');
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem('bdai_auth_token');
          deleteCookie('bdai_user_session');
          deleteCookie('bdai_access_token');
          deleteCookie('access_token');
          setUser(null);
        } else {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
      }

      const storedTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
      if (storedTeam) setTeam(JSON.parse(storedTeam));

      const storedNews = localStorage.getItem(STORAGE_KEYS.NEWS);
      if (storedNews) setNews(JSON.parse(storedNews));

      const storedVacancies = localStorage.getItem(STORAGE_KEYS.VACANCIES);
      if (storedVacancies) setVacancies(JSON.parse(storedVacancies));

      const storedObjectives = localStorage.getItem(STORAGE_KEYS.OBJECTIVES);
      if (storedObjectives) setObjectives(JSON.parse(storedObjectives));

      const storedTools = localStorage.getItem(STORAGE_KEYS.TOOLS);
      if (storedTools) setTools(JSON.parse(storedTools));

      const storedVideos = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (storedVideos) setVideos(JSON.parse(storedVideos));

      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (storedEvents) setEvents(JSON.parse(storedEvents));

      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (storedActivities) setActivities(JSON.parse(storedActivities));

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      const storedProv = localStorage.getItem(STORAGE_KEYS.ADMIN_PROVISIONING);
      if (storedProv !== null) setAdminOnlyProvisioning(JSON.parse(storedProv));
    } catch (e) {
      console.error('Failed to load local admin cache', e);
    }
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const recordActivity = (action: string, entity: string, targetName: string) => {
    const newAct: ActivityLog = {
      id: 'act_' + Date.now(),
      action,
      entity,
      targetName,
      timestamp: 'Just now',
      user: user?.name || 'Admin',
    };
    const updated = [newAct, ...activities.slice(0, 19)];
    setActivities(updated);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    dbLogActivity(action, entity, targetName, user?.name || 'Admin').catch(() => {});
  };

  // Sync data from live Rust Backend / Supabase PostgreSQL with smart caching
  const refreshBackendData = useCallback(async (force = false) => {
    // If not forced and local cache is populated and fresh, do NOT exhaust the database with extra calls
    if (!force && typeof window !== 'undefined') {
      try {
        const lastSync = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP);
        const hasCachedTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
        const hasCachedNews = localStorage.getItem(STORAGE_KEYS.NEWS);
        if (hasCachedTeam && hasCachedNews && lastSync) {
          const age = Date.now() - Number(lastSync);
          if (age < CACHE_TTL_MS) {
            // Cache is fresh: avoid redundant method calls to Supabase
            setIsLiveBackend(true);
            return;
          }
        }
      } catch {
        // Fall through to network on storage access error
      }
    }

    try {
      const [teamRes, newsRes, vacRes, objRes, usersRes, actRes, settingsRes, toolsRes, videosRes, eventsRes] = await Promise.allSettled([
        dbGetTeam(),
        dbGetNews(),
        dbGetVacancies(),
        dbGetObjectives(),
        dbGetUsers(),
        dbGetActivities(),
        dbGetSettings(),
        dbGetTools(),
        dbGetVideos(),
        dbGetEvents(),
      ]);

      let backendActive = false;

      if (teamRes.status === 'fulfilled' && Array.isArray(teamRes.value)) {
        const normalized = teamRes.value.map(normalizeTeamMember);
        setTeam(normalized);
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(normalized));
        backendActive = true;
      }

      if (newsRes.status === 'fulfilled' && Array.isArray(newsRes.value)) {
        const normalized = newsRes.value.map(normalizeNews);
        setNews(normalized);
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(normalized));
        backendActive = true;
      }

      if (vacRes.status === 'fulfilled' && Array.isArray(vacRes.value)) {
        const normalized = vacRes.value.map(normalizeVacancy);
        setVacancies(normalized);
        localStorage.setItem(STORAGE_KEYS.VACANCIES, JSON.stringify(normalized));
        backendActive = true;
      }

      if (objRes.status === 'fulfilled' && Array.isArray(objRes.value)) {
        setObjectives(objRes.value as any);
        localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(objRes.value));
        backendActive = true;
      }

      if (toolsRes.status === 'fulfilled' && Array.isArray(toolsRes.value) && toolsRes.value.length > 0) {
        const normalized = toolsRes.value.map(normalizeTool);
        setTools(normalized);
        localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(normalized));
        backendActive = true;
      }

      if (videosRes.status === 'fulfilled' && Array.isArray(videosRes.value) && videosRes.value.length > 0) {
        const normalized = videosRes.value.map(normalizeVideo);
        setVideos(normalized);
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(normalized));
        backendActive = true;
      }

      if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value) && eventsRes.value.length > 0) {
        const normalized = eventsRes.value.map(normalizeEvent);
        setEvents(normalized);
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(normalized));
        backendActive = true;
      }

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        const normalized = usersRes.value.map(normalizeUser);
        setUsers(normalized);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(normalized));
        backendActive = true;
      }

      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value)) {
        const normalized = actRes.value.map((a: any) => ({
          id: a.id || 'act_' + Date.now(),
          action: a.action,
          entity: a.entity,
          targetName: a.target_name,
          timestamp: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          user: a.user_name,
        }));
        setActivities(normalized);
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(normalized));
      }

      if (settingsRes.status === 'fulfilled' && typeof settingsRes.value === 'object' && settingsRes.value !== null) {
        setSettings(settingsRes.value);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsRes.value));
        backendActive = true;
      }

      if (backendActive && typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
        } catch {}
      }

      setIsLiveBackend(backendActive);
    } catch {
      setIsLiveBackend(false);
    }
  }, []);

  // Trigger sync on mount and after authentication change
  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData, user]);

  // Login handler
  const login = (roleOrUsernameOrEmail = 'Admin') => {
    const q = roleOrUsernameOrEmail.toLowerCase();
    let matchedUser = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === q) ||
        u.email.toLowerCase() === q ||
        u.role.toLowerCase() === q
    );

    if (!matchedUser) {
      matchedUser = {
        ...DEMO_ADMIN_USER,
        role: (roleOrUsernameOrEmail.toLowerCase() === 'moderator' ? 'Moderator' : 'Admin') as UserRole,
      };
    }

    setUser(matchedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(matchedUser));
    showToast(`Signed in as ${matchedUser.name} (${matchedUser.role})`, 'success');
  };

  const loginWithUser = (userData: AdminUser, token?: string) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setCookie('bdai_user_session', userData.username || userData.email, 3);
    if (token) {
      localStorage.setItem('bdai_auth_token', token);
      setCookie('bdai_access_token', token, 3);
    }
    showToast(`Signed in as ${userData.name} (${userData.role})`, 'success');
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setUser(target);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(target));
      setCookie('bdai_user_session', target.username || target.email, 3);
      showToast(`Switched active profile to ${target.name} (${target.role})`, 'info');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('bdai_auth_token');
    deleteCookie('bdai_user_session');
    deleteCookie('bdai_access_token');
    api.logout().catch(() => {});
    showToast('Signed out of admin console', 'info');
  };

  // Permissions
  const isAdmin = user?.role === 'Admin';
  const isModerator = user?.role === 'Moderator';
  const canEdit = isAdmin || isModerator;
  const canDelete = isAdmin;
  const canManageUsers = isAdmin;
  const canManageEmployees = adminOnlyProvisioning ? isAdmin : (isAdmin || isModerator);

  const toggleAdminOnlyProvisioning = () => {
    if (!isAdmin) {
      showToast('Permission denied: Only Admins can modify administrative security options', 'error');
      return;
    }
    const nextVal = !adminOnlyProvisioning;
    setAdminOnlyProvisioning(nextVal);
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROVISIONING, JSON.stringify(nextVal));
    showToast(
      nextVal
        ? 'Admin Privilege Option: Only Admin can Add/Remove users and all kinds of employees'
        : 'Admin Provisioning relaxed',
      'info'
    );
  };

  // User Management CRUD with Backend Persistence
  const addUser = async (userData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    if (!isAdmin) {
      showToast('Permission denied: Only Admins can add an Admin or Moderator', 'error');
      return;
    }
    const tempId = 'usr_' + Date.now();
    const newUser: AdminUser = {
      ...userData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);

    try {
      const res = await dbAddUser({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password || 'admin123',
        role: userData.role,
        avatar: userData.avatar,
        department: userData.department,
        status: userData.status,
      });
      setUsers((prev) => prev.map((u) => (u.id === tempId ? normalizeUser(res) : u)));
      showToast(`Added ${userData.name} as ${userData.role} (synced to database)`, 'success');
    } catch {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, newUser]));
      showToast(`Added ${newUser.name} as ${newUser.role} (cached locally)`, 'info');
    }
    recordActivity('Created User', 'User', `${newUser.name} (${newUser.role})`);
  };

  const updateUser = async (id: string, userData: Partial<AdminUser>) => {
    if (!isAdmin) {
      showToast('Permission denied: Only Admins can modify user accounts', 'error');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));

    try {
      const res = await dbUpdateUser(id, userData);
      setUsers((prev) => prev.map((u) => (u.id === id ? normalizeUser(res) : u)));
      showToast('User record updated in database', 'success');
    } catch {
      showToast('User record updated locally', 'info');
    }

    if (user?.id === id) {
      const updatedSelf = { ...user, ...userData };
      setUser(updatedSelf);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedSelf));
    }
    recordActivity('Updated User', 'User', id);
  };

  const deleteUser = async (id: string) => {
    if (!isAdmin) {
      showToast('Permission denied: Only Admins can remove an Admin or Moderator', 'error');
      return;
    }
    if (user?.id === id) {
      showToast('Cannot delete your own active account', 'error');
      return;
    }
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));

    try {
      await dbDeleteUser(id);
      showToast('User removed from database', 'info');
    } catch {
      showToast('User removed locally', 'info');
    }
    if (target) recordActivity('Deleted User', 'User', `${target.name} (${target.role})`);
  };

  // Team CRUD with Backend Persistence
  const addTeamMember = async (memberData: Omit<TeamMember, 'id'>) => {
    if (adminOnlyProvisioning && !isAdmin) {
      showToast('Permission denied: Only Admins can add employees', 'error');
      return;
    } else if (!canEdit) {
      showToast('Only Admins and Moderators can add employees', 'error');
      return;
    }

    const tempId = 'team_' + Date.now();
    const optimisticMember: TeamMember = {
      ...memberData,
      id: tempId,
    };
    setTeam((prev) => [optimisticMember, ...prev]);

    try {
      const res = await dbAddTeamMember({
        name: memberData.name,
        designation: memberData.designation,
        role: memberData.role || null,
        category: memberData.category || null,
        institution: memberData.institution || 'Department of Computer Science and Engineering, University of Chittagong',
        email: memberData.email || null,
        bio: memberData.bio || null,
        image: memberData.image || null,
        scholar_url: memberData.scholarUrl || null,
        linkedin_url: memberData.linkedinUrl || null,
        display_order: memberData.order ?? 0,
      });
      setTeam((prev) => prev.map((m) => (m.id === tempId ? normalizeTeamMember(res) : m)));
      showToast(`Added ${memberData.name} (synced to database)`, 'success');
    } catch {
      showToast(`Added ${memberData.name} (cached locally)`, 'info');
    }
    recordActivity('Added Employee', 'Team Member', `${memberData.name} (${memberData.designation})`);
  };

  const updateTeamMember = async (id: string, memberData: Partial<TeamMember>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can edit employees', 'error');
      return;
    }
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, ...memberData } : m)));

    try {
      const res = await dbUpdateTeamMember(id, {
        name: memberData.name,
        designation: memberData.designation,
        role: memberData.role,
        category: memberData.category,
        institution: memberData.institution,
        email: memberData.email,
        bio: memberData.bio,
        image: memberData.image,
        scholar_url: memberData.scholarUrl,
        linkedin_url: memberData.linkedinUrl,
        display_order: memberData.order,
      });
      setTeam((prev) => prev.map((m) => (m.id === id ? normalizeTeamMember(res) : m)));
      showToast('Employee updated in database', 'success');
    } catch {
      showToast('Employee record updated locally', 'info');
    }
    recordActivity('Updated Employee', 'Team Member', memberData.name || id);
  };

  const deleteTeamMember = async (id: string) => {
    if (adminOnlyProvisioning && !isAdmin) {
      showToast('Permission denied: Only Admins can remove employees', 'error');
      return;
    } else if (!canDelete) {
      showToast('Only Admins can remove employees', 'error');
      return;
    }
    const target = team.find((m) => m.id === id);
    setTeam((prev) => prev.filter((m) => m.id !== id));

    try {
      await dbDeleteTeamMember(id);
      showToast('Employee removed from database', 'info');
    } catch {
      showToast('Employee removed locally', 'info');
    }
    if (target) recordActivity('Removed Employee', 'Team Member', target.name);
  };

  // News CRUD with Backend Persistence
  const addNews = async (newsData: Omit<NewsArticle, 'id'>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can publish articles', 'error');
      return;
    }
    const tempId = 'news_' + Date.now();
    const newArticle: NewsArticle = { ...newsData, id: tempId };
    setNews((prev) => [newArticle, ...prev]);

    try {
      const res = await dbAddNews({
        title: newsData.title,
        slug: newsData.slug,
        excerpt: newsData.excerpt,
        content: newsData.content,
        category: newsData.category,
        publish_date: newsData.publishDate,
        author: newsData.author,
        status: newsData.status,
        featured: newsData.featured,
        tags: newsData.tags,
      });
      setNews((prev) => prev.map((n) => (n.id === tempId ? normalizeNews(res) : n)));
      showToast('News article published & saved to database', 'success');
    } catch {
      showToast('News article published locally', 'info');
    }
    recordActivity('Created', 'News Article', newsData.title);
  };

  const updateNews = async (id: string, newsData: Partial<NewsArticle>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can edit news articles', 'error');
      return;
    }
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, ...newsData } : n)));

    try {
      const res = await dbUpdateNews(id, {
        title: newsData.title,
        slug: newsData.slug,
        excerpt: newsData.excerpt,
        content: newsData.content,
        category: newsData.category,
        publish_date: newsData.publishDate,
        author: newsData.author,
        status: newsData.status,
        featured: newsData.featured,
        tags: newsData.tags,
      });
      setNews((prev) => prev.map((n) => (n.id === id ? normalizeNews(res) : n)));
      showToast('News article updated in database', 'success');
    } catch {
      showToast('News article updated locally', 'info');
    }
    recordActivity('Updated', 'News Article', newsData.title || id);
  };

  const deleteNews = async (id: string) => {
    if (!canDelete) {
      showToast('Only Admins can delete articles', 'error');
      return;
    }
    const target = news.find((n) => n.id === id);
    setNews((prev) => prev.filter((n) => n.id !== id));

    try {
      await dbDeleteNews(id);
      showToast('News article deleted from database', 'info');
    } catch {
      showToast('News article deleted locally', 'info');
    }
    if (target) recordActivity('Deleted', 'News Article', target.title);
  };

  // Vacancies CRUD with Backend Persistence
  const addVacancy = async (vacData: Omit<Vacancy, 'id'>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can post vacancy notices', 'error');
      return;
    }
    const tempId = 'vac_' + Date.now();
    const newVac: Vacancy = { ...vacData, id: tempId };
    setVacancies((prev) => [newVac, ...prev]);

    try {
      const res = await dbAddVacancy({
        title: vacData.title,
        department: vacData.department,
        work_package: vacData.workPackage,
        notice_type: vacData.type,
        location: vacData.location,
        deadline: vacData.deadline,
        status: vacData.status,
        description: vacData.description,
        requirements: vacData.requirements,
        applicant_count: vacData.applicantCount,
      });
      setVacancies((prev) => prev.map((v) => (v.id === tempId ? normalizeVacancy(res) : v)));
      showToast('Vacancy notice posted & saved to database', 'success');
    } catch {
      showToast('Vacancy notice posted locally', 'info');
    }
    recordActivity('Posted', 'Vacancy', vacData.title);
  };

  const updateVacancy = async (id: string, vacData: Partial<Vacancy>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can edit vacancy notices', 'error');
      return;
    }
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, ...vacData } : v)));

    try {
      const res = await dbUpdateVacancy(id, {
        title: vacData.title,
        department: vacData.department,
        work_package: vacData.workPackage,
        notice_type: vacData.type,
        location: vacData.location,
        deadline: vacData.deadline,
        status: vacData.status,
        description: vacData.description,
        requirements: vacData.requirements,
        applicant_count: vacData.applicantCount,
      });
      setVacancies((prev) => prev.map((v) => (v.id === id ? normalizeVacancy(res) : v)));
      showToast('Vacancy notice updated in database', 'success');
    } catch {
      showToast('Vacancy notice updated locally', 'info');
    }
    recordActivity('Updated', 'Vacancy', vacData.title || id);
  };

  const deleteVacancy = async (id: string) => {
    if (!canDelete) {
      showToast('Only Admins can remove vacancy notices', 'error');
      return;
    }
    const target = vacancies.find((v) => v.id === id);
    setVacancies((prev) => prev.filter((v) => v.id !== id));

    try {
      await dbDeleteVacancy(id);
      showToast('Vacancy notice removed from database', 'info');
    } catch {
      showToast('Vacancy notice removed locally', 'info');
    }
    if (target) recordActivity('Removed', 'Vacancy', target.title);
  };

  // Objectives update with Backend Persistence
  const updateObjective = async (id: string, objData: Partial<ResearchObjective>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can update milestone goals', 'error');
      return;
    }
    setObjectives((prev) => prev.map((o) => (o.id === id ? { ...o, ...objData } : o)));

    try {
      const res = await dbUpdateObjective(id, objData);
      setObjectives((prev) => prev.map((o) => (o.id === id ? (res as ResearchObjective) : o)));
      showToast(`Objective ${id} updated in database`, 'success');
    } catch {
      showToast(`Objective ${id} updated locally`, 'info');
    }
    recordActivity('Updated Milestone', 'Objective', `${id}: ${objData.progress ?? ''}%`);
  };

  const addObjective = async (objData: ResearchObjective) => {
    if (!isAdmin) {
      showToast('Only Admins can create new research objectives', 'error');
      return;
    }
    setObjectives((prev) => [...prev, objData]);

    try {
      const res = await dbAddObjective(objData);
      setObjectives((prev) => prev.map((o) => (o.id === objData.id ? (res as ResearchObjective) : o)));
      showToast(`Objective ${objData.id} created in database`, 'success');
    } catch {
      showToast(`Objective ${objData.id} created locally`, 'info');
    }
    recordActivity('Created Milestone', 'Objective', objData.id);
  };

  const deleteObjective = async (id: string) => {
    if (!isAdmin) {
      showToast('Only Admins can delete research objectives', 'error');
      return;
    }
    setObjectives((prev) => prev.filter((o) => o.id !== id));

    try {
      await dbDeleteObjective(id);
      showToast(`Objective ${id} deleted from database`, 'info');
    } catch {
      showToast(`Objective ${id} deleted locally`, 'info');
    }
    recordActivity('Deleted Milestone', 'Objective', id);
  };

  // Tools CRUD
  const addTool = async (toolData: Omit<Tool, 'id'>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can add showcase tools', 'error');
      return;
    }
    const slug =
      toolData.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || ('tool_' + Date.now());

    const optimisticTool: Tool = {
      ...toolData,
      id: slug,
      features: toolData.features || [],
      order: toolData.order ?? tools.length + 1,
      badge: toolData.badge || 'Tool Showcase',
    };

    setTools((prev) => [...prev, optimisticTool].sort((a, b) => a.order - b.order));

    try {
      await dbAddTool(
        {
          id: slug,
          title: toolData.title,
          subtitle: toolData.subtitle,
          description: toolData.description,
          abstract_text: toolData.abstract,
          paper_url: toolData.paperUrl,
          source_url: toolData.sourceUrl,
          platform_url: toolData.platformUrl,
          video_url: toolData.videoUrl,
          image_url: toolData.imageUrl,
          authors: toolData.authors,
          features: toolData.features,
          display_order: toolData.order,
          badge: toolData.badge,
        },
        user?.name || 'Admin'
      );
      showToast(`Added tool "${toolData.title}" (synced to database)`, 'success');
    } catch {
      showToast(`Added tool "${toolData.title}" (cached locally)`, 'info');
    }
    recordActivity('Added Tool', 'Tool', toolData.title);
  };

  const updateTool = async (id: string, toolData: Partial<Tool>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can edit showcase tools', 'error');
      return;
    }
    setTools((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, ...toolData } : t))
        .sort((a, b) => a.order - b.order)
    );

    try {
      await dbUpdateTool(
        id,
        {
          title: toolData.title,
          subtitle: toolData.subtitle,
          description: toolData.description,
          abstract_text: toolData.abstract,
          paper_url: toolData.paperUrl,
          source_url: toolData.sourceUrl,
          platform_url: toolData.platformUrl,
          video_url: toolData.videoUrl,
          image_url: toolData.imageUrl,
          authors: toolData.authors,
          features: toolData.features,
          display_order: toolData.order,
          badge: toolData.badge,
        },
        user?.name || 'Admin'
      );
      showToast(`Updated tool "${toolData.title || id}" (synced to database)`, 'success');
    } catch {
      showToast(`Updated tool "${toolData.title || id}" (cached locally)`, 'info');
    }
    recordActivity('Updated Tool', 'Tool', toolData.title || id);
  };

  const deleteTool = async (id: string) => {
    if (!canDelete) {
      showToast('Only Admins can delete showcase tools', 'error');
      return;
    }
    const target = tools.find((t) => t.id === id);
    setTools((prev) => prev.filter((t) => t.id !== id));

    try {
      await dbDeleteTool(id, user?.name || 'Admin');
      showToast(`Tool "${target?.title || id}" deleted from database`, 'info');
    } catch {
      showToast(`Tool "${target?.title || id}" deleted locally`, 'info');
    }
    recordActivity('Deleted Tool', 'Tool', target?.title || id);
  };

  // Videos CRUD
  const addVideo = async (videoData: Omit<AdminVideo, 'id'>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can add videos', 'error');
      return;
    }
    const id =
      videoData.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || ('video_' + Date.now());

    const optimisticVideo: AdminVideo = {
      ...videoData,
      id,
      order: videoData.order ?? videos.length + 1,
      postedAt: videoData.postedAt || 'Recently added',
    };

    setVideos((prev) => [...prev, optimisticVideo].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

    try {
      await dbAddVideo(
        {
          id,
          title: videoData.title,
          url: videoData.url,
          thumbnail: videoData.thumbnail,
          description: videoData.description,
          posted_at: videoData.postedAt,
          order: videoData.order,
        },
        user?.name || 'Admin'
      );
      showToast(`Added video "${videoData.title}" (synced to database)`, 'success');
    } catch {
      showToast(`Added video "${videoData.title}" (cached locally)`, 'info');
    }
    recordActivity('Added Video', 'Video', videoData.title);
  };

  const updateVideo = async (id: string, videoData: Partial<AdminVideo>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can edit videos', 'error');
      return;
    }
    setVideos((prev) =>
      prev
        .map((v) => (v.id === id ? { ...v, ...videoData } : v))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );

    try {
      await dbUpdateVideo(
        id,
        {
          title: videoData.title,
          url: videoData.url,
          thumbnail: videoData.thumbnail,
          description: videoData.description,
          posted_at: videoData.postedAt,
          order: videoData.order,
        },
        user?.name || 'Admin'
      );
      showToast(`Updated video "${videoData.title || id}" (synced to database)`, 'success');
    } catch {
      showToast(`Updated video "${videoData.title || id}" (cached locally)`, 'info');
    }
    recordActivity('Updated Video', 'Video', videoData.title || id);
  };

  const deleteVideo = async (id: string) => {
    if (!canDelete) {
      showToast('Only Admins can delete videos', 'error');
      return;
    }
    const target = videos.find((v) => v.id === id);
    setVideos((prev) => prev.filter((v) => v.id !== id));

    try {
      await dbDeleteVideo(id, user?.name || 'Admin');
      showToast(`Video "${target?.title || id}" deleted from database`, 'info');
    } catch {
      showToast(`Video "${target?.title || id}" deleted locally`, 'info');
    }
    recordActivity('Deleted Video', 'Video', target?.title || id);
  };

  // Events (Held & Upcoming) CRUD
  const addEvent = async (eventData: Omit<EventItem, 'id'>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can add events', 'error');
      return;
    }
    const newId = 'event_' + Date.now();
    const optimisticEvent: EventItem = {
      ...eventData,
      id: newId,
      order: eventData.order ?? events.length + 1,
      gallery: eventData.gallery || [],
    };
    const nextEvents = [...events, optimisticEvent].sort((a, b) => a.order - b.order);
    setEvents(nextEvents);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(nextEvents));
      localStorage.removeItem('bdai_last_sync');
    }

    try {
      await dbAddEvent(
        {
          id: newId,
          title: eventData.title,
          date: eventData.date,
          status: eventData.status,
          category: eventData.category,
          location: eventData.location,
          description: eventData.description,
          banner: eventData.banner,
          gallery: eventData.gallery,
          order: optimisticEvent.order,
        },
        user?.name || 'Admin'
      );
      api.createEvent({
        id: newId,
        title: eventData.title,
        date: eventData.date,
        status: eventData.status,
        category: eventData.category,
        location: eventData.location,
        description: eventData.description,
        banner: eventData.banner,
        gallery: eventData.gallery,
        order: optimisticEvent.order,
      }).catch(() => {});

      showToast(`Added event "${eventData.title}" (synced to database)`, 'success');
    } catch {
      showToast(`Added event "${eventData.title}" (cached locally)`, 'info');
    }
    recordActivity('Added Event', 'Event', eventData.title);
  };

  const updateEvent = async (id: string, eventData: Partial<EventItem>) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can edit events', 'error');
      return;
    }
    const nextEvents = events
      .map((e) => (e.id === id ? { ...e, ...eventData } : e))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setEvents(nextEvents);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(nextEvents));
      localStorage.removeItem('bdai_last_sync');
    }

    try {
      await dbUpdateEvent(
        id,
        {
          title: eventData.title,
          date: eventData.date,
          status: eventData.status,
          category: eventData.category,
          location: eventData.location,
          description: eventData.description,
          banner: eventData.banner,
          gallery: eventData.gallery,
          order: eventData.order,
        },
        user?.name || 'Admin'
      );
      api.updateEvent(id, eventData).catch(() => {});
      showToast(`Updated event "${eventData.title || id}" (synced to database)`, 'success');
    } catch {
      showToast(`Updated event "${eventData.title || id}" (cached locally)`, 'info');
    }
    recordActivity('Updated Event', 'Event', eventData.title || id);
  };

  const deleteEvent = async (id: string) => {
    if (!canEdit) {
      showToast('Only Admins and Moderators can delete events', 'error');
      return;
    }
    const targetId = String(id).trim();
    const target = events.find((e) => String(e.id).trim() === targetId || String((e as any).slug || '').trim() === targetId);
    const nextEvents = events.filter((e) => String(e.id).trim() !== targetId && String((e as any).slug || '').trim() !== targetId);
    setEvents(nextEvents);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(nextEvents));
      localStorage.removeItem('bdai_last_sync');
    }

    try {
      await dbDeleteEvent(targetId, user?.name || 'Admin');
      api.deleteEvent(targetId).catch(() => {});
      showToast(`Event "${target?.title || id}" deleted from database`, 'info');
    } catch {
      showToast(`Event "${target?.title || id}" deleted locally`, 'info');
    }
    recordActivity('Deleted Event', 'Event', target?.title || id);
  };

  const updateSiteSetting = async (id: string, data: any) => {
    try {
      await dbUpdateSetting(id, data, user?.name || 'Admin');
      setSettings((prev) => {
        const next = { ...prev, [id]: data };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));
        }
        return next;
      });
      showToast(`Section "${id}" updated successfully in database`, 'success');
    } catch (err: any) {
      showToast(`Failed to update "${id}": ${err.message}`, 'error');
      throw err;
    }
  };

  // Reset to Demo Defaults
  const resetToDemoData = () => {
    setUser(INITIAL_USERS[0]);
    setUsers(INITIAL_USERS);
    setTeam(INITIAL_TEAM_MEMBERS);
    setNews(INITIAL_NEWS);
    setVacancies(INITIAL_VACANCIES);
    setObjectives(INITIAL_OBJECTIVES);
    setTools(INITIAL_TOOLS);
    setVideos(INITIAL_VIDEOS);
    setEvents(INITIAL_EVENTS);
    setActivities(INITIAL_ACTIVITIES);
    setAdminOnlyProvisioning(true);

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(INITIAL_TEAM_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
    localStorage.setItem(STORAGE_KEYS.VACANCIES, JSON.stringify(INITIAL_VACANCIES));
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(INITIAL_OBJECTIVES));
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(INITIAL_TOOLS));
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROVISIONING, JSON.stringify(true));

    showToast('Demo data restored with Admin and Moderator accounts', 'info');
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitialized: mounted,
        isLiveBackend,
        login,
        loginWithUser,
        logout,
        switchUser,
        refreshBackendData,

        isAdmin,
        isModerator,
        canEdit,
        canDelete,
        canManageUsers,
        canManageEmployees,
        adminOnlyProvisioning,
        toggleAdminOnlyProvisioning,

        users,
        addUser,
        updateUser,
        deleteUser,

        team,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,

        news,
        addNews,
        updateNews,
        deleteNews,

        vacancies,
        addVacancy,
        updateVacancy,
        deleteVacancy,

        objectives,
        addObjective,
        updateObjective,
        deleteObjective,

        tools,
        addTool,
        updateTool,
        deleteTool,

        videos,
        addVideo,
        updateVideo,
        deleteVideo,

        events,
        addEvent,
        updateEvent,
        deleteEvent,

        activities,
        resetToDemoData,

        settings,
        updateSiteSetting,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
