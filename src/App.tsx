import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import { Toaster } from 'sonner';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Lazy-loaded pages matching routes
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Tasks = React.lazy(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })));
const Habits = React.lazy(() => import('./pages/Habits').then(m => ({ default: m.Habits })));
const CodingTime = React.lazy(() => import('./pages/CodingTime').then(m => ({ default: m.CodingTime })));
const Projects = React.lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const JobTracker = React.lazy(() => import('./pages/JobTracker').then(m => ({ default: m.JobTracker })));
const Analytics = React.lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const AICoach = React.lazy(() => import('./pages/AICoach').then(m => ({ default: m.AICoach })));
const ResumeAnalyzer = React.lazy(() => import('./pages/ResumeAnalyzer').then(m => ({ default: m.ResumeAnalyzer })));
const GitHubActivity = React.lazy(() => import('./pages/GitHubActivity').then(m => ({ default: m.GitHubActivity })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const PublicProfile = React.lazy(() => import('./pages/PublicProfile').then(m => ({ default: m.PublicProfile })));
const Auth = React.lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));

// Loading Fallback skeleton
const PageLoader = () => (
  <div className="w-full h-full flex flex-col justify-center items-center py-20 space-y-4">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest font-mono">Loading module...</span>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Private Pages (Inside Collapsible App Sidebar Layout) */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="habits" element={<Habits />} />
                <Route path="coding-time" element={<CodingTime />} />
                <Route path="projects" element={<Projects />} />
                <Route path="jobs" element={<JobTracker />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="ai-coach" element={<AICoach />} />
                <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
                <Route path="github" element={<GitHubActivity />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Public Pages (Outside Sidebar Layout) */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile/:username" element={<PublicProfile />} />

              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster richColors position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
