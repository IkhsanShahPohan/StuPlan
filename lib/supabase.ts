import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }
);

// Types
export interface SupabaseTask {
  id: number;
  uuid: string;
  user_id: string;
  title: string;
  description: string | null;
  notes: string | null;
  deadline: string;
  status: "pending" | "in_progress" | "completed";
  reminder_enabled: boolean;
  reminder_days_before: number;
  reminder_time: string;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted_at: string | null;
}

export interface SupabaseSubtask {
  id: number;
  uuid: string;
  task_id: number;
  task_uuid: string;
  title: string;
  completed: boolean;
  created_at: string;
  synced: boolean;
  deleted_at: string | null;
}
