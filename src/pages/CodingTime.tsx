import React, { useState } from 'react';
import { useCodingSessions } from '../hooks/useHybridData';
import { Plus, Clock, BarChart3, PieChart, Trash2, Calendar, X } from 'lucide-react';
import { CodingSession } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Legend,
  CartesianGrid
} from 'recharts';
import { toast } from 'sonner';

export const CodingTime: React.FC = () => {
  const { data: sessions, add: addSession, remove: deleteSession } = useCodingSessions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [language, setLanguage] = useState('React');
  const [notes, setNotes] = useState('');

  const languagesList = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'Python', 'C++', 'Java', 'SQL', 'Rust', 'HTML/CSS'];

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayHours = sessions
    .filter(s => s.date === todayStr)
    .reduce((acc, s) => acc + Number(s.hours), 0);

  // Filter last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekHours = sessions
    .filter(s => new Date(s.date) >= sevenDaysAgo)
    .reduce((acc, s) => acc + Number(s.hours), 0);

  // Filter last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthHours = sessions
    .filter(s => new Date(s.date) >= thirtyDaysAgo)
    .reduce((acc, s) => acc + Number(s.hours), 0);

  // Prepare Pie Chart data (Language Distribution)
  const getLanguageData = () => {
    const langMap: Record<string, number> = {};
    sessions.forEach(s => {
      langMap[s.language] = (langMap[s.language] || 0) + Number(s.hours);
    });

    return Object.keys(langMap).map(lang => ({
      name: lang,
      value: Number(langMap[lang].toFixed(1))
    }));
  };

  const pieData = getLanguageData();
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#64748b'];

  // Prepare Weekly Bar Chart (Past 7 days stacked or simple)
  const getWeeklyBarData = () => {
    const barDataList = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });

      const daySessions = sessions.filter(s => s.date === dateStr);
      const dayHours = daySessions.reduce((acc, s) => acc + Number(s.hours), 0);

      barDataList.push({
        name: label,
        Hours: Number(dayHours.toFixed(1))
      });
    }
    return barDataList;
  };

  const barData = getWeeklyBarData();

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || isNaN(Number(hours)) || Number(hours) <= 0) {
      toast.error('Please enter valid coding hours');
      return;
    }

    try {
      await addSession({
        date,
        hours: Number(hours),
        language,
        notes: notes || undefined
      });
      setIsModalOpen(false);
      setHours('');
      setNotes('');
      toast.success('Hours logged successfully!');
    } catch (e) {
      toast.error('Failed to log session');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (window.confirm('Delete this coding session log?')) {
      try {
        await deleteSession(id);
        toast.success('Session deleted', { duration: 1000 });
      } catch (e) {
        toast.error('Failed to delete log', { duration: 1000 });
      }
    }
  };

  // Sort sessions: latest first
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Coding Time</h1>
          <p className="text-muted-foreground text-sm">Track your daily coding hours by language</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all animate-shimmer"
        >
          <Plus className="w-4 h-4" /> Log Time
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-muted-foreground text-xs font-semibold uppercase">Today</span>
            <h3 className="text-3xl font-bold font-mono text-foreground mt-1">{todayHours.toFixed(1)}h</h3>
          </div>
          <div className="p-3 rounded-xl bg-primary/15 text-primary shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-muted-foreground text-xs font-semibold uppercase">This Week</span>
            <h3 className="text-3xl font-bold font-mono text-foreground mt-1">{weekHours.toFixed(1)}h</h3>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/15 text-sky-500 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-muted-foreground text-xs font-semibold uppercase">This Month</span>
            <h3 className="text-3xl font-bold font-mono text-foreground mt-1">{monthHours.toFixed(1)}h</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Hours by Language */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-foreground mb-4">Weekly Hours</h3>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Bar dataKey="Hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <h3 className="text-base font-bold text-foreground mb-4">Language Distribution</h3>
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground italic h-[250px]">
              Log coding sessions to see language distribution
            </div>
          ) : (
            <div className="h-[250px] w-full text-xs flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logged Sessions list */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-primary" /> Recent Sessions
        </h3>
        
        <div className="overflow-x-auto">
          {sortedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sessions logged yet.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedSessions.map((session) => (
                  <tr key={session.id} className="border-b border-border/10 hover:bg-secondary/15 transition-colors">
                    <td className="py-3.5 px-4 text-foreground font-medium font-mono whitespace-nowrap">{session.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {session.language}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-foreground">{session.hours.toFixed(1)}h</td>
                    <td className="py-3.5 px-4 text-muted-foreground truncate max-w-xs">{session.notes || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Time Log Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card border border-border shadow-2xl rounded-xl max-w-md w-full p-6 z-10"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <h2 className="text-xl font-bold mb-4 text-foreground">
                Log Coding Session
              </h2>

              <form onSubmit={handleLogTime} className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Date
                  </label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Hours spent *
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="E.g., 2.5, 4.0..."
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none font-mono"
                  />
                </div>

                {/* Language Select */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Language / Framework
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  >
                    {languagesList.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    What did you work on?
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="E.g., solved 3 dynamic programming problems, wrote unit tests for auth module..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-border text-foreground hover:bg-secondary text-sm font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow-md transition-all"
                  >
                    Log Session
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
