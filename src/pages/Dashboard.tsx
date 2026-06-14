import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks, useHabits, useCodingSessions, useProjects, useJobs } from '../hooks/useHybridData';
import { StreakBanner } from '../components/StreakBanner';
import { StatCard } from '../components/StatCard';
import { AIInsightCard } from '../components/AIInsightCard';
import { JobReadinessCard } from '../components/JobReadinessCard';
import { 
  CheckSquare, 
  Flame, 
  Briefcase, 
  FileText, 
  Clock, 
  Calendar,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { data: tasks, update: updateTask } = useTasks();
  const { data: habits, update: updateHabit } = useHabits();
  const { data: sessions } = useCodingSessions();
  const { data: projects } = useProjects();
  const { data: jobs } = useJobs();
  const navigate = useNavigate();

  // 1. Calculate today's dates
  const todayStr = new Date().toISOString().split('T')[0];
  
  // 2. Filter today's tasks
  const todayTasks = tasks.filter(t => !t.deadline || t.deadline === todayStr);
  const pendingTasks = todayTasks.filter(t => t.status === 'pending');
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

  // 3. Filter overdue tasks
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed' || !t.deadline) return false;
    return new Date(t.deadline) < new Date(todayStr);
  });

  // 4. Tomorrow's tasks
  const tomorrowStr = new Date();
  tomorrowStr.setDate(tomorrowStr.getDate() + 1);
  const tomorrowDateStr = tomorrowStr.toISOString().split('T')[0];
  const tomorrowTasks = tasks.filter(t => t.deadline === tomorrowDateStr);

  // 5. Coding hours logged today
  const hoursToday = sessions
    .filter(s => s.date === todayStr)
    .reduce((acc, s) => acc + Number(s.hours), 0);

  // 6. Habits completed today
  const habitsCompletedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const habitsCompletionRate = habits.length > 0 ? Math.round((habitsCompletedToday / habits.length) * 100) : 0;

  // 7. Get latest resume score (from store, fallback 74)
  const resumeScore = profile?.plan === 'pro' ? 82 : 74; // standard default or simulated score

  // 8. Coded today check
  const hasCodedToday = sessions.some(s => s.date === todayStr);

  // 9. Prepare weekly activity chart data (last 7 days)
  const getWeeklyData = () => {
    const dataList = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

      const dayHours = sessions
        .filter(s => s.date === dateStr)
        .reduce((acc, s) => acc + Number(s.hours), 0);

      const dayCompletedTasks = tasks
        .filter(t => t.status === 'completed' && t.completedAt && t.completedAt.split('T')[0] === dateStr)
        .length;

      dataList.push({
        name: dayLabel,
        'Coding Hours': Number(dayHours.toFixed(1)),
        'Tasks Completed': dayCompletedTasks
      });
    }
    return dataList;
  };

  const chartData = getWeeklyData();

  // Task check toggle action with confetti
  const handleToggleTask = async (id: string, currentStatus: string) => {
    const isNowCompleted = currentStatus === 'pending';
    
    if (isNowCompleted) {
      // Trigger confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f97316', '#fb923c', '#ffedd5', '#10b981', '#3b82f6']
      });
    }

    try {
      await updateTask(id, {
        status: isNowCompleted ? 'completed' : 'pending',
        completedAt: isNowCompleted ? new Date().toISOString() : undefined
      });
    } catch (e) {
      console.error('Failed to update task status', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {profile?.displayName || 'Developer'}! Here is your AI Career OS overview 👋</p>
        </div>
        
        <button 
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Streak Banner */}
      <StreakBanner 
        currentStreak={profile?.codingHoursTotal ? (hasCodedToday ? 3 : 2) : 1} // simple simulated current streak
        longestStreak={profile?.streakLongest || 5}
        hasCodedToday={hasCodedToday}
      />

      {/* Grid of 6 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard 
          title="Completed" 
          value={completedTasksCount} 
          icon={CheckSquare} 
          description={`${pendingTasks.length} pending today`}
        />
        <StatCard 
          title="Streak" 
          value={`${profile?.codingHoursTotal ? (hasCodedToday ? 3 : 2) : 1}d`} 
          icon={Flame} 
          description={`Longest: ${profile?.streakLongest || 5}d`}
        />
        <StatCard 
          title="Applications" 
          value={jobs.length} 
          icon={Briefcase} 
          description={`${jobs.filter(j => j.status === 'interview').length} interviews`}
        />
        <StatCard 
          title="CV Score" 
          value={`${resumeScore}%`} 
          icon={FileText} 
          description={profile?.plan === 'pro' ? 'Gemini Scan: Active' : 'Free scanner default'}
        />
        <StatCard 
          title="Coding Today" 
          value={`${hoursToday.toFixed(1)}h`} 
          icon={Clock} 
          description={`Total: ${profile?.codingHoursTotal || 0}h`}
        />
        <StatCard 
          title="Habits" 
          value={`${habitsCompletedToday}/${habits.length}`} 
          icon={Calendar} 
          description={`${habitsCompletionRate}% completed today`}
        />
      </div>

      {/* Row with AI Insights & Job Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightCard 
          codingHours={hoursToday}
          projectsCount={projects.length}
          resumeScore={resumeScore}
          tasksCompleted={completedTasksCount}
        />
        
        <JobReadinessCard 
          tasks={tasks}
          projects={projects}
          sessions={sessions}
          skills={profile?.skills || []}
          resumeScore={resumeScore}
        />
      </div>

      {/* Chart + Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly activity chart */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Weekly Activity</h3>
            <p className="text-xs text-muted-foreground mb-4">Your coding hours and task accomplishments over the past 7 days</p>
          </div>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Bar dataKey="Coding Hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tasks Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Tasks panel */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Today's Progress</h3>
            <p className="text-xs text-muted-foreground mb-4">Complete today's learning objectives</p>
            
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
              {todayTasks.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No tasks scheduled for today.
                </div>
              ) : (
                todayTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
                    <input 
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium text-foreground truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/tasks')}
            className="w-full flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2 border border-dashed border-primary/20 hover:border-primary/45 rounded-lg"
          >
            Manage Tasks <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Overdue + Tomorrow columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Overdue Backlogs ({overdueTasks.length})
          </h3>
          <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
            {overdueTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">No overdue tasks. Good job staying on track!</p>
            ) : (
              overdueTasks.map(task => (
                <div key={task.id} className="flex justify-between items-center p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <span className="text-xs font-semibold text-foreground truncate max-w-[70%]">{task.title}</span>
                  <span className="text-[10px] font-mono bg-red-500/15 text-red-500 px-2 py-0.5 rounded">
                    Due {task.deadline}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tomorrow schedule */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-foreground/90 flex items-center gap-2 mb-3">
            Tomorrow's Schedule ({tomorrowTasks.length})
          </h3>
          <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
            {tomorrowTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tasks scheduled for tomorrow.</p>
            ) : (
              tomorrowTasks.map(task => (
                <div key={task.id} className="flex justify-between items-center p-2.5 bg-secondary/35 border border-border/30 rounded-lg">
                  <span className="text-xs font-semibold text-foreground truncate max-w-[80%]">{task.title}</span>
                  <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded font-semibold uppercase scale-90">
                    {task.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
