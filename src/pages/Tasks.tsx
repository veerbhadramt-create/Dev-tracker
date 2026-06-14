import React, { useState } from 'react';
import { useTasks } from '../hooks/useHybridData';
import { Plus, Search, Calendar, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export const Tasks: React.FC = () => {
  const { data: tasks, add: addTask, update: updateTask, remove: deleteTask } = useTasks();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('learning');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<string[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory('learning');
    setPriority('medium');
    setDeadline('');
    setIsRecurring(false);
    setRecurringDays([]);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setPriority(task.priority);
    setDeadline(task.deadline || '');
    setIsRecurring(task.isRecurring);
    setRecurringDays(task.recurringDays || []);
    setIsModalOpen(true);
  };

  const handleDayToggle = (day: string) => {
    if (recurringDays.includes(day)) {
      setRecurringDays(recurringDays.filter(d => d !== day));
    } else {
      setRecurringDays([...recurringDays, day]);
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskPayload = {
      title,
      description,
      category,
      priority,
      status: editingTask ? editingTask.status : ('pending' as TaskStatus),
      deadline: deadline || undefined,
      isRecurring,
      recurringDays: isRecurring ? recurringDays : []
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskPayload);
        toast.success('Task updated successfully');
      } else {
        await addTask(taskPayload);
        toast.success('Task added successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to save task');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted successfully');
      } catch (err) {
        toast.error('Failed to delete task');
        console.error(err);
      }
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const isNowCompleted = task.status === 'pending';
    
    if (isNowCompleted) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.75 },
        colors: ['#f97316', '#fb923c', '#38bdf8', '#4ade80']
      });
    }

    try {
      await updateTask(task.id, {
        status: isNowCompleted ? 'completed' : 'pending',
        completedAt: isNowCompleted ? new Date().toISOString() : undefined
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filter and search controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-secondary/15 p-4 rounded-xl border border-border/20">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tasks by name or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-background border border-border/40 text-foreground text-sm rounded-lg py-2 px-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
          >
            <option value="all">All Categories</option>
            <option value="learning">Learning</option>
            <option value="project">Project</option>
            <option value="job">Job</option>
            <option value="personal">Personal</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background border border-border/40 text-foreground text-sm rounded-lg py-2 px-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="glass-card p-12 text-center text-muted-foreground">
            No tasks found. Create a new task to get started!
          </div>
        ) : (
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`glass-card p-5 flex items-start gap-4 hover:border-primary/30 transition-all duration-300 ${
                  task.status === 'completed' ? 'opacity-75 bg-card/40' : ''
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={task.status === 'completed'}
                  onChange={() => handleStatusToggle(task)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-sm sm:text-base text-foreground truncate ${
                      task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {task.title}
                    </h3>
                    
                    {/* Category badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      task.category === 'learning' ? 'bg-emerald-500/10 text-emerald-500' :
                      task.category === 'project' ? 'bg-primary/10 text-primary' :
                      task.category === 'job' ? 'bg-sky-500/10 text-sky-500' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {task.category}
                    </span>

                    {/* Priority badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>

                    {task.isRecurring && (
                      <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <RefreshCw className="w-2.5 h-2.5" /> Recurring
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className={`text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed ${
                      task.status === 'completed' ? 'line-through' : ''
                    }`}>
                      {task.description}
                    </p>
                  )}

                  {task.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      Due {task.deadline}
                    </div>
                  )}

                  {task.isRecurring && task.recurringDays && task.recurringDays.length > 0 && (
                    <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono">
                      Repeats: {task.recurringDays.join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Task Creation / Editing Modal */}
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
              className="relative bg-card border border-border shadow-2xl rounded-xl max-w-lg w-full p-6 z-10"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4 text-foreground">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>

              <form onSubmit={handleSaveTask} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Task Title *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter what needs to be done..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Description
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Provide details about the task (optional)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none"
                  />
                </div>

                {/* Category & Priority Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TaskCategory)}
                      className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    >
                      <option value="learning">Learning</option>
                      <option value="project">Project</option>
                      <option value="job">Job</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Deadline
                  </label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {/* Recurring options */}
                <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-foreground/90">
                    <input 
                      type="checkbox" 
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary w-5 h-5"
                    />
                    Is Recurring Task
                  </label>

                  {isRecurring && (
                    <div className="mt-3">
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">
                        Select days of recurrence:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => {
                          const active = recurringDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleDayToggle(day)}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-full border transition-all ${
                                active 
                                  ? 'bg-primary text-white border-primary' 
                                  : 'bg-background text-muted-foreground border-border/40 hover:border-border'
                              }`}
                            >
                              {day.substr(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                    Save Task
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
