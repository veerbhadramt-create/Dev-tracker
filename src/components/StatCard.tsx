import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-3xl font-bold tracking-tight font-mono text-foreground">
          {value}
        </h3>
        
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={trend.isPositive ? 'text-emerald-500' : 'text-red-500'}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        )}

        {description && !trend && (
          <p className="text-muted-foreground text-xs mt-1 truncate">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};
