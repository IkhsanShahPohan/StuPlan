// import { AppState, Platform } from 'react-native'
// import 'react-native-url-polyfill/auto'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { createClient, processLock } from '@supabase/supabase-js'

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//     lock: processLock,
//   },
// })

// // Tells Supabase Auth to continuously refresh the session automatically
// // if the app is in the foreground. When this is added, you will continue
// // to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// // `SIGNED_OUT` event if the user's session is terminated. This should
// // only be registered once.
// if (Platform.OS !== "web") {
//   AppState.addEventListener('change', (state) => {
//     if (state === 'active') {
//       supabase.auth.startAutoRefresh()
//     } else {
//       supabase.auth.stopAutoRefresh()
//     }
//   })
// }

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
