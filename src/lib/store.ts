import { Profile, Task, Habit, CodingSession, Project, JobApplication, ChatSession, ResumeAnalysis, ChatMessage } from './types';

// Helper to get past dates relative to today
const getPastDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Initial Seed Data
const defaultProfile: Profile = {
  id: 'offline-user',
  displayName: 'Veeresh',
  username: 'veeresh',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  bio: 'Learning Full Stack Development & Gen AI. Aspiring Software Engineer.',
  githubUsername: 'Veeresh-Dev',
  skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Python', 'Tailwind CSS', 'SQL'],
  isPublic: true,
  codingHoursTotal: 34,
  streakLongest: 5,
  tasksCompleted: 4,
  plan: 'free'
};

const defaultTasks: Task[] = [
  {
    id: 'task-1',
    userId: 'offline-user',
    title: 'Push a work in Repo',
    category: 'learning',
    priority: 'medium',
    status: 'pending',
    deadline: getPastDateStr(-1),
    isRecurring: false
  },
  {
    id: 'task-2',
    userId: 'offline-user',
    title: 'create a small feature on a project daily',
    category: 'learning',
    priority: 'medium',
    status: 'pending',
    deadline: getPastDateStr(-2),
    isRecurring: false
  },
  {
    id: 'task-3',
    userId: 'offline-user',
    title: 'Gen ai',
    description: 'Learning the most trending and demanding language',
    category: 'learning',
    priority: 'high',
    status: 'pending',
    deadline: getPastDateStr(0),
    isRecurring: true,
    recurringDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }
];

const defaultHabits: Habit[] = [
  {
    id: 'habit-1',
    userId: 'offline-user',
    name: 'Gen Ai 1.5 hours',
    icon: '📚',
    category: 'learning',
    completedDates: []
  },
  {
    id: 'habit-2',
    userId: 'offline-user',
    name: 'DSA 1.5hours',
    icon: '🔥',
    category: 'dsa',
    completedDates: []
  },
  {
    id: 'habit-3',
    userId: 'offline-user',
    name: 'Projects after 7:30pm till sleep',
    icon: '💻',
    category: 'projects',
    completedDates: []
  }
];

const defaultCodingSessions: CodingSession[] = [
  {
    id: 'session-1',
    userId: 'offline-user',
    date: getPastDateStr(0),
    hours: 2.5,
    language: 'JavaScript',
    notes: 'Built local storage logic and seed scripts'
  },
  {
    id: 'session-2',
    userId: 'offline-user',
    date: getPastDateStr(1),
    hours: 3.0,
    language: 'React',
    notes: 'Configured router and global state hooks'
  },
  {
    id: 'session-3',
    userId: 'offline-user',
    date: getPastDateStr(2),
    hours: 1.5,
    language: 'TypeScript',
    notes: 'Implemented types and core domain interfaces'
  },
  {
    id: 'session-4',
    userId: 'offline-user',
    date: getPastDateStr(3),
    hours: 4.0,
    language: 'Python',
    notes: 'Practiced arrays and trees algorithms'
  }
];

const defaultProjects: Project[] = [
  {
    id: 'project-1',
    userId: 'offline-user',
    name: 'Todo Web App',
    description: 'A beautiful responsive tasks application with persistent lists.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'],
    status: 'shipped',
    githubLink: 'https://github.com/Veeresh-Dev/todowebapp',
    liveLink: 'https://veeresh-dev.github.io/todowebapp'
  },
  {
    id: 'project-2',
    userId: 'offline-user',
    name: 'DevTracker AI Career OS',
    description: 'AI-assisted developer career productivity platform with gamification.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Gemini AI'],
    status: 'building',
    githubLink: 'https://github.com/Veeresh-Dev/devtracker',
    liveLink: ''
  }
];

const defaultJobs: JobApplication[] = [
  {
    id: 'job-1',
    userId: 'offline-user',
    company: 'NxtWave',
    role: 'Frontend Developer Intern',
    platform: 'Internshala',
    applicationDate: getPastDateStr(2),
    status: 'applied',
    notes: 'Applied with customized resume. Waiting for task link.'
  },
  {
    id: 'job-2',
    userId: 'offline-user',
    company: 'TechCorp',
    role: 'Full Stack Engineer',
    platform: 'LinkedIn',
    applicationDate: getPastDateStr(5),
    status: 'interview',
    notes: 'Scheduled coding round for next Tuesday.'
  }
];

const defaultChatSessions: ChatSession[] = [
  {
    id: 'chat-1',
    userId: 'offline-user',
    title: 'Career Planning Advice',
    messages: [
      {
        role: 'system',
        content: 'You are a senior developer career mentor with full user context.',
        timestamp: new Date().toISOString()
      },
      {
        role: 'user',
        content: 'Hi! What should I focus on to get hired as a React developer?',
        timestamp: getPastDateStr(0) + 'T10:00:00.000Z'
      },
      {
        role: 'assistant',
        content: 'Focus on mastering React hooks, TypeScript, state management (like TanStack Query/Zustand), and build solid projects that demonstrate API integration, authentication, and structured styling (Tailwind). Also, practice clean code and document your learnings on GitHub!',
        timestamp: getPastDateStr(0) + 'T10:01:00.000Z'
      }
    ],
    createdAt: new Date().toISOString()
  }
];

const defaultResumeAnalyses: ResumeAnalysis[] = [
  {
    id: 'analysis-1',
    userId: 'offline-user',
    fileName: 'Veeresh_Resume_2026.pdf',
    score: 74,
    strengths: [
      'Strong knowledge of React and JavaScript core concepts',
      'Solid projects displaying frontend skills',
      'Good styling foundations'
    ],
    weaknesses: [
      'Lacks cloud deployment details',
      'Minimal test suite mentions (Jest/Cypress)',
      'Backend stack is less represented in bullet points'
    ],
    suggestions: [
      'Add database optimization experience details',
      'Highlight specific APIs or SDK integrations',
      'Incorporate metrics (e.g., "improved performance by 20%")'
    ],
    rawText: 'Veeresh. Web developer. React, node, js. Projects: Todo list, e-commerce frontend.',
    createdAt: getPastDateStr(1) + 'T15:30:00.000Z'
  }
];

// Initialize localStorage helper
const initializeStore = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('dt_profile')) {
    localStorage.setItem('dt_profile', JSON.stringify(defaultProfile));
  }
  if (!localStorage.getItem('dt_tasks')) {
    localStorage.setItem('dt_tasks', JSON.stringify(defaultTasks));
  }
  if (!localStorage.getItem('dt_habits')) {
    localStorage.setItem('dt_habits', JSON.stringify(defaultHabits));
  }
  if (!localStorage.getItem('dt_coding_sessions')) {
    localStorage.setItem('dt_coding_sessions', JSON.stringify(defaultCodingSessions));
  }
  if (!localStorage.getItem('dt_projects')) {
    localStorage.setItem('dt_projects', JSON.stringify(defaultProjects));
  }
  if (!localStorage.getItem('dt_jobs')) {
    localStorage.setItem('dt_jobs', JSON.stringify(defaultJobs));
  }
  if (!localStorage.getItem('dt_chat_sessions')) {
    localStorage.setItem('dt_chat_sessions', JSON.stringify(defaultChatSessions));
  }
  if (!localStorage.getItem('dt_resume_analyses')) {
    localStorage.setItem('dt_resume_analyses', JSON.stringify(defaultResumeAnalyses));
  }
};

// Auto-run on import
initializeStore();

export const localStore = {
  // PROFILE
  getProfile: (): Profile => {
    initializeStore();
    return JSON.parse(localStorage.getItem('dt_profile') || '{}');
  },
  saveProfile: (profile: Profile): void => {
    localStorage.setItem('dt_profile', JSON.stringify(profile));
  },

  // TASKS
  getTasks: (): Task[] => {
    initializeStore();
    return JSON.parse(localStorage.getItem('dt_tasks') || '[]');
  },
  saveTasks: (tasks: Task[]): void => {
    localStorage.setItem('dt_tasks', JSON.stringify(tasks));
  },
  addTask: (task: Omit<Task, 'id' | 'userId'>): Task => {
    const tasks = localStore.getTasks();
    const newTask: Task = {
      ...task,
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      userId: 'offline-user'
    };
    tasks.push(newTask);
    localStore.saveTasks(tasks);
    localStore.recomputeStats();
    return newTask;
  },
  updateTask: (id: string, updates: Partial<Task>): Task => {
    const tasks = localStore.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    
    const wasCompleted = tasks[idx].status === 'completed';
    const isNowCompleted = updates.status === 'completed';

    tasks[idx] = { ...tasks[idx], ...updates };
    localStore.saveTasks(tasks);
    
    if (!wasCompleted && isNowCompleted) {
      localStore.recomputeStats();
    }
    
    return tasks[idx];
  },
  deleteTask: (id: string): void => {
    const tasks = localStore.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    localStore.saveTasks(filtered);
    localStore.recomputeStats();
  },

  // HABITS
  getHabits: (): Habit[] => {
    initializeStore();
    return JSON.parse(localStorage.getItem('dt_habits') || '[]');
  },
  saveHabits: (habits: Habit[]): void => {
    localStorage.setItem('dt_habits', JSON.stringify(habits));
  },
  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'completedDates'>): Habit => {
    const habits = localStore.getHabits();
    const newHabit: Habit = {
      ...habit,
      id: 'habit_' + Math.random().toString(36).substr(2, 9),
      userId: 'offline-user',
      completedDates: []
    };
    habits.push(newHabit);
    localStore.saveHabits(habits);
    return newHabit;
  },
  updateHabit: (id: string, updates: Partial<Habit>): Habit => {
    const habits = localStore.getHabits();
    const idx = habits.findIndex(h => h.id === id);
    if (idx === -1) throw new Error('Habit not found');
    habits[idx] = { ...habits[idx], ...updates };
    localStore.saveHabits(habits);
    return habits[idx];
  },
  deleteHabit: (id: string): void => {
    const habits = localStore.getHabits();
    const filtered = habits.filter(h => h.id !== id);
    localStore.saveHabits(filtered);
  },

  // CODING SESSIONS
  getCodingSessions: (): CodingSession[] => {
    initializeStore();
    return JSON.parse(localStorage.getItem('dt_coding_sessions') || '[]');
  },
  saveCodingSessions: (sessions: CodingSession[]): void => {
    localStorage.setItem('dt_coding_sessions', JSON.stringify(sessions));
  },
  addCodingSession: (session: Omit<CodingSession, 'id' | 'userId'>): CodingSession => {
    const sessions = localStore.getCodingSessions();
    const newSession: CodingSession = {
      ...session,
      id: 'session_' + Math.random().toString(36).substr(2, 9),
      userId: 'offline-user'
    };
    sessions.push(newSession);
    localStore.saveCodingSessions(sessions);
    localStore.recomputeStats();
    return newSession;
  },
  updateCodingSession: (id: string, updates: Partial<CodingSession>): CodingSession => {
    const sessions = localStore.getCodingSessions();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Coding session not found');
    sessions[idx] = { ...sessions[idx], ...updates };
    localStore.saveCodingSessions(sessions);
    localStore.recomputeStats();
    return sessions[idx];
  },
  deleteCodingSession: (id: string): void => {
    const sessions = localStore.getCodingSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStore.saveCodingSessions(filtered);
    localStore.recomputeStats();
  },

  // PROJECTS
  getProjects: (): Project[] => {
    initializeStore();
    return JSON.parse(localStorage.getItem('dt_projects') || '[]');
  },
  saveProjects: (projects: Project[]): void => {
    localStorage.setItem('dt_projects', JSON.stringify(projects));
  },
  addProject: (project: Omit<Project, 'id' | 'userId'>): Project => {
    const projects = localStore.getProjects();
    const newProject: Project = {
      ...project,
      id: 'project_' + Math.random().toString(36).substr(2, 9),
      userId: 'offline-user'
    };
    projects.push(newProject);
    localStore.saveProjects(projects);
    return newProject;
  },
  updateProject: (id: string, updates: Partial<Project>): Project => {
    const projects = localStore.getProjects();
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    projects[idx] = { ...projects[idx], ...updates };
    localStore.saveProjects(projects);
    return projects[idx];
  },
  deleteProject: (id: string): void => {
    const projects = localStore.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStore.saveProjects(filtered);
  },

  // JOBS
  getJobs: (): JobApplication[] => {
    initializeStore();
    return JSON.parse(localStorage.getItem('dt_jobs') || '[]');
  },
  saveJobs: (jobs: JobApplication[]): void => {
    localStorage.setItem('dt_jobs', JSON.stringify(jobs));
  },
  addJob: (job: Omit<JobApplication, 'id' | 'userId'>): JobApplication => {
    const jobs = localStore.getJobs();
    const newJob: JobApplication = {
      ...job,
      id: 'job_' + Math.random().toString(36).substr(2, 9),
      userId: 'offline-user'
    };
    jobs.push(newJob);
    localStore.saveJobs(jobs);
    return newJob;
  },
  updateJob: (id: string, updates: Partial<JobApplication>): JobApplication => {
    const jobs = localStore.getJobs();
    const idx = jobs.findIndex(j => j.id === id);
    if (idx === -1) throw new Error('Job application not found');
    jobs[idx] = { ...jobs[idx], ...updates };
    localStore.saveJobs(jobs);
    return jobs[idx];
  },
  deleteJob: (id: string): void => {
    const jobs = localStore.getJobs();
    const filtered = jobs.filter(j => j.id !== id);
    localStore.saveJobs(filtered);
  },

  // CHAT SESSIONS
  getChatSessions: (): ChatSession[] => {
    initializeStore();
    return JSON.parse(localStorage.getItem('dt_chat_sessions') || '[]');
  },
  saveChatSessions: (chats: ChatSession[]): void => {
    localStorage.setItem('dt_chat_sessions', JSON.stringify(chats));
  },
  addChatSession: (title: string, systemPrompt: string): ChatSession => {
    const chats = localStore.getChatSessions();
    const newChat: ChatSession = {
      id: 'chat_' + Math.random().toString(36).substr(2, 9),
      userId: 'offline-user',
      title,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    chats.unshift(newChat); // Add to beginning of list
    localStore.saveChatSessions(chats);
    return newChat;
  },
  updateChatMessages: (id: string, messages: ChatMessage[]): ChatSession => {
    const chats = localStore.getChatSessions();
    const idx = chats.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Chat session not found');
    chats[idx].messages = messages;
    localStore.saveChatSessions(chats);
    return chats[idx];
  },
  deleteChatSession: (id: string): void => {
    const chats = localStore.getChatSessions();
    const filtered = chats.filter(c => c.id !== id);
    localStore.saveChatSessions(filtered);
  },

  // RESUME ANALYSIS
  getResumeAnalyses: (): ResumeAnalysis[] => {
    initializeStore();
    return JSON.parse(localStorage.getItem('dt_resume_analyses') || '[]');
  },
  addResumeAnalysis: (analysis: Omit<ResumeAnalysis, 'id' | 'userId' | 'createdAt'>): ResumeAnalysis => {
    const analyses = localStore.getResumeAnalyses();
    const newAnalysis: ResumeAnalysis = {
      ...analysis,
      id: 'analysis_' + Math.random().toString(36).substr(2, 9),
      userId: 'offline-user',
      createdAt: new Date().toISOString()
    };
    analyses.unshift(newAnalysis);
    localStorage.setItem('dt_resume_analyses', JSON.stringify(analyses));
    return newAnalysis;
  },

  // RECOMPUTE STATS
  recomputeStats: (): void => {
    const profile = localStore.getProfile();
    const tasks = localStore.getTasks();
    const sessions = localStore.getCodingSessions();

    const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
    const codingHoursTotal = sessions.reduce((acc, s) => acc + Number(s.hours), 0);

    // Simplistic streak calculation
    const sessionDates = Array.from(new Set(sessions.map(s => s.date))).sort();
    let currentStreak = 0;
    let longestStreak = profile.streakLongest || 0;
    
    const todayStr = getPastDateStr(0);
    const yesterdayStr = getPastDateStr(1);

    if (sessionDates.includes(todayStr) || sessionDates.includes(yesterdayStr)) {
      currentStreak = 1;
      let checkDate = new Date();
      
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (sessionDates.includes(dateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    const updatedProfile = {
      ...profile,
      tasksCompleted,
      codingHoursTotal,
      streakLongest: longestStreak
    };
    localStore.saveProfile(updatedProfile);
  }
};
