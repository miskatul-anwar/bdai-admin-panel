export interface TeamMember {
  id: string;
  name: string;
  designation: string; // Fully editable, no fixed categories
  role?: string;
  category?: string;
  institution: string;
  email: string;
  bio: string;
  image?: string;
  scholarUrl?: string;
  linkedinUrl?: string;
  order: number;
}

export type NewsCategory = 'news' | 'event' | 'workshop' | 'announcement';
export type ContentStatus = 'published' | 'draft';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  publishDate: string;
  author: string;
  status: ContentStatus;
  featured: boolean;
  tags: string[];
}

export type VacancyStatus = 'open' | 'closed';
export type JobType = string; // Backward-compatible alias
export type NoticeType = string; // Fully editable notice type, no fixed categories

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  workPackage: string;
  type: string; // Fully editable notice type (e.g. e-Tender Notice, Research Fellowship, Job Circular)
  location: string;
  deadline: string;
  status: VacancyStatus;
  description: string;
  requirements: string[];
  applicantCount: number;
}

export type ObjectiveStatus = 'in-progress' | 'completed' | 'planned';

export interface ResearchObjective {
  id: string; // e.g. "OB1", "OB2"
  title: string;
  details: string;
  researcher: string;
  sector: string;
  status: ObjectiveStatus;
  progress: number; // 0 - 100
  deliverables: number;
}

export type UserRole = 'Admin' | 'Moderator' | 'Member';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'inactive';
  department: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  targetName: string;
  timestamp: string;
  user: string;
}
