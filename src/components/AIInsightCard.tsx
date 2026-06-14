import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightCardProps {
  codingHours: number;
  projectsCount: number;
  resumeScore: number;
  tasksCompleted: number;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  codingHours,
  projectsCount,
  resumeScore,
  tasksCompleted
}) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string>('');

  const generateInsight = () => {
    if (codingHours === 0) {
      return "You haven't practiced DSA or logged coding hours this week. Increase practice to improve interview readiness.";
    }
    if (projectsCount < 2) {
      return "Recruiters favor candidates with active, shipped projects. Focus on moving your planning projects to 'shipped' status and link your GitHub repositories.";
    }
    if (resumeScore < 75) {
      return `Your resume readiness score is currently ${resumeScore}%. Navigate to the Resume Analyzer to review suggestions and boost your matching keywords.`;
    }
    if (tasksCompleted < 5) {
      return "Consistency is key. Try checking off at least one learning task per day to keep your focus active and maintain your daily streak.";
    }
    return "Outstanding momentum! You have logged consistent coding hours and completed multiple tasks. Your project catalog looks solid. Keep it up!";
  };

  // Set initial insight
  React.useEffect(() => {
    setInsight(generateInsight());
  }, [codingHours, projectsCount, resumeScore, tasksCompleted]);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setInsight(generateInsight());
    setLoading(false);
  };

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full relative">
      <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          AI Career OS Insights
        </h3>
        
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200"
          title="Refresh Insight"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[100px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground text-center italic"
            >
              Consulting AI Career Advisor...
            </motion.div>
          ) : (
            <motion.p
              key="content"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-foreground/90 text-sm leading-relaxed"
            >
              {insight}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="text-[10px] font-mono text-muted-foreground mt-4 uppercase">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};
