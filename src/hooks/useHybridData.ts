import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase, hasSupabaseConfig } from '../integrations/supabase/client';
import { localStore } from '../lib/store';
import { Task, Habit, CodingSession, Project, JobApplication } from '../lib/types';
import { toast } from 'sonner';

// Helper to convert snake_case object keys to camelCase
export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeToCamel(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = snakeToCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// Helper to convert camelCase object keys to snake_case
export function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => camelToSnake(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = camelToSnake(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

interface HybridDataResult<T> {
  data: T[];
  loading: boolean;
  add: (item: any) => Promise<T>;
  update: (id: string, updates: any) => Promise<T>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// Generic hybrid hook
export function useHybridData<T extends { id: string }>(
  entityName: string,
  supabaseTable: string,
  localGet: () => T[],
  localAdd: (item: any) => T,
  localUpdate: (id: string, updates: any) => T,
  localDelete: (id: string) => void
): HybridDataResult<T> {
  const { user, isOffline } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = [entityName, user?.id || 'offline'];

  // Query to fetch data
  const { data = [], isLoading, refetch } = useQuery<T[]>({
    queryKey,
    queryFn: async () => {
      // Offline mode or no config
      if (isOffline || !hasSupabaseConfig() || !user) {
        return localGet();
      }

      // Supabase mode
      try {
        const { data: dbData, error } = await supabase!
          .from(supabaseTable)
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        
        return snakeToCamel(dbData) as T[];
      } catch (err: any) {
        console.warn(`Failed to fetch ${entityName} from Supabase, falling back to local:`, err.message);
        return localGet();
      }
    },
  });

  // Mutation to add an item
  const addMutation = useMutation({
    mutationFn: async (newItem: any) => {
      if (isOffline || !hasSupabaseConfig() || !user) {
        return localAdd(newItem);
      }

      // Convert fields to snake_case for Supabase
      const snakeItem = camelToSnake({
        ...newItem,
        userId: user.id
      });
      
      // Delete empty ID so DB generates it
      delete snakeItem.id;

      const { data: inserted, error } = await supabase!
        .from(supabaseTable)
        .insert(snakeItem)
        .select()
        .single();

      if (error) throw error;
      
      // Recompute profile stats in DB if we added a task or session
      if (supabaseTable === 'tasks' || supabaseTable === 'coding_sessions') {
        supabase!.rpc('update_profile_stats', { user_id: user.id }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        });
      }

      return snakeToCamel(inserted) as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Mutation to update an item
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (isOffline || !hasSupabaseConfig() || !user) {
        return localUpdate(id, updates);
      }

      const snakeUpdates = camelToSnake(updates);
      // Remove restricted/unnecessary fields
      delete snakeUpdates.id;
      delete snakeUpdates.user_id;

      const { data: updated, error } = await supabase!
        .from(supabaseTable)
        .update(snakeUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Recompute profile stats in DB if we updated a task status or session hours
      if (supabaseTable === 'tasks' || supabaseTable === 'coding_sessions') {
        supabase!.rpc('update_profile_stats', { user_id: user.id }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        });
      }

      return snakeToCamel(updated) as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Mutation to delete an item
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isOffline || !hasSupabaseConfig() || !user) {
        localDelete(id);
        return;
      }

      const { error } = await supabase!
        .from(supabaseTable)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Recompute profile stats in DB if we deleted a task or session
      if (supabaseTable === 'tasks' || supabaseTable === 'coding_sessions') {
        supabase!.rpc('update_profile_stats', { user_id: user.id }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  return {
    data,
    loading: isLoading,
    add: (item) => addMutation.mutateAsync(item),
    update: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    remove: (id) => deleteMutation.mutateAsync(id),
    refresh: async () => {
      await refetch();
    }
  };
}

// Wrapper Hooks
export function useTasks() {
  return useHybridData<Task>(
    'tasks',
    'tasks',
    localStore.getTasks,
    localStore.addTask,
    localStore.updateTask,
    localStore.deleteTask
  );
}

export function useHabits() {
  return useHybridData<Habit>(
    'habits',
    'habits',
    localStore.getHabits,
    localStore.addHabit,
    localStore.updateHabit,
    localStore.deleteHabit
  );
}

export function useCodingSessions() {
  return useHybridData<CodingSession>(
    'coding_sessions',
    'coding_sessions',
    localStore.getCodingSessions,
    localStore.addCodingSession,
    localStore.updateCodingSession,
    localStore.deleteCodingSession
  );
}

export function useProjects() {
  return useHybridData<Project>(
    'projects',
    'projects',
    localStore.getProjects,
    localStore.addProject,
    localStore.updateProject,
    localStore.deleteProject
  );
}

export function useJobs() {
  return useHybridData<JobApplication>(
    'job_applications',
    'job_applications',
    localStore.getJobs,
    localStore.addJob,
    localStore.updateJob,
    localStore.deleteJob
  );
}
