/**
 * BDAI Backend API Client
 * Connects to the Rust Backend (Axum + Supabase PostgreSQL) at http://localhost:8080/api
 */

import { getCookie } from './cookies';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('bdai_auth_token') : null;
  if (!token) {
    token = getCookie('bdai_access_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Automatically passes and receives secure HTTP-only cookies
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Health
  checkHealth: () => apiRequest<{ status: string; database: string }>('/health'),

  // Auth (JWT Access Tokens & Cookies)
  login: (usernameOrEmail: string, password: string) =>
    apiRequest<{
      token: string;
      access_token: string;
      token_type: string;
      expires_in: number;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: usernameOrEmail, email: usernameOrEmail, password }),
    }),
  refreshToken: () =>
    apiRequest<{
      token: string;
      access_token: string;
      token_type: string;
      expires_in: number;
      user: any;
    }>('/auth/refresh', {
      method: 'POST',
    }),
  logout: () =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
  verifyToken: (token?: string) =>
    apiRequest<{ valid: boolean; claims?: any; message?: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  googleAuth: (payload: { credential?: string; code?: string; redirect_uri?: string }) =>
    apiRequest<{ token: string; access_token?: string; user: any }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getGoogleAuthUrl: () =>
    apiRequest<{ url: string; client_id?: string }>('/auth/google/url'),
  getMe: () => apiRequest<any>('/auth/me'),

  // Users (Admin Only)
  getUsers: () => apiRequest<any[]>('/users'),
  createUser: (userData: any) =>
    apiRequest<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  updateUser: (id: string, userData: any) =>
    apiRequest<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  deleteUser: (id: string) =>
    apiRequest<any>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Team / Employees (Admin Only for Add/Delete)
  getTeam: () => apiRequest<any[]>('/team'),
  createTeamMember: (memberData: any) =>
    apiRequest<any>('/team', {
      method: 'POST',
      body: JSON.stringify(memberData),
    }),
  updateTeamMember: (id: string, memberData: any) =>
    apiRequest<any>(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    }),
  deleteTeamMember: (id: string) =>
    apiRequest<any>(`/team/${id}`, {
      method: 'DELETE',
    }),

  // News
  getNews: (params?: { category?: string; status?: string }) => {
    const qs = params ? new URLSearchParams(params as any).toString() : '';
    return apiRequest<any[]>(`/news${qs ? `?${qs}` : ''}`);
  },
  createNews: (newsData: any) =>
    apiRequest<any>('/news', {
      method: 'POST',
      body: JSON.stringify(newsData),
    }),
  updateNews: (id: string, newsData: any) =>
    apiRequest<any>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newsData),
    }),
  deleteNews: (id: string) =>
    apiRequest<any>(`/news/${id}`, {
      method: 'DELETE',
    }),

  // Vacancies / Notices
  getVacancies: (params?: { notice_type?: string; status?: string }) => {
    const qs = params ? new URLSearchParams(params as any).toString() : '';
    return apiRequest<any[]>(`/vacancies${qs ? `?${qs}` : ''}`);
  },
  createVacancy: (vacData: any) =>
    apiRequest<any>('/vacancies', {
      method: 'POST',
      body: JSON.stringify(vacData),
    }),
  updateVacancy: (id: string, vacData: any) =>
    apiRequest<any>(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vacData),
    }),
  deleteVacancy: (id: string) =>
    apiRequest<any>(`/vacancies/${id}`, {
      method: 'DELETE',
    }),

  // Objectives
  getObjectives: () => apiRequest<any[]>('/objectives'),
  createObjective: (objData: any) =>
    apiRequest<any>('/objectives', {
      method: 'POST',
      body: JSON.stringify(objData),
    }),
  updateObjective: (id: string, objData: any) =>
    apiRequest<any>(`/objectives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(objData),
    }),
  deleteObjective: (id: string) =>
    apiRequest<any>(`/objectives/${id}`, {
      method: 'DELETE',
    }),

  // Activity logs
  getActivities: () => apiRequest<any[]>('/activities'),

  // Site Settings (Dynamic Portal Content)
  getSettings: () => apiRequest<Record<string, any>>('/settings'),
  getSetting: (id: string) => apiRequest<any>(`/settings/${id}`),
  updateSetting: (id: string, data: any) =>
    apiRequest<any>(`/settings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    }),

  // Consortium Partners & Affiliates
  getPartners: () => apiRequest<any[]>('/partners'),
  getPartner: (id: string) => apiRequest<any>(`/partners/${id}`),
  createPartner: (partnerData: any) =>
    apiRequest<any>('/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    }),
  updatePartner: (id: string, partnerData: any) =>
    apiRequest<any>(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    }),
  deletePartner: (id: string) =>
    apiRequest<any>(`/partners/${id}`, {
      method: 'DELETE',
    }),

  // Showcase Tools & Platforms
  getTools: () => apiRequest<any[]>('/tools'),
  getTool: (id: string) => apiRequest<any>(`/tools/${id}`),
  createTool: (toolData: any) =>
    apiRequest<any>('/tools', {
      method: 'POST',
      body: JSON.stringify(toolData),
    }),
  updateTool: (id: string, toolData: any) =>
    apiRequest<any>(`/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toolData),
    }),
  deleteTool: (id: string) =>
    apiRequest<any>(`/tools/${id}`, {
      method: 'DELETE',
    }),
};
