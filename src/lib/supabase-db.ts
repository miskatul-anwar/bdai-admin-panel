import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

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
    .select('id, name, email, role, avatar, department, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DbUser[]) || [];
}

export async function dbAddUser(user: {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Moderator';
  avatar?: string;
  department?: string;
  status?: string;
}): Promise<DbUser> {
  const passwordHash = bcrypt.hashSync(user.password || 'admin123', 10);
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name: user.name,
        email: user.email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: user.role,
        avatar: user.avatar || '/team/miskat.jpg',
        department: user.department || 'Department of CSE, University of Chittagong',
        status: user.status || 'active',
      },
    ])
    .select('id, name, email, role, avatar, department, status, created_at, updated_at')
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
  delete updateData.id;

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('id, name, email, role, avatar, department, status, created_at, updated_at')
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
// Direct DB Authentication
// ==========================================

export async function dbAuthenticate(email: string, password: string): Promise<DbUser> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error || !data) {
    throw new Error('Invalid email or password');
  }

  const isValid = bcrypt.compareSync(password, data.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const { password_hash, ...safeUser } = data;
  return safeUser as DbUser;
}
