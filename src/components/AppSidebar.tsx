import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Flame, 
  Clock, 
  FolderGit2, 
  Briefcase, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Trophy, 
  Settings, 
  LogOut, 
  LogIn, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GithubIcon as Github } from './GithubIcon';
import { cn } from '../lib/utils';

interface SidebarLink {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  isPro?: boolean;
}

export const AppSidebar: React.FC = () => {
  const { user, profile, signOut, isOffline } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('dt_theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('dt_theme', nextTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(nextTheme);
  };

  const navLinks: SidebarLink[] = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habits', path: '/habits', icon: Flame },
    { name: 'Coding Time', path: '/coding-time', icon: Clock },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Job Tracker', path: '/jobs', icon: Briefcase },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Coach', path: '/ai-coach', icon: MessageSquare, isPro: true },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText, isPro: true },
    { name: 'GitHub Activity', path: '/github', icon: Github, isPro: true },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border/40 flex flex-col justify-between transition-all duration-300 relative select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Trigger Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-sidebar border border-sidebar-border/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground p-1 rounded-full shadow-md z-50 hidden sm:block"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div>
        {/* Brand Header */}
        <div className={cn("flex items-center gap-3 p-6 border-b border-sidebar-border/30", isCollapsed ? "justify-center px-2" : "px-6")}>
          <div className="bg-primary/20 p-2 rounded-lg text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 fill-primary/30" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text text-transparent">
              DevTracker
            </span>
          )}
        </div>

        {/* User Card info */}
        <div className={cn("p-4 border-b border-sidebar-border/10 flex items-center gap-3", isCollapsed ? "justify-center px-2" : "px-4")}>
          <img 
            src={profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
            alt="Avatar"
            className="w-9 h-9 rounded-full border border-primary/20 object-cover shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-foreground truncate">{profile?.displayName || 'Developer'}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase",
                  profile?.plan === 'pro' 
                    ? "bg-primary/25 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {profile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </span>
                {isOffline && <span className="text-[9px] text-yellow-500 font-mono font-semibold">[OFFLINE]</span>}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? link.name : undefined}
            >
              <link.icon className={cn("w-5 h-5 shrink-0", isCollapsed ? "mx-auto" : "")} />
              
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{link.name}</span>
                  {link.isPro && (
                    <span className="text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded uppercase scale-90">
                      Pro
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer controls */}
      <div className={cn("p-4 border-t border-sidebar-border/30 space-y-3", isCollapsed ? "items-center px-2" : "px-4")}>
        {/* Theme Toggler */}
        <button 
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0 text-yellow-500" /> : <Moon className="w-5 h-5 shrink-0 text-indigo-500" />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {/* Log In/Out */}
        {user ? (
          <button 
            onClick={signOut}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        ) : (
          <button 
            onClick={() => navigate('/auth')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogIn className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign In</span>}
          </button>
        )}

        {/* Social Icons footer */}
        {!isCollapsed && (
          <div className="flex items-center justify-around text-muted-foreground/60 pt-2 border-t border-sidebar-border/10">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="mailto:contact@devtracker.ai" className="hover:text-primary transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};
