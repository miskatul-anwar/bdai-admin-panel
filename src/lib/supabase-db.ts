import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import { getEventTimestamp } from './date-utils';

export interface DbTeamMember {
  id?: string;
  name: string;
  designation: string;
  role?: string | null;
  category?: string | null;
  institution?: string;
  email?: string | null;
  bio?: string | null;
  image?: string | null;
  scholar_url?: string | null;
  linkedin_url?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbNewsArticle {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  publish_date: string;
  author: string;
  status: string;
  featured: boolean;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DbVacancy {
  id?: string;
  title: string;
  department: string;
  work_package: string;
  notice_type: string;
  location: string;
  deadline: string;
  status: string;
  description: string;
  requirements: string[];
  applicant_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbResearchObjective {
  id: string;
  title: string;
  details: string;
  researcher: string;
  sector: string;
  status: string;
  progress: number;
  deliverables: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbUser {
  id?: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  password_hash?: string;
  role: 'Admin' | 'Moderator';
  avatar?: string;
  department?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbActivityLog {
  id?: string;
  action: string;
  entity: string;
  target_name: string;
  user_name: string;
  created_at?: string;
}

// ==========================================
// Team Members (Direct DB)
// ==========================================

export async function dbGetTeam(): Promise<DbTeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function dbAddTeamMember(member: DbTeamMember): Promise<DbTeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert([member])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function dbUpdateTeamMember(id: string, member: Partial<DbTeamMember>): Promise<DbTeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({ ...member, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function dbDeleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ==========================================
// News & Milestones (Direct DB)
// ==========================================

export async function dbGetNews(params?: { category?: string; status?: string }): Promise<DbNewsArticle[]> {
  let query = supabase.from('news_articles').select('*').order('publish_date', { ascending: false });

  if (params?.category) query = query.eq('category', params.category);
  if (params?.status) query = query.eq('status', params.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function dbAddNews(article: DbNewsArticle): Promise<DbNewsArticle> {
  const { data, error } = await supabase
    .from('news_articles')
    .insert([article])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function dbUpdateNews(id: string, article: Partial<DbNewsArticle>): Promise<DbNewsArticle> {
  const { data, error } = await supabase
    .from('news_articles')
    .update({ ...article, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function dbDeleteNews(id: string): Promise<void> {
  const { error } = await supabase
    .from('news_articles')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ==========================================
// Vacancies & Notices (Direct DB)
// ==========================================

export async function dbGetVacancies(params?: { notice_type?: string; status?: string }): Promise<DbVacancy[]> {
  let query = supabase.from('vacancies').select('*').order('deadline', { ascending: true });

  if (params?.notice_type) query = query.eq('notice_type', params.notice_type);
  if (params?.status) query = query.eq('status', params.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function dbAddVacancy(vac: DbVacancy): Promise<DbVacancy> {
  const { data, error } = await supabase
    .from('vacancies')
    .insert([vac])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function dbUpdateVacancy(id: string, vac: Partial<DbVacancy>): Promise<DbVacancy> {
  const { data, error } = await supabase
    .from('vacancies')
    .update({ ...vac, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function dbDeleteVacancy(id: string): Promise<void> {
  const { error } = await supabase
    .from('vacancies')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ==========================================
// Research Objectives (Direct DB)
// ==========================================

export async function dbGetObjectives(): Promise<DbResearchObjective[]> {
  const { data, error } = await supabase
    .from('research_objectives')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function dbAddObjective(obj: DbResearchObjective): Promise<DbResearchObjective> {
  const { data, error } = await supabase
    .from('research_objectives')
    .insert([obj])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function dbUpdateObjective(id: string, obj: Partial<DbResearchObjective>): Promise<DbResearchObjective> {
  const { data, error } = await supabase
    .from('research_objectives')
    .update({ ...obj, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function dbDeleteObjective(id: string): Promise<void> {
  const { error } = await supabase
    .from('research_objectives')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ==========================================
// Users (Direct DB - Admin Only)
// ==========================================

export async function dbGetUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, email, role, avatar, department, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DbUser[]) || [];
}

export async function dbAddUser(user: {
  name: string;
  username?: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Moderator';
  avatar?: string;
  department?: string;
  status?: string;
}): Promise<DbUser> {
  const passwordHash = bcrypt.hashSync(user.password || 'admin123', 10);
  const username = (user.username || user.email.split('@')[0]).trim().toLowerCase();

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name: user.name,
        username: username,
        email: user.email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: user.role,
        avatar: user.avatar || '/team/miskat.jpg',
        department: user.department || 'Department of CSE, University of Chittagong',
        status: user.status || 'active',
      },
    ])
    .select('id, name, username, email, role, avatar, department, status, created_at, updated_at')
    .single();

  if (error) throw new Error(error.message);
  return data as DbUser;
}

export async function dbUpdateUser(id: string, user: Partial<DbUser>): Promise<DbUser> {
  const updateData: any = { ...user, updated_at: new Date().toISOString() };
  if (user.password) {
    updateData.password_hash = bcrypt.hashSync(user.password, 10);
    delete updateData.password;
  }
  if (user.username) {
    updateData.username = user.username.trim().toLowerCase();
  }
  delete updateData.id;

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('id, name, username, email, role, avatar, department, status, created_at, updated_at')
    .single();

  if (error) throw new Error(error.message);
  return data as DbUser;
}

export async function dbDeleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ==========================================
// Activity Logs (Direct DB)
// ==========================================

export async function dbGetActivities(): Promise<DbActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function dbLogActivity(action: string, entity: string, target_name: string, user_name: string): Promise<void> {
  const { error } = await supabase
    .from('activity_logs')
    .insert([{ action, entity, target_name, user_name }]);

  if (error) console.error('Failed to log activity to DB:', error);
}

// ==========================================
// Site Settings (Dynamic Portal Content)
// ==========================================

export async function dbGetSettings(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('id, data, updated_at');

  if (error) {
    console.error('Failed to fetch site_settings:', error);
    return {};
  }
  const map: Record<string, any> = {};
  (data || []).forEach((row: any) => {
    map[row.id] = row.data;
  });
  return map;
}

export async function dbUpdateSetting(id: string, settingData: any, userName: string = 'Admin'): Promise<any> {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ id, data: settingData, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await dbLogActivity('Updated Site Setting', 'SiteSetting', id, userName);
  return data?.data;
}

// ==========================================
// Direct DB Authentication (Username + Password)
// ==========================================

export async function dbAuthenticate(usernameOrEmail: string, password: string): Promise<DbUser> {
  const clean = usernameOrEmail.trim().toLowerCase();

  // Try matching by username first
  let { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('username', clean)
    .maybeSingle();

  // Fallback to email
  if (!data) {
    const res = await supabase
      .from('users')
      .select('*')
      .ilike('email', clean)
      .maybeSingle();
    data = res.data;
    error = res.error;
  }

  if (error || !data) {
    throw new Error('Invalid username or password');
  }

  const isValid = bcrypt.compareSync(password, data.password_hash);
  if (!isValid) {
    throw new Error('Invalid username or password');
  }

  const { password_hash, ...safeUser } = data;
  return safeUser as DbUser;
}

// ==========================================
// Showcase Tools & Platforms
// ==========================================

export interface DbTool {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  abstract_text?: string;
  paper_url?: string;
  source_url?: string;
  platform_url?: string;
  video_url?: string;
  image_url?: string;
  authors?: string;
  features?: string[];
  display_order?: number;
  badge?: string;
  created_at?: string;
  updated_at?: string;
}

export async function dbGetTools(): Promise<DbTool[]> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('data')
    .eq('id', 'tools')
    .maybeSingle();

  if (error || !data) return [];
  const list = Array.isArray(data.data) ? data.data : [];
  list.sort((a: DbTool, b: DbTool) => (a.display_order ?? 0) - (b.display_order ?? 0));
  return list;
}

export async function dbAddTool(tool: DbTool, userName: string = 'Admin'): Promise<DbTool[]> {
  const current = await dbGetTools();
  const updated = [...current, tool];
  await dbUpdateSetting('tools', updated, userName);
  await dbLogActivity('Added Tool', 'Tool', tool.title, userName);
  return updated;
}

export async function dbUpdateTool(id: string, toolData: Partial<DbTool>, userName: string = 'Admin'): Promise<DbTool[]> {
  const current = await dbGetTools();
  const updated = current.map((t) => (t.id === id ? { ...t, ...toolData, updated_at: new Date().toISOString() } : t));
  await dbUpdateSetting('tools', updated, userName);
  await dbLogActivity('Updated Tool', 'Tool', toolData.title || id, userName);
  return updated;
}

export async function dbDeleteTool(id: string, userName: string = 'Admin'): Promise<DbTool[]> {
  const current = await dbGetTools();
  const toolToDelete = current.find((t) => t.id === id);
  const updated = current.filter((t) => t.id !== id);
  await dbUpdateSetting('tools', updated, userName);
  await dbLogActivity('Deleted Tool', 'Tool', toolToDelete?.title || id, userName);
  return updated;
}

// ==========================================
// BDAI Videos Showcase (Direct DB)
// ==========================================

export interface DbVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  posted_at?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export async function dbGetVideos(): Promise<DbVideo[]> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('data')
    .eq('id', 'videos')
    .maybeSingle();

  if (error || !data) return [];
  const list = Array.isArray(data.data) ? data.data : [];
  list.sort((a: DbVideo, b: DbVideo) => (a.order ?? 0) - (b.order ?? 0));
  return list;
}

export async function dbAddVideo(video: DbVideo, userName: string = 'Admin'): Promise<DbVideo[]> {
  const current = await dbGetVideos();
  const updated = [...current, video];
  await dbUpdateSetting('videos', updated, userName);
  await dbLogActivity('Added Video', 'Video', video.title, userName);
  return updated;
}

export async function dbUpdateVideo(id: string, videoData: Partial<DbVideo>, userName: string = 'Admin'): Promise<DbVideo[]> {
  const current = await dbGetVideos();
  const updated = current.map((v) => (v.id === id ? { ...v, ...videoData, updated_at: new Date().toISOString() } : v));
  await dbUpdateSetting('videos', updated, userName);
  await dbLogActivity('Updated Video', 'Video', videoData.title || id, userName);
  return updated;
}

export async function dbDeleteVideo(id: string, userName: string = 'Admin'): Promise<DbVideo[]> {
  const current = await dbGetVideos();
  const videoToDelete = current.find((v) => v.id === id);
  const updated = current.filter((v) => v.id !== id);
  await dbUpdateSetting('videos', updated, userName);
  await dbLogActivity('Deleted Video', 'Video', videoToDelete?.title || id, userName);
  return updated;
}

// ==========================================
// Events (Held & Upcoming) Showcase
// ==========================================

export interface DbEventGalleryItem {
  src: string;
  alt: string;
}

export interface DbEvent {
  id: string;
  title: string;
  date: string;
  date_iso?: string;
  status: 'held' | 'upcoming';
  category?: string;
  location?: string;
  description?: string;
  banner: string;
  gallery?: DbEventGalleryItem[];
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export async function dbGetEvents(): Promise<DbEvent[]> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('data')
    .eq('id', 'events')
    .maybeSingle();

  if (error || !data) return [];
  const list = Array.isArray(data.data) ? data.data : [];
  list.sort((a: DbEvent, b: DbEvent) => getEventTimestamp(b) - getEventTimestamp(a));
  return list;
}

export async function dbAddEvent(event: DbEvent, userName: string = 'Admin'): Promise<DbEvent[]> {
  const current = await dbGetEvents();
  const updated = [event, ...current.filter((e) => e.id !== event.id)];
  updated.sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));
  updated.forEach((e, idx) => {
    e.order = idx + 1;
  });
  await dbUpdateSetting('events', updated, userName);
  await dbLogActivity('Added Event', 'Event', event.title, userName);
  return updated;
}

export async function dbUpdateEvent(id: string, eventData: Partial<DbEvent>, userName: string = 'Admin'): Promise<DbEvent[]> {
  const current = await dbGetEvents();
  const updated = current.map((e) => (e.id === id ? { ...e, ...eventData, updated_at: new Date().toISOString() } : e));
  updated.sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));
  updated.forEach((e, idx) => {
    e.order = idx + 1;
  });
  await dbUpdateSetting('events', updated, userName);
  await dbLogActivity('Updated Event', 'Event', eventData.title || id, userName);
  return updated;
}

export async function dbDeleteEvent(id: string, userName: string = 'Admin'): Promise<DbEvent[]> {
  const current = await dbGetEvents();
  const targetId = String(id).trim();
  const eventToDelete = current.find(
    (e) => String(e.id).trim() === targetId || String((e as any).slug || '').trim() === targetId
  );
  const updated = current.filter(
    (e) => String(e.id).trim() !== targetId && String((e as any).slug || '').trim() !== targetId
  );
  updated.sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));
  updated.forEach((e, idx) => {
    e.order = idx + 1;
  });
  await dbUpdateSetting('events', updated, userName);
  if (eventToDelete) {
    await dbLogActivity('Deleted Event', 'Event', eventToDelete.title || id, userName);
  }
  return updated;
}


