import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../integrations/supabase/client';
import { Profile } from '../lib/types';
import { localStore } from '../lib/store';
import { toast } from 'sonner';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isOffline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(true);

  // Load profile for authenticated / offline user
  const loadProfile = async (userId: string, email: string) => {
    if (!hasSupabaseConfig() || userId === 'offline-user') {
      // Offline mode
      const localProfile = localStore.getProfile();
      setProfile(localProfile);
      setIsOffline(true);
      return;
    }

    try {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        // Map database snake_case to frontend camelCase
        setProfile({
          id: data.id,
          displayName: data.display_name,
          username: data.username,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          githubUsername: data.github_username,
          skills: data.skills || [],
          isPublic: data.is_public,
          codingHoursTotal: data.coding_hours_total,
          streakLongest: data.streak_longest,
          tasksCompleted: data.tasks_completed,
          plan: data.plan || 'free',
        });
        setIsOffline(false);
      }
    } catch (err: any) {
      console.warn('Error loading Supabase profile, falling back to local:', err.message);
      const localProfile = localStore.getProfile();
      setProfile(localProfile);
      setIsOffline(true);
    }
  };

  useEffect(() => {
    // 1. Setup listener BEFORE getSession as per the guidelines
    let authListener: any = null;

    if (hasSupabaseConfig()) {
      const { data } = supabase!.auth.onAuthStateChange(async (event, session) => {
        console.log('Supabase Auth Change Event:', event);
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          await loadProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          // Fall back to offline user profile when logged out
          const guestProfile = localStore.getProfile();
          setProfile(guestProfile);
          setIsOffline(true);
        }
        setLoading(false);
      });
      authListener = data.subscription;
    }

    // 2. Fetch initial session
    const checkInitialSession = async () => {
      if (hasSupabaseConfig()) {
        try {
          const { data: { session } } = await supabase!.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            await loadProfile(session.user.id, session.user.email || '');
          } else {
            // Unauthenticated: seed guest profile
            const guestProfile = localStore.getProfile();
            setProfile(guestProfile);
            setIsOffline(true);
          }
        } catch (e) {
          console.error('Failed to get Supabase session', e);
          const guestProfile = localStore.getProfile();
          setProfile(guestProfile);
          setIsOffline(true);
        } finally {
          setLoading(false);
        }
      } else {
        // No Supabase client: Always Offline mode
        const guestProfile = localStore.getProfile();
        // Check if there is a simulated logged-in user in sessionStorage
        const cachedUser = sessionStorage.getItem('dt_simulated_user');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          setUser({ id: parsed.id, email: parsed.email });
          setProfile(parsed.profile);
        } else {
          setUser(null);
          setProfile(guestProfile);
        }
        setIsOffline(true);
        setLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    if (!hasSupabaseConfig()) {
      // Simulate offline sign in
      const registeredUsersRaw = localStorage.getItem('dt_simulated_users') || '[]';
      const registeredUsers = JSON.parse(registeredUsersRaw);
      
      const found = registeredUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (found) {
        const simulatedUser = { id: found.id, email: found.email };
        setUser(simulatedUser);
        setProfile(found.profile);
        sessionStorage.setItem('dt_simulated_user', JSON.stringify({
          id: found.id,
          email: found.email,
          profile: found.profile
        }));
        toast.success('Signed in successfully (Offline Simulator)!');
      } else {
        setLoading(false);
        throw new Error('Invalid email or password in Offline simulator');
      }
      setLoading(false);
      return;
    }

    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    setLoading(true);
    if (!hasSupabaseConfig()) {
      // Simulate offline sign up
      const registeredUsersRaw = localStorage.getItem('dt_simulated_users') || '[]';
      const registeredUsers = JSON.parse(registeredUsersRaw);

      if (registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        setLoading(false);
        throw new Error('Email already exists');
      }

      const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      const newProfile: Profile = {
        id: newUserId,
        displayName,
        username,
        skills: [],
        isPublic: true,
        codingHoursTotal: 0,
        streakLongest: 0,
        tasksCompleted: 0,
        plan: 'free'
      };

      const newUserObj = {
        id: newUserId,
        email,
        password,
        profile: newProfile
      };

      registeredUsers.push(newUserObj);
      localStorage.setItem('dt_simulated_users', JSON.stringify(registeredUsers));

      // Auto login
      setUser({ id: newUserId, email });
      setProfile(newProfile);
      sessionStorage.setItem('dt_simulated_user', JSON.stringify(newUserObj));
      toast.success('Account created successfully (Offline Simulator)!');
      setLoading(false);
      return;
    }

    // Supabase SignUp
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username: username
        }
      }
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data.user) {
      toast.success('Registration successful!');
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (!hasSupabaseConfig()) {
      setUser(null);
      const guestProfile = localStore.getProfile();
      setProfile(guestProfile);
      sessionStorage.removeItem('dt_simulated_user');
      toast.success('Signed out successfully (Offline Simulator)');
      setLoading(false);
      return;
    }

    const { error } = await supabase!.auth.signOut();
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    
    const updatedProfile = { ...profile, ...updates };

    if (!hasSupabaseConfig() || profile.id === 'offline-user' || user?.id.startsWith('user_')) {
      // Offline mode
      localStore.saveProfile(updatedProfile);
      setProfile(updatedProfile);
      
      // Update cached session too if simulated
      const cached = sessionStorage.getItem('dt_simulated_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.profile = updatedProfile;
        sessionStorage.setItem('dt_simulated_user', JSON.stringify(parsed));

        // Update in simulated users DB
        const users = JSON.parse(localStorage.getItem('dt_simulated_users') || '[]');
        const idx = users.findIndex((u: any) => u.id === profile.id);
        if (idx !== -1) {
          users[idx].profile = updatedProfile;
          localStorage.setItem('dt_simulated_users', JSON.stringify(users));
        }
      }

      toast.success('Profile updated locally!');
      return;
    }

    // Supabase update
    try {
      const { error } = await supabase!
        .from('profiles')
        .update({
          display_name: updates.displayName,
          username: updates.username,
          bio: updates.bio,
          avatar_url: updates.avatarUrl,
          github_username: updates.githubUsername,
          skills: updates.skills,
          is_public: updates.isPublic,
          plan: updates.plan,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(updatedProfile);
      toast.success('Profile updated on server!');
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile, isOffline }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
