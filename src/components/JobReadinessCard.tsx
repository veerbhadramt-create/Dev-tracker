import React from 'react';
import { Task, Project, CodingSession } from '../lib/types';
import { Briefcase, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface JobReadinessCardProps {
  tasks: Task[];
  projects: Project[];
  sessions: CodingSession[];
  skills: string[];
  resumeScore: number;
}

export const JobReadinessCard: React.FC<JobReadinessCardProps> = ({
  tasks,
  projects,
  sessions,
  skills,
  resumeScore
}) => {
  // 1. Calculate Coding Hours in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
  const recentHours = recentSessions.reduce((acc, s) => acc + Number(s.hours), 0);

  // 2. Count shipped projects
  const shippedProjectsCount = projects.filter(p => p.status === 'shipped').length;

  // 3. Count completed tasks by learning/project category
  const completedLearningTasks = tasks.filter(t => t.status === 'completed' && t.category === 'learning').length;

  // 4. Match skills
  const lowerSkills = skills.map(s => s.toLowerCase());
  const frontendKeywords = ['react', 'vue', 'angular', 'html', 'css', 'tailwind', 'javascript', 'typescript', 'frontend', 'redux', 'next.js'];
  const backendKeywords = ['node', 'express', 'python', 'django', 'flask', 'sql', 'postgres', 'mongodb', 'backend', 'java', 'spring', 'api', 'graphql', 'nosql'];

  const matchedFE = lowerSkills.filter(s => frontendKeywords.some(kw => s.includes(kw))).length;
  const matchedBE = lowerSkills.filter(s => backendKeywords.some(kw => s.includes(kw))).length;

  // Weighted score calculation:
  // Skills Match: 30% (10% per keyword, max 30%)
  // Coding Hours: 25% (1.5% per hour in last 30d, max 25%)
  // Shipped Projects: 25% (12.5% per shipped project, max 25%)
  // Resume Score: 20% (Resume Score / 100 * 20%)

  const skillScoreFE = Math.min(matchedFE * 10, 30);
  const hourScore = Math.min(recentHours * 1.5, 25);
  const projectScore = Math.min(shippedProjectsCount * 12.5, 25);
  const cvScore = Math.min((resumeScore / 100) * 20, 20);

  const skillScoreBE = Math.min(matchedBE * 10, 30);

  const frontendScore = Math.round(skillScoreFE + hourScore + projectScore + cvScore);
  const backendScore = Math.round(skillScoreBE + hourScore + projectScore + cvScore);

  return (
    <div className="glass-card p-6 relative flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Job Readiness Engine
          </h3>
          
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            
            {/* Tooltip detail breakdown */}
            <div className="absolute right-0 top-6 w-64 p-3 bg-card border border-border shadow-xl rounded-lg text-xs hidden group-hover:block z-30 transition-all">
              <h4 className="font-bold mb-1 text-foreground">Score Weight Breakdown</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Skills Keyword Match:</span>
                  <span className="font-mono text-foreground font-semibold">Max 30%</span>
                </li>
                <li className="flex justify-between">
                  <span>30d Coding Hours ({Math.round(recentHours)}h):</span>
                  <span className="font-mono text-foreground font-semibold">Max 25%</span>
                </li>
                <li className="flex justify-between">
                  <span>Shipped Projects ({shippedProjectsCount}):</span>
                  <span className="font-mono text-foreground font-semibold">Max 25%</span>
                </li>
                <li className="flex justify-between">
                  <span>Resume Score ({resumeScore}%):</span>
                  <span className="font-mono text-foreground font-semibold">Max 20%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dual Progress Bars */}
        <div className="space-y-6 mt-6">
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className="font-semibold text-foreground/90">Frontend Readiness</span>
              <span className="font-mono text-primary font-bold">{frontendScore}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${frontendScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-primary h-2.5 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className="font-semibold text-foreground/90">Backend Readiness</span>
              <span className="font-mono text-emerald-500 font-bold">{backendScore}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${backendScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-emerald-500 h-2.5 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground mt-4 pt-4 border-t border-border/40">
        Based on Coding Hours, Shipped Projects, Tasks Completed & CV Score.
      </div>
    </div>
  );
};
