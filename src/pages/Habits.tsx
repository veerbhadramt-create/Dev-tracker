import React, { useState } from 'react';
import { useHabits } from '../hooks/useHybridData';
import { Plus, Trash2, Check, X, Calendar } from 'lucide-react';
import { Habit } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const Habits: React.FC = () => {
  const { data: habits, add: addHabit, update: updateHabit, remove: deleteHabit } = useHabits();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💻');
  const [category, setCategory] = useState('coding');

  const iconsList = ['💻', '📚', '🔥', '🏃‍♂️', '💧', '🧠', '🥗', '💤', '🎯', '🚀', '🛠️', '📝'];
  const categoriesList = ['coding', 'learning', 'dsa', 'health', 'projects', 'career'];

  // Helper to generate past N days (dates formatted as YYYY-MM-DD)
  const getPastNDays = (n: number) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        dateStr: d.toISOString().split('T')[0],
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2),
        dayNum: d.getDate()
      });
    }
    return dates;
  };

  // Generate last 14 days for the desktop grid, last 7 days for mobile
  const datesGrid = getPastNDays(14);
  const todayStr = new Date().toISOString().split('T')[0];

  // Toggle habit date completion
  const handleToggleDate = async (habit: Habit, dateStr: string) => {
    const completed = habit.completedDates.includes(dateStr);
    let updatedDates = [...habit.completedDates];

    if (completed) {
      updatedDates = updatedDates.filter(d => d !== dateStr);
    } else {
      updatedDates.push(dateStr);
    }

    try {
      await updateHabit(habit.id, {
        completedDates: updatedDates
      });
    } catch (e) {
      toast.error('Failed to update habit status');
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addHabit({
        name,
        icon,
        category
      });
      setIsModalOpen(false);
      setName('');
      setIcon('💻');
      setCategory('coding');
      toast.success('Habit added successfully!');
    } catch (e) {
      toast.error('Failed to create habit');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await deleteHabit(id);
        toast.success('Habit deleted');
      } catch (e) {
        toast.error('Failed to delete habit');
      }
    }
  };

  // Calculations
  const completedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalHabits = habits.length;
  const todayProgress = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Streak calculator
  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // check if today or yesterday is completed
    const dToday = new Date().toISOString().split('T')[0];
    const dYest = new Date();
    dYest.setDate(dYest.getDate() - 1);
    const dYestStr = dYest.toISOString().split('T')[0];

    if (!sorted.includes(dToday) && !sorted.includes(dYestStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date();
    
    // If today is completed, check backwards. Otherwise if yesterday is completed, check backwards from yesterday.
    if (!sorted.includes(dToday)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (sorted.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Habits</h1>
          <p className="text-muted-foreground text-sm">
            {completedToday}/{totalHabits} completed today
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Habit
        </button>
      </div>

      {/* Progress Bar Banner */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground/90">Today's Progress</span>
          <span className="text-sm font-mono font-bold text-primary">{todayProgress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${todayProgress}%` }}
            transition={{ duration: 0.5 }}
            className="bg-primary h-3 rounded-full"
          />
        </div>
      </div>

      {/* Grid of habits */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="glass-card p-12 text-center text-muted-foreground">
            No habits found. Create a new habit to start tracking!
          </div>
        ) : (
          habits.map((habit) => {
            const streak = calculateStreak(habit.completedDates);
            const isCompletedToday = habit.completedDates.includes(todayStr);

            return (
              <div key={habit.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center gap-6 justify-between hover:border-primary/20 transition-all duration-300">
                {/* Info block */}
                <div className="flex items-center gap-4 min-w-0 md:max-w-[30%]">
                  <span className="text-3xl p-2 bg-secondary/35 rounded-xl border border-border/30 shrink-0">
                    {habit.icon}
                  </span>
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground truncate">{habit.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-secondary text-muted-foreground border border-border/30 px-2 py-0.5 rounded uppercase">
                        {habit.category}
                      </span>
                      {streak >= 3 ? (
                        <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                          🔥 {streak}d Streak
                        </span>
                      ) : streak > 0 ? (
                        <span className="text-[10px] font-semibold text-foreground/85 px-1.5 py-0.5 rounded-full bg-secondary">
                          {streak}d streak
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* 14 Days Check Grid */}
                <div className="flex-1 flex flex-col items-center sm:items-start">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Last 14 Days Completeness
                  </span>
                  
                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 w-full max-w-lg">
                    {datesGrid.map(({ dateStr, dayLabel, dayNum }) => {
                      const completed = habit.completedDates.includes(dateStr);
                      const isToday = dateStr === todayStr;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleToggleDate(habit, dateStr)}
                          className={`aspect-square w-full rounded-md border flex flex-col items-center justify-center text-[9px] font-mono transition-all ${
                            completed 
                              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20' 
                              : isToday 
                                ? 'bg-secondary/40 border-primary/50 text-foreground hover:bg-secondary/85' 
                                : 'bg-secondary/20 border-border/30 text-muted-foreground hover:bg-secondary/50'
                          }`}
                          title={`${dayLabel} ${dayNum} - ${completed ? 'Done' : 'Not done'}`}
                        >
                          <span className="opacity-75 text-[8px] font-bold uppercase">{dayLabel}</span>
                          <span className="font-bold text-xs mt-0.5">{dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-end gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-2.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all border border-red-500/10"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Creation Modal */}
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
                Add New Habit
              </h2>

              <form onSubmit={handleCreateHabit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Habit Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g., Practice LeetCode, Learn NextJS..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {/* Category select */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Icon selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Choose Icon
                  </label>
                  <div className="flex flex-wrap gap-2.5 mt-1 bg-secondary/15 p-2 rounded-lg border border-border/20 justify-center">
                    {iconsList.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setIcon(ic)}
                        className={`text-2xl p-1.5 rounded-lg hover:bg-secondary border transition-all ${
                          icon === ic 
                            ? 'bg-primary/20 border-primary' 
                            : 'border-transparent'
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
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
                    Create Habit
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
