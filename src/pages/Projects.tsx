import React, { useState } from 'react';
import { useProjects } from '../hooks/useHybridData';
import { Plus, ExternalLink, Edit2, Trash2, X, Info } from 'lucide-react';
import { GithubIcon as Github } from '../components/GithubIcon';
import { Project, ProjectStatus } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const Projects: React.FC = () => {
  const { data: projects, add: addProject, update: updateProject, remove: deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [githubLink, setGithubLink] = useState('');
  const [liveLink, setLiveLink] = useState('');

  const openAddModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setTechnologiesText('');
    setStatus('planning');
    setGithubLink('');
    setLiveLink('');
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || '');
    setTechnologiesText(project.technologies.join(', '));
    setStatus(project.status);
    setGithubLink(project.githubLink || '');
    setLiveLink(project.liveLink || '');
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Parse technologies text into string array
    const technologies = technologiesText
      .split(',')
      .map(tech => tech.trim())
      .filter(tech => tech !== '');

    const projectPayload = {
      name,
      description: description || undefined,
      technologies,
      status,
      githubLink: githubLink || undefined,
      liveLink: liveLink || undefined
    };

    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectPayload);
        toast.success('Project updated successfully!');
      } else {
        await addProject(projectPayload);
        toast.success('Project added successfully!');
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error('Failed to save project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        toast.success('Project deleted');
      } catch (e) {
        toast.error('Failed to delete project');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} tracked
          </p>
        </div>

        <button 
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Grid List */}
      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          No projects yet. Start tracking your first project!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-5 flex flex-col justify-between h-full hover:border-primary/30 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      project.status === 'shipped' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      project.status === 'building' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {project.status}
                    </span>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(project)}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div>
                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.map(tech => (
                      <span key={tech} className="text-[10px] font-semibold bg-secondary/80 text-foreground/80 border border-border/30 px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links footer */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border/10">
                    {project.githubLink ? (
                      <a 
                        href={project.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/90 text-foreground font-semibold py-2 px-3 rounded-lg text-xs transition-all"
                      >
                        <Github className="w-3.5 h-3.5" /> Code Repo
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="flex-1 flex items-center justify-center gap-1.5 bg-secondary/30 text-muted-foreground/40 font-semibold py-2 px-3 rounded-lg text-xs cursor-not-allowed border border-border/10"
                      >
                        <Github className="w-3.5 h-3.5 opacity-50" /> No Repo
                      </button>
                    )}

                    {project.liveLink ? (
                      <a 
                        href={project.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/15 text-primary font-semibold py-2 px-3 rounded-lg text-xs transition-all border border-primary/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="flex-1 flex items-center justify-center gap-1.5 bg-secondary/20 text-muted-foreground/30 font-semibold py-2 px-3 rounded-lg text-xs cursor-not-allowed"
                      >
                        <ExternalLink className="w-3.5 h-3.5 opacity-40" /> Internal
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
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
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>

              <form onSubmit={handleSaveProject} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Project Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g., DevTracker, Portfolio website..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Description
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Provide a brief summary of features and implementation details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none"
                  />
                </div>

                {/* Tech stack input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    Technologies
                    <span className="text-[10px] text-muted-foreground normal-case font-normal">(comma-separated)</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="E.g., React, TypeScript, Tailwind CSS, Python"
                    value={technologiesText}
                    onChange={(e) => setTechnologiesText(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {/* Status select */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Development Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  >
                    <option value="planning">Planning</option>
                    <option value="building">Building</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      GitHub URL
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://github.com/..."
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Live Demo URL
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://..."
                      value={liveLink}
                      onChange={(e) => setLiveLink(e.target.value)}
                      className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none text-xs"
                    />
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
                    Save Project
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
