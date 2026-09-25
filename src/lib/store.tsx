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
} from '@/types';
import {
  DEMO_ADMIN_USER,
  INITIAL_USERS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_NEWS,
  INITIAL_VACANCIES,
  INITIAL_OBJECTIVES,
  INITIAL_ACTIVITIES,
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
} from './supabase-db';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AdminContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
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

  activities: ActivityLog[];
  resetToDemoData: () => void;

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
  ACTIVITIES: 'bdai_admin_activities',
  ADMIN_PROVISIONING: 'bdai_admin_provisioning_policy',
  CACHE_TIMESTAMP: 'bdai_admin_cache_timestamp',
};

// Normalization helpers between Rust snake_case and frontend models
function normalizeTeamMember(m: any): TeamMember {
  return {
    id: m.id,
    name: m.name,
    designation: m.designation,
    role: m.role || '',
    category: m.category || '',
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
    email: u.email,
    role: u.role,
    avatar: u.avatar || '/team/miskat.jpg',
    department: u.department || '',
    status: u.status || 'active',
    createdAt: typeof u.created_at === 'string' ? u.created_at.split('T')[0] : (u.createdAt || ''),
  };
}

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);
  const [objectives, setObjectives] = useState<ResearchObjective[]>(INITIAL_OBJECTIVES);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [adminOnlyProvisioning, setAdminOnlyProvisioning] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);

  // Load initial local cache on client mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) setUsers(JSON.parse(storedUsers));

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
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

      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (storedActivities) setActivities(JSON.parse(storedActivities));

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
      const [teamRes, newsRes, vacRes, objRes, usersRes, actRes] = await Promise.allSettled([
        dbGetTeam(),
        dbGetNews(),
        dbGetVacancies(),
        dbGetObjectives(),
        dbGetUsers(),
        dbGetActivities(),
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
  const login = (roleOrEmail = 'Admin') => {
    let matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === roleOrEmail.toLowerCase() ||
        u.role.toLowerCase() === roleOrEmail.toLowerCase()
    );

    if (!matchedUser) {
      matchedUser = {
        ...DEMO_ADMIN_USER,
        role: (roleOrEmail === 'Moderator' ? 'Moderator' : 'Admin') as UserRole,
      };
    }

    setUser(matchedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(matchedUser));
    showToast(`Signed in as ${matchedUser.name} (${matchedUser.role})`, 'success');
  };

  const loginWithUser = (userData: AdminUser, token?: string) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    if (token) {
      localStorage.setItem('bdai_auth_token', token);
    }
    showToast(`Signed in as ${userData.name} (${userData.role})`, 'success');
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setUser(target);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(target));
      showToast(`Switched active profile to ${target.name} (${target.role})`, 'info');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('bdai_auth_token');
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
        email: userData.email,
        password: 'admin123',
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

  // Reset to Demo Defaults
  const resetToDemoData = () => {
    setUser(INITIAL_USERS[0]);
    setUsers(INITIAL_USERS);
    setTeam(INITIAL_TEAM_MEMBERS);
    setNews(INITIAL_NEWS);
    setVacancies(INITIAL_VACANCIES);
    setObjectives(INITIAL_OBJECTIVES);
    setActivities(INITIAL_ACTIVITIES);
    setAdminOnlyProvisioning(true);

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(INITIAL_TEAM_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
    localStorage.setItem(STORAGE_KEYS.VACANCIES, JSON.stringify(INITIAL_VACANCIES));
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(INITIAL_OBJECTIVES));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROVISIONING, JSON.stringify(true));

    showToast('Demo data restored with Admin and Moderator accounts', 'info');
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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

        activities,
        resetToDemoData,

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
