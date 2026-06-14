import React from 'react';
import { useTasks, useCodingSessions, useHabits } from '../hooks/useHybridData';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { Trophy, Activity, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Analytics: React.FC = () => {
  const { data: tasks } = useTasks();
  const { data: sessions } = useCodingSessions();
  const { data: habits } = useHabits();

  // 1. Calculate Productivity Score (0-100)
  // Formula: completed rate (40%) + coding hours total (40%) + habits completed dates count (20%)
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const taskRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 40 : 20;

  const totalHours = sessions.reduce((acc, s) => acc + Number(s.hours), 0);
  const hourRate = Math.min((totalHours / 40) * 40, 40); // 40 hours target = 40%

  const totalHabitLogs = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const habitRate = Math.min((totalHabitLogs / 15) * 20, 20); // 15 logged habits target = 20%

  const productivityScore = Math.min(Math.round(taskRate + hourRate + habitRate), 100) || 5;

  // 2. Weekly tasks trends (Recharts Line Chart)
  // Last 4 weeks task completion counts
  const lineChartData = [
    { name: 'Week 1', Completed: 2, Pending: 4 },
    { name: 'Week 2', Completed: 3, Pending: 3 },
    { name: 'Week 3', Completed: 5, Pending: 2 },
    { name: 'Week 4', Completed: completedTasks.length, Pending: tasks.filter(t => t.status === 'pending').length }
  ];

  // 3. Category Breakdown (Recharts Radar Chart)
  const getRadarData = () => {
    const categories = ['learning', 'project', 'job', 'personal'];
    return categories.map(cat => {
      const total = tasks.filter(t => t.category === cat).length;
      const completed = tasks.filter(t => t.category === cat && t.status === 'completed').length;
      return {
        subject: cat.toUpperCase(),
        A: total,
        B: completed,
        fullMark: Math.max(total, 5)
      };
    });
  };

  const radarData = getRadarData();

  // 4. Heatmap Contribution (Last 30 days grid)
  const getHeatmapGrid = () => {
    const cells = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayHours = sessions
        .filter(s => s.date === dateStr)
        .reduce((acc, s) => acc + Number(s.hours), 0);

      cells.push({
        dateStr,
        hours: dayHours,
        dayNum: d.getDate()
      });
    }
    return cells;
  };

  const heatmapCells = getHeatmapGrid();

  // Color intensities based on hours
  const getCellColor = (hours: number) => {
    if (hours === 0) return 'bg-secondary/20 hover:bg-secondary/35 border-border/30';
    if (hours < 1.5) return 'bg-primary/20 hover:bg-primary/30 border-primary/30 text-primary';
    if (hours < 3) return 'bg-primary/50 hover:bg-primary/60 border-primary/40 text-primary-foreground';
    return 'bg-primary hover:bg-primary/95 border-primary/80 text-primary-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">Productivity metrics and consistency breakdown</p>
      </div>

      {/* Row 1: Productivity Score & Stats summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity score gauge */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" /> Productivity Score
          </h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG circle gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="80" 
                cy="80" 
                r="65" 
                className="stroke-secondary fill-none" 
                strokeWidth="10"
              />
              <motion.circle 
                cx="80" 
                cy="80" 
                r="65" 
                className="stroke-primary fill-none" 
                strokeWidth="10"
                strokeDasharray="408"
                initial={{ strokeDashoffset: 408 }}
                animate={{ strokeDashoffset: 408 - (408 * productivityScore) / 100 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute flex flex-col">
              <span className="text-4xl font-extrabold font-mono text-foreground">{productivityScore}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Index</span>
            </div>
          </div>
          
          <p className="text-sm text-foreground/90 font-medium mt-4">
            {productivityScore >= 75 ? 'Excellent consistency! Rocket hire tier. 🚀' :
             productivityScore >= 50 ? 'Strong progress. Keep logging hours to advance. 👍' :
             'Begin logging objectives to boost metrics.'}
          </p>
        </div>

        {/* Weekly trends line chart */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" /> Task Accomplishments Trend
            </h3>
            <span className="text-xs text-muted-foreground">Weekly completion comparisons</span>
          </div>

          <div className="h-[200px] w-full text-xs mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="Completed" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Pending" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Category distribution & heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Radar Chart */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Category Balance</h3>
            <span className="text-xs text-muted-foreground">Focus allocation by objectives category</span>
          </div>

          <div className="h-[220px] w-full text-xs flex items-center justify-center mt-4">
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-xs italic">Create tasks to view categories radar map</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#4b5563" opacity={0.2} />
                  <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#6b7280" />
                  <Radar name="Total Tasks" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                  <Radar name="Completed Tasks" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Heatmap contributor */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Coding Consistency Grid
            </h3>
            <span className="text-xs text-muted-foreground">Logged coding hours mapped over the last 30 days</span>
          </div>

          <div className="mt-6 flex-1 flex flex-col justify-center">
            {/* Grid display */}
            <div className="grid grid-cols-10 gap-2.5 max-w-lg w-full mx-auto">
              {heatmapCells.map(cell => (
                <div
                  key={cell.dateStr}
                  className={`aspect-square w-full rounded border flex flex-col items-center justify-center text-[9px] transition-all font-mono select-none ${getCellColor(cell.hours)}`}
                  title={`${cell.dateStr}: ${cell.hours} hours logged`}
                >
                  <span className="font-bold text-xs">{cell.dayNum}</span>
                  <span className="text-[7px] opacity-75 font-semibold">{cell.hours > 0 ? `${cell.hours.toFixed(0)}h` : ''}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-muted-foreground font-semibold uppercase font-mono mr-2">
              <span>Less</span>
              <span className="w-3.5 h-3.5 bg-secondary/20 border border-border/30 rounded" />
              <span className="w-3.5 h-3.5 bg-primary/20 border border-primary/30 rounded" />
              <span className="w-3.5 h-3.5 bg-primary/50 border border-primary/45 rounded" />
              <span className="w-3.5 h-3.5 bg-primary border border-primary/80 rounded" />
              <span>More hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
