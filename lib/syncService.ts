/**
 * syncService.ts
 * Core service untuk sinkronisasi data SQLite ↔️ Supabase
 * 
 * Features:
 * - Backup: Upload tasks & subtasks ke Supabase
 * - Restore: Download dari Supabase ke SQLite
 * - Conflict resolution: Last-write-wins
 * - Progress tracking untuk UI
 */

import { NewSubtask, NewTask, subtasks, tasks, users } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { eq } from "drizzle-orm";
import { SQLiteDatabase } from "expo-sqlite";
import NetInfo from "@react-native-community/netinfo";

export interface SyncProgress {
  step: 'checking' | 'uploading_tasks' | 'uploading_subtasks' | 'downloading_tasks' | 'downloading_subtasks' | 'completed' | 'error';
  current: number;
  total: number;
  message: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  tasksBackedUp?: number;
  subtasksBackedUp?: number;
  tasksRestored?: number;
  subtasksRestored?: number;
  error?: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

/**
 * Check internet connectivity
 */
export const checkInternetConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

/**
 * BACKUP: Upload SQLite data → Supabase
 */
export const backupToSupabase = async (
  db: any, // Drizzle SQLite database
  userId: string,
  onProgress?: SyncProgressCallback
): Promise<SyncResult> => {
  try {
    // Step 1: Check internet
    onProgress?.({
      step: 'checking',
      current: 0,
      total: 100,
      message: 'Memeriksa koneksi internet...'
    });

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      return {
        success: false,
        message: 'Tidak ada koneksi internet',
        error: 'NO_INTERNET'
      };
    }

    // Step 2: Fetch all tasks from SQLite
    onProgress?.({
      step: 'uploading_tasks',
      current: 10,
      total: 100,
      message: 'Mengambil data tugas...'
    });

    const localTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    if (localTasks.length === 0) {
      return {
        success: true,
        message: 'Tidak ada data untuk dicadangkan',
        tasksBackedUp: 0,
        subtasksBackedUp: 0
      };
    }

    // Step 3: Upload tasks to Supabase
    onProgress?.({
      step: 'uploading_tasks',
      current: 30,
      total: 100,
      message: `Mencadangkan ${localTasks.length} tugas...`
    });

    // Transform SQLite tasks to Supabase format
    const tasksToUpload = localTasks.map(task => ({
      id: task.id,
      user_id: userId,
      title: task.title,
      description: task.description,
      notes: task.notes,
      category: task.category,
      deadline: task.deadline,
      reminder_enabled: task.reminderEnabled,
      reminder_minutes: task.reminderMinutes,
      reminder_time: task.reminderTime,
      repeat_enabled: task.repeatEnabled,
      repeat_mode: task.repeatMode,
      repeat_interval: task.repeatInterval,
      selected_days: task.selectedDays,
      repeat_end_option: task.repeatEndOption,
      repeat_end_months: task.repeatEndMonths,
      status: task.status,
      notification_ids: task.notificationIds,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    }));

    // Upsert tasks (insert or update if exists)
    const { error: tasksError } = await supabase
      .from('tasks')
      .upsert(tasksToUpload, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (tasksError) {
      throw new Error(`Gagal mencadangkan tugas: ${tasksError.message}`);
    }

    // Step 4: Fetch all subtasks
    onProgress?.({
      step: 'uploading_subtasks',
      current: 60,
      total: 100,
      message: 'Mencadangkan sub-tugas...'
    });

    const taskIds = localTasks.map(t => t.id);
    const localSubtasks = await db
      .select()
      .from(subtasks)
      .where(
        // Get subtasks for all task IDs
        taskIds.length > 0 
          ? eq(subtasks.taskId, taskIds[0]) // Placeholder, akan di-fix
          : eq(subtasks.id, -1) // No match
      );

    // Better approach: fetch subtasks for each task
    let allSubtasks: any[] = [];
    for (const taskId of taskIds) {
      const taskSubtasks = await db
        .select()
        .from(subtasks)
        .where(eq(subtasks.taskId, taskId));
      allSubtasks = [...allSubtasks, ...taskSubtasks];
    }

    // Step 5: Upload subtasks if any
    let subtasksCount = 0;
    if (allSubtasks.length > 0) {
      const subtasksToUpload = allSubtasks.map(subtask => ({
        id: subtask.id,
        task_id: subtask.taskId,
        title: subtask.title,
        completed: subtask.completed,
        created_at: subtask.createdAt
      }));

      const { error: subtasksError } = await supabase
        .from('subtasks')
        .upsert(subtasksToUpload, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (subtasksError) {
        throw new Error(`Gagal mencadangkan sub-tugas: ${subtasksError.message}`);
      }

      subtasksCount = allSubtasks.length;
    }

    // Step 6: Completed
    onProgress?.({
      step: 'completed',
      current: 100,
      total: 100,
      message: 'Pencadangan selesai!'
    });

    return {
      success: true,
      message: `Berhasil mencadangkan ${localTasks.length} tugas dan ${subtasksCount} sub-tugas`,
      tasksBackedUp: localTasks.length,
      subtasksBackedUp: subtasksCount
    };

  } catch (error: any) {
    console.error('Backup error:', error);
    
    onProgress?.({
      step: 'error',
      current: 0,
      total: 100,
      message: error.message || 'Terjadi kesalahan saat mencadangkan'
    });

    return {
      success: false,
      message: error.message || 'Gagal mencadangkan data',
      error: error.message
    };
  }
};

/**
 * RESTORE: Download Supabase data → SQLite
 * Dipanggil saat login pertama kali di device baru
 */
export const restoreFromSupabase = async (
  db: any, // Drizzle SQLite database
  userId: string,
  onProgress?: SyncProgressCallback
): Promise<SyncResult> => {
  try {
    // Step 1: Check internet
    onProgress?.({
      step: 'checking',
      current: 0,
      total: 100,
      message: 'Memeriksa koneksi internet...'
    });

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      return {
        success: false,
        message: 'Tidak ada koneksi internet',
        error: 'NO_INTERNET'
      };
    }

    // Step 2: Check if SQLite already has data
    onProgress?.({
      step: 'checking',
      current: 10,
      total: 100,
      message: 'Memeriksa data lokal...'
    });

    const existingTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    if (existingTasks.length > 0) {
      // Data sudah ada, skip restore
      return {
        success: true,
        message: 'Data sudah tersedia di perangkat ini',
        tasksRestored: 0,
        subtasksRestored: 0
      };
    }

    // Step 3: Download tasks from Supabase
    onProgress?.({
      step: 'downloading_tasks',
      current: 30,
      total: 100,
      message: 'Mengunduh tugas dari server...'
    });

    const { data: supabaseTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (tasksError) {
      throw new Error(`Gagal mengunduh tugas: ${tasksError.message}`);
    }

    if (!supabaseTasks || supabaseTasks.length === 0) {
      return {
        success: true,
        message: 'Tidak ada data di server',
        tasksRestored: 0,
        subtasksRestored: 0
      };
    }

    // Step 4: Insert tasks to SQLite
    onProgress?.({
      step: 'downloading_tasks',
      current: 50,
      total: 100,
      message: `Menyimpan ${supabaseTasks.length} tugas...`
    });

    // Transform Supabase tasks to SQLite format
    const tasksToInsert: NewTask[] = supabaseTasks.map(task => ({
      id: task.id,
      userId: userId,
      title: task.title,
      description: task.description,
      notes: task.notes,
      category: task.category,
      deadline: task.deadline,
      reminderEnabled: task.reminder_enabled,
      reminderMinutes: task.reminder_minutes,
      reminderTime: task.reminder_time,
      repeatEnabled: task.repeat_enabled,
      repeatMode: task.repeat_mode,
      repeatInterval: task.repeat_interval,
      selectedDays: task.selected_days,
      repeatEndOption: task.repeat_end_option,
      repeatEndMonths: task.repeat_end_months,
      status: task.status,
      notificationIds: task.notification_ids,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));

    // Batch insert tasks
    await db.insert(tasks).values(tasksToInsert);

    // Step 5: Download subtasks
    onProgress?.({
      step: 'downloading_subtasks',
      current: 70,
      total: 100,
      message: 'Mengunduh sub-tugas...'
    });

    const taskIds = supabaseTasks.map(t => t.id);
    
    const { data: supabaseSubtasks, error: subtasksError } = await supabase
      .from('subtasks')
      .select('*')
      .in('task_id', taskIds);

    // Step 6: Insert subtasks if any
    let subtasksCount = 0;
    if (supabaseSubtasks && supabaseSubtasks.length > 0) {
      const subtasksToInsert: NewSubtask[] = supabaseSubtasks.map(subtask => ({
        id: subtask.id,
        taskId: subtask.task_id,
        title: subtask.title,
        completed: subtask.completed,
        createdAt: subtask.created_at
      }));

      await db.insert(subtasks).values(subtasksToInsert);
      subtasksCount = supabaseSubtasks.length;
    }

    // Step 7: Completed
    onProgress?.({
      step: 'completed',
      current: 100,
      total: 100,
      message: 'Pemulihan data selesai!'
    });

    return {
      success: true,
      message: `Berhasil memulihkan ${supabaseTasks.length} tugas dan ${subtasksCount} sub-tugas`,
      tasksRestored: supabaseTasks.length,
      subtasksRestored: subtasksCount
    };

  } catch (error: any) {
    console.error('Restore error:', error);
    
    onProgress?.({
      step: 'error',
      current: 0,
      total: 100,
      message: error.message || 'Terjadi kesalahan saat memulihkan data'
    });

    return {
      success: false,
      message: error.message || 'Gagal memulihkan data',
      error: error.message
    };
  }
};

/**
 * Check if user has backup data in Supabase
 */
export const hasBackupData = async (userId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return (count ?? 0) > 0;
  } catch (error) {
    console.error('Error checking backup:', error);
    return false;
  }
};

/**
 * Get last backup timestamp
 */
export const getLastBackupTimestamp = async (userId: string): Promise<Date | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return new Date(data.updated_at);
  } catch (error) {
    console.error('Error getting last backup:', error);
    return null;
  }
};