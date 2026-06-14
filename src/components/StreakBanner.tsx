import React from 'react';
import { Flame, Star, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  hasCodedToday: boolean;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({ currentStreak, longestStreak, hasCodedToday }) => {
  const isHot = currentStreak >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-5 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-4 ${
        isHot ? 'border-l-primary' : 'border-l-yellow-500'
      }`}
    >
      {/* Background glow for hot streaks */}
      {isHot && (
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl filter pointer-events-none" />
      )}

      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${
          isHot ? 'bg-primary/20 text-primary' : 'bg-yellow-500/10 text-yellow-500'
        }`}>
          <Flame className={`w-8 h-8 ${isHot ? 'animate-flame' : ''}`} />
        </div>

        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            {isHot ? 'You are on fire! ⚡' : 'Great start! Keep going! 🌱'}
            {isHot && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">Streak {currentStreak}d</span>}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {hasCodedToday 
              ? 'Coding session logged for today! Streak is secured.' 
              : 'Complete a coding session or task today to maintain your streak!'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0 bg-secondary/40 px-4 py-2.5 rounded-lg border border-border/30">
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Best Streak</div>
          <div className="text-xl font-bold font-mono flex items-center justify-center gap-1 text-foreground">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            {longestStreak}d
          </div>
        </div>
        
        <div className="w-[1px] h-8 bg-border" />

        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current</div>
          <div className="text-xl font-bold font-mono text-foreground">
            {currentStreak}d
          </div>
        </div>
      </div>
    </motion.div>
  );
};
