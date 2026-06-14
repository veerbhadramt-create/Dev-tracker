import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { localStore } from '../lib/store';
import { JobReadinessCard } from '../components/JobReadinessCard';
import { FolderGit2, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import { GithubIcon as Github } from '../components/GithubIcon';
import { Profile, Project } from '../lib/types';

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { profile: myProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    // 1. Check if the target username matches current user
    if (myProfile && myProfile.username.toLowerCase() === username.toLowerCase()) {
      setProfile(myProfile);
      setProjects(localStore.getProjects());
      return;
    }

    // 2. Check in simulated user database
    const users = JSON.parse(localStorage.getItem('dt_simulated_users') || '[]');
    const found = users.find((u: any) => u.profile.username.toLowerCase() === username.toLowerCase());
    
    if (found && found.profile.isPublic) {
      setProfile(found.profile);
      setProjects([]); // Simulated users have no active local projects logged in guest store
      return;
    }

    // 3. Fallback to leaderboard mock profiles
    const mockProfiles: Record<string, any> = {
      alexcode: {
        profile: {
          displayName: 'Alex Rivers',
          username: 'alexcode',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&h=80&q=80',
          bio: 'Frontend Architect & UI Developer. Passionate about animations and performance optimization.',
          githubUsername: 'alexrivers',
          skills: ['React', 'TypeScript', 'Framer Motion', 'Webpack', 'Tailwind CSS', 'NextJS'],
          plan: 'pro'
        },
        projects: [
          { id: 'ap-1', name: 'Glassmorphic UI Kit', description: 'Premium UI components with CSS filters.', technologies: ['React', 'Framer Motion'], status: 'shipped' },
          { id: 'ap-2', name: 'Dev OS Browser', description: 'Virtual workspace directly in web apps.', technologies: ['TypeScript', 'Vite'], status: 'building' }
        ]
      },
      sophiadev: {
        profile: {
          displayName: 'Sophia Chen',
          username: 'sophiadev',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
          bio: 'Data Science Student & ML enthusiast. Mastering Python backend pipelines.',
          githubUsername: 'sophiachen',
          skills: ['Python', 'Pandas', 'FastAPI', 'PostgreSQL', 'Scikit-Learn', 'SQL'],
          plan: 'pro'
        },
        projects: [
          { id: 'sp-1', name: 'Stock Analysis Edge', description: 'Aggregates news vectors using sentiment indices.', technologies: ['FastAPI', 'Python'], status: 'shipped' }
        ]
      }
    };

    const targetKey = username.toLowerCase();
    if (mockProfiles[targetKey]) {
      setProfile(mockProfiles[targetKey].profile);
      setProjects(mockProfiles[targetKey].projects);
    } else {
      setNotFound(true);
    }
  }, [username, myProfile]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">The requested developer profile does not exist or is set to private.</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-secondary border border-border hover:bg-secondary/95 text-foreground py-2 px-4 rounded-lg text-sm font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Dashboard
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground italic">
        Loading portfolio details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back to app link (if logged in, otherwise public guest header) */}
      <div className="flex justify-between items-center shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-primary" /> Public Developer Page
        </span>
      </div>

      {/* Profile Header section */}
      <div className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <img 
          src={profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
          alt="Avatar"
          className="w-24 h-24 rounded-full border border-primary/20 object-cover"
        />

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
              <h2 className="text-2xl font-bold text-foreground">{profile.displayName}</h2>
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 font-mono px-2 py-0.5 rounded-full self-center">
                @{profile.username}
              </span>
            </div>
            
            {profile.githubUsername && (
              <a 
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1 transition-colors font-mono"
              >
                <Github className="w-3.5 h-3.5" /> github.com/{profile.githubUsername}
              </a>
            )}
          </div>

          {profile.bio ? (
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">{profile.bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">No biography provided yet.</p>
          )}

          {/* Skills chips */}
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start pt-2">
            {profile.skills.map(skill => (
              <span key={skill} className="text-xs font-semibold bg-secondary text-foreground/80 border border-border/30 px-2.5 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Job Readiness (Read-only weight values) & Project Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Job readiness card wrapper */}
        <div className="md:col-span-1">
          <JobReadinessCard 
            tasks={[]} // simple mock inputs for read-only scoring
            projects={projects}
            sessions={[]}
            skills={profile.skills}
            resumeScore={profile.plan === 'pro' ? 82 : 74}
          />
        </div>

        {/* Shipped/building projects list */}
        <div className="md:col-span-2 glass-card p-6">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border/10 pb-3">
            <FolderGit2 className="w-4.5 h-4.5 text-primary" /> Projects Catalogue
          </h3>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 italic">No public projects logged yet.</p>
            ) : (
              projects.map(proj => (
                <div key={proj.id} className="p-4 bg-secondary/15 rounded-xl border border-border/20 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-sm text-foreground">{proj.name}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        proj.status === 'shipped' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {proj.description || 'Developer project logged via career dashboard.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/10">
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] bg-secondary px-1.5 py-0.2 rounded font-mono font-medium">{t}</span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {proj.githubLink && (
                        <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {proj.liveLink && (
                        <a href={proj.liveLink} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
