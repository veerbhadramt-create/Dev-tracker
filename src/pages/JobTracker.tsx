import React, { useState } from 'react';
import { useJobs } from '../hooks/useHybridData';
import { useAuth } from '../hooks/useAuth';
import { 
  Plus, 
  Briefcase, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Sparkles, 
  X, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { JobApplication, JobApplicationStatus } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const JobTracker: React.FC = () => {
  const { data: jobs, add: addJob, update: updateJob, remove: deleteJob } = useJobs();
  const { profile } = useAuth();
  
  // Kanban columns definition
  const columns: { id: JobApplicationStatus; label: string; color: string }[] = [
    { id: 'applied', label: 'Applied', color: 'border-t-sky-500 bg-sky-500/5' },
    { id: 'interview', label: 'Interviewing', color: 'border-t-yellow-500 bg-yellow-500/5' },
    { id: 'offer', label: 'Offers', color: 'border-t-emerald-500 bg-emerald-500/5' },
    { id: 'rejected', label: 'Archived / Rejected', color: 'border-t-red-500 bg-red-500/5' }
  ];

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  
  // AI tips streaming state
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [streamingTips, setStreamingTips] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<JobApplicationStatus>('applied');
  const [notes, setNotes] = useState('');

  const platforms = [
    { name: 'LinkedIn', url: 'https://linkedin.com/jobs' },
    { name: 'Internshala', url: 'https://internshala.com' },
    { name: 'Wellfound', url: 'https://wellfound.com' },
    { name: 'Naukri', url: 'https://naukri.com' }
  ];

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      toast.error('Please fill in Company and Role fields');
      return;
    }

    try {
      await addJob({
        company,
        role,
        platform,
        applicationDate,
        status,
        notes: notes || undefined
      });
      setIsAddModalOpen(false);
      setCompany('');
      setRole('');
      setNotes('');
      toast.success('Application added!');
    } catch (e) {
      toast.error('Failed to log job application');
    }
  };

  const handleMoveStatus = async (job: JobApplication, direction: 'forward' | 'backward') => {
    const statusOrder: JobApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected'];
    const currentIdx = statusOrder.indexOf(job.status);
    let nextIdx = currentIdx;

    if (direction === 'forward' && currentIdx < statusOrder.length - 1) {
      nextIdx = currentIdx + 1;
    } else if (direction === 'backward' && currentIdx > 0) {
      nextIdx = currentIdx - 1;
    }

    if (nextIdx !== currentIdx) {
      const nextStatus = statusOrder[nextIdx];
      try {
        await updateJob(job.id, { status: nextStatus });
        toast.success(`Moved application to ${nextStatus}`);
      } catch (e) {
        toast.error('Failed to move status');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this job record?')) {
      try {
        await deleteJob(id);
        toast.success('Record deleted');
      } catch (e) {
        toast.error('Failed to delete record');
      }
    }
  };

  // Platform AI Tips Streaming Simulation
  const triggerPlatformTips = (platName: string) => {
    setSelectedPlatform(platName);
    setStreamingTips('');
    setIsTipsOpen(true);
    setIsStreaming(true);

    const skillsStr = profile?.skills.join(', ') || 'React, JavaScript';
    const textAdvice = `[Gemini Career Mentor Insights for ${platName}]\n\n` + 
      `Hey Veeresh, to optimize your profile for ${platName} as a developer, apply these tips:\n\n` +
      `1. Headline Refresh: Use an active keyword layout: "Frontend Developer | React | TS | Building DevTracker".\n` +
      `2. Skill Tags: Add at least 5 matches to your profile cards: ${skillsStr}.\n` +
      `3. Portfolio Attachments: Link your GitHub (GitHub URL: github.com/${profile?.githubUsername || 'Veeresh-Dev'}) and highlights like the Todo Web App and DevTracker AI project.\n` +
      `4. Recruiter Settings: Toggle "Open to Work" setting, restrict details to recruiters if seeking privacy, and set roles to: "React Developer", "Software Engineering Intern".\n` +
      `5. Easy Apply Tip: Always custom tailor bullet points in quick-apply attachments. Gemini score suggests a 74% matching baseline.`;

    let i = 0;
    const interval = setInterval(() => {
      if (i < textAdvice.length) {
        setStreamingTips((prev) => prev + textAdvice.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 15); // streaming text rate
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Job Tracker</h1>
          <p className="text-muted-foreground text-sm">Organize applications and practice mock interviews</p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Quick Apply platform panel */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-foreground/90 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          Job Search quick platforms
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map(p => (
            <div key={p.name} className="flex flex-col gap-2.5 p-3 bg-secondary/15 rounded-xl border border-border/20 text-center justify-between group hover:border-primary/20 transition-all">
              <div>
                <span className="font-bold text-sm text-foreground block">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">Quick job search portal</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <a 
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/90 text-foreground py-1.5 px-2 rounded-lg text-xs font-semibold transition-all"
                >
                  Apply <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => triggerPlatformTips(p.name)}
                  className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all"
                  title={`Streaming AI Tips for ${p.name}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map(col => {
          const colJobs = jobs.filter(j => j.status === col.id);
          
          return (
            <div key={col.id} className={`rounded-xl border border-border/40 p-4 border-t-4 ${col.color} flex flex-col min-h-[400px]`}>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/10 shrink-0">
                <span className="font-bold text-sm text-foreground uppercase tracking-wider">{col.label}</span>
                <span className="text-xs font-bold font-mono bg-secondary px-2.5 py-0.5 rounded-full text-foreground/85">{colJobs.length}</span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
                {colJobs.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground italic">
                    No items logged.
                  </div>
                ) : (
                  colJobs.map(job => (
                    <div key={job.id} className="bg-card border border-border/30 hover:border-border/70 p-4 rounded-xl shadow-sm transition-all duration-200 group flex flex-col justify-between min-h-[140px]">
                      <div>
                        <div className="flex items-start justify-between mb-1.5">
                          <h4 className="font-bold text-sm text-foreground truncate max-w-[80%]">{job.role}</h4>
                          <button 
                            onClick={() => handleDelete(job.id)}
                            className="text-muted-foreground hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mb-2">
                          {job.company}
                          <span className="text-[10px] bg-secondary px-1.5 py-0.2 rounded font-mono font-normal">{job.platform}</span>
                        </div>

                        {job.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-secondary/10 p-1.5 rounded border border-border/10 mb-3">
                            {job.notes}
                          </p>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-border/10">
                        <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {job.applicationDate}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveStatus(job, 'backward')}
                            disabled={job.status === 'applied'}
                            className="p-1 rounded bg-secondary hover:bg-secondary/90 disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleMoveStatus(job, 'forward')}
                            disabled={job.status === 'rejected'}
                            className="p-1 rounded bg-secondary hover:bg-secondary/90 disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Tips Modal/Drawer */}
      <AnimatePresence>
        {isTipsOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTipsOpen(false)}
              className="fixed inset-0 bg-black"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card border border-border shadow-2xl rounded-xl max-w-lg w-full p-6 z-10"
            >
              <button 
                onClick={() => setIsTipsOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                AI Profile Advisor — {selectedPlatform}
              </h2>

              <div className="bg-secondary/35 border border-border/30 rounded-lg p-4 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto min-h-[200px] no-scrollbar">
                {streamingTips}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsTipsOpen(false)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/95 text-foreground text-sm font-semibold rounded-lg transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Job Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card border border-border shadow-2xl rounded-xl max-w-md w-full p-6 z-10"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <h2 className="text-xl font-bold mb-4 text-foreground">
                Add Job Application
              </h2>

              <form onSubmit={handleAddJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Company Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g., Google, Stripe, NxtWave..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Job Role *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g., Software Engineering Intern..."
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Internshala">Internshala</option>
                      <option value="Wellfound">Wellfound</option>
                      <option value="Naukri">Naukri</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
                      className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Application Date
                  </label>
                  <input 
                    type="date" 
                    required
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Notes
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Log recruiter names, email details, interview dates..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-border text-foreground hover:bg-secondary text-sm font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-md transition-all"
                  >
                    Add Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
