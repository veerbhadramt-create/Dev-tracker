import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, RefreshCw, Globe } from 'lucide-react';
import { toast } from 'sonner';

export const Auth: React.FC = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user && !user.id.startsWith('offline-user')) {
      navigate('/');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'signin') {
        await signIn(email, password);
        navigate('/');
      } else {
        if (!displayName.trim() || !username.trim()) {
          toast.error('Display Name and Username are required for sign up');
          setLoading(false);
          return;
        }
        await signUp(email, password, displayName, username);
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateGoogle = async () => {
    setLoading(true);
    try {
      // Simulate Google OAuth delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Call mock signup with static google credentials
      await signUp('googleuser@gmail.com', 'google123', 'Google Coder', 'google_coder');
      toast.success('Signed in with Google!');
      navigate('/');
    } catch (e) {
      // If user already exists in simulator, perform sign-in
      try {
        await signIn('googleuser@gmail.com', 'google123');
        navigate('/');
      } catch (err) {
        toast.error('Google Auth simulation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full glass-card p-8 bg-card/75 border-border/40">

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">DevTracker</h2>
          <p className="text-xs text-muted-foreground mt-1">AI Career OS for Developers</p>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/20 rounded-xl border border-border/30 mb-6 text-center">
          <button
            onClick={() => setActiveTab('signin')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${activeTab === 'signin'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Sign In
          </button>

          <button
            onClick={() => setActiveTab('signup')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${activeTab === 'signup'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <>
              {/* Display name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg pl-10 pr-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    type="text"
                    required
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg pl-8 pr-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg pl-10 pr-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg pl-10 pr-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-50 mt-6 active:scale-95 text-sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : activeTab === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <hr className="border-border/30" />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2.5 text-[10px] font-bold text-muted-foreground uppercase">
            Or
          </span>
        </div>

        {/* OAuth Continue with Google button */}
        <button
          onClick={handleSimulateGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-foreground border border-border/40 font-semibold py-2.5 px-4 rounded-lg transition-all text-xs active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-[10px] text-center text-muted-foreground mt-6 font-medium">
          Stripe or OAuth details are simulated local sessions. Email verification is skipped for instant testing.
        </p>
      </div>
    </div>
  );
};
