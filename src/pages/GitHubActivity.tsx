import React, { useState, useEffect } from 'react';
import { ProGate } from '../components/ProGate';
import { useAuth } from '../hooks/useAuth';
import { Search, Star, GitFork, BookOpen, Layers, RefreshCw } from 'lucide-react';
import { GithubIcon as Github } from '../components/GithubIcon';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';

export const GitHubActivity: React.FC = () => {
  return (
    <ProGate>
      <GitHubActivityContent />
    </ProGate>
  );
};

const GitHubActivityContent: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [username, setUsername] = useState(profile?.githubUsername || '');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  // Fetch GitHub data on load if username is already saved in profile
  useEffect(() => {
    if (profile?.githubUsername) {
      fetchGitHubData(profile.githubUsername);
    }
  }, [profile?.githubUsername]);

  const fetchGitHubData = async (userStr: string) => {
    if (!userStr.trim()) return;
    setLoading(true);
    try {
      // 1. Fetch User Profile
      const userRes = await fetch(`https://api.github.com/users/${userStr}`);
      if (!userRes.ok) {
        throw new Error('User profile not found');
      }
      const uData = userRes.ok ? await userRes.json() : null;
      setUserData(uData);

      // 2. Fetch User Repositories
      const reposRes = await fetch(`https://api.github.com/users/${userStr}/repos?per_page=100&sort=updated`);
      if (reposRes.ok) {
        const rData = await reposRes.json();
        if (Array.isArray(rData)) {
          setRepos(rData);

          // Aggregate Languages
          const langMap: Record<string, number> = {};
          let totalCount = 0;

          rData.forEach((r: any) => {
            if (r.language) {
              langMap[r.language] = (langMap[r.language] || 0) + 1;
              totalCount++;
            }
          });

          const sortedLangs = Object.keys(langMap)
            .map(lang => ({
              name: lang,
              value: langMap[lang]
            }))
            .sort((a, b) => b.value - a.value);

          setLanguages(sortedLangs);
        } else {
          setRepos([]);
          setLanguages([]);
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to fetch GitHub activity');
      setUserData(null);
      setRepos([]);
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    await fetchGitHubData(username);

    // Save to user profile
    try {
      await updateProfile({ githubUsername: username });
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#64748b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">GitHub Activity</h1>
        <p className="text-muted-foreground text-sm">Analyze repository statistics and code insights from public profiles</p>
      </div>

      {/* Username search form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 bg-secondary/15 p-4 rounded-xl border border-border/20 max-w-lg">
        <div className="relative flex-1">
          <Github className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Enter public GitHub username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-background border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 disabled:opacity-50 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm transition-all"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
        </button>
      </form>

      {loading ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
          Pulling GitHub repository indices...
        </div>
      ) : userData ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Row 1: Profile & language breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* profile card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <img
                src={userData.avatar_url}
                alt="GitHub Avatar"
                className="w-24 h-24 rounded-full border border-primary/20 mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-foreground">{userData.name || userData.login}</h3>
              <p className="text-sm text-muted-foreground mb-4">@{userData.login}</p>

              {userData.bio && (
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-6 italic">
                  "{userData.bio}"
                </p>
              )}

              {/* stats numbers block */}
              <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-border/10 text-center">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold block uppercase">Repos</span>
                  <span className="text-base font-bold font-mono text-foreground">{userData.public_repos}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold block uppercase">Followers</span>
                  <span className="text-base font-bold font-mono text-foreground">{userData.followers}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold block uppercase">Gists</span>
                  <span className="text-base font-bold font-mono text-foreground">{userData.public_gists}</span>
                </div>
              </div>
            </div>

            {/* Language Pie chart */}
            <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" /> Repository Languages
                </h3>
                <span className="text-xs text-muted-foreground">Volume ratios matching primary language declarations</span>
              </div>

              {languages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12 italic">No primary languages tracked in repositories</p>
              ) : (
                <div className="h-[200px] w-full text-xs flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languages}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {languages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Top Repositories list */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Public Repositories Showcase
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
              {repos.slice(0, 10).map((r: any) => (
                <div key={r.id} className="p-4 bg-secondary/15 rounded-xl border border-border/20 flex flex-col justify-between hover:border-primary/20 transition-all">
                  <div>
                    <h4 className="font-bold text-sm text-foreground truncate mb-1">
                      <a href={r.html_url} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                        {r.name}
                      </a>
                    </h4>
                    {r.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {r.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/10 font-mono">
                    <span className="font-bold text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase scale-90">
                      {r.language || 'HTML'}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {r.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" />
                        {r.forks_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <Github className="w-12 h-12 text-muted-foreground/45 mb-3 animate-pulse" />
          <p className="text-sm">Search and connect a public GitHub username to review statistics.</p>
        </div>
      )}
    </div>
  );
};
