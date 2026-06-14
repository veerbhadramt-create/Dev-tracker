export interface Profile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  githubUsername?: string;
  skills: string[];
  isPublic: boolean;
  codingHoursTotal: number;
  streakLongest: number;
  tasksCompleted: number;
  plan: 'free' | 'pro';
}

export type TaskCategory = 'learning' | 'project' | 'job' | 'personal';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string;
  completedAt?: string;
  isRecurring: boolean;
  recurringDays?: string[]; // e.g., ['Monday', 'Wednesday']
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string; // emoji or lucide icon name
  category: string;
  completedDates: string[]; // array of ISO date strings (YYYY-MM-DD)
}

export interface CodingSession {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  language: string;
  notes?: string;
}

export type ProjectStatus = 'planning' | 'building' | 'shipped';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  technologies: string[];
  status: ProjectStatus;
  githubLink?: string;
  liveLink?: string;
}

export type JobApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  platform: string; // e.g., 'LinkedIn', 'Internshala', etc.
  applicationDate: string; // YYYY-MM-DD
  status: JobApplicationStatus;
  notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  fileName: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  rawText: string;
  createdAt: string;
}
