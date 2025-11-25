import { useDrizzle } from "@/hooks/useDrizzle";
import NetInfo from "@react-native-community/netinfo";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import { subtasks, tasks } from "../db/schema";
import { supabase } from "./supabase";

export const useSyncManager = (userId: string | null) => {
  const db = useDrizzle();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    // Check initial status
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync tasks from local to Supabase
  const syncToCloud = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.log("No user ID provided");
      return;
    }

    if (!isOnline) {
      console.log("Device is offline, skipping sync");
      return;
    }

    try {
      console.log("🔄 Starting sync to cloud...");

      // Get all local tasks that need sync
      const localTasks = await db.select().from(tasks);

      for (const task of localTasks) {
        // Check if task exists in Supabase by local ID
        const { data: existingTask } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", task.id)
          .single();

        if (existingTask) {
          // Update existing task
          await supabase
            .from("tasks")
            .update({
              title: task.title,
              description: task.description,
              notes: task.notes,
              deadline: task.deadline,
              status: task.status,
              reminder_enabled: task.reminderEnabled === 1,
              reminder_days_before: task.reminderDaysBefore,
              reminder_time: task.reminderTime,
              notification_id: task.notificationId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", task.id);
        } else {
          // Insert new task
          await supabase.from("tasks").insert({
            id: task.id,
            user_id: userId,
            title: task.title,
            description: task.description,
            notes: task.notes,
            deadline: task.deadline,
            status: task.status,
            reminder_enabled: task.reminderEnabled === 1,
            reminder_days_before: task.reminderDaysBefore,
            reminder_time: task.reminderTime,
            notification_id: task.notificationId,
          });
        }

        // Sync subtasks
        const localSubtasks = await db
          .select()
          .from(subtasks)
          .where(eq(subtasks.taskId, task.id));

        for (const subtask of localSubtasks) {
          const { data: existingSubtask } = await supabase
            .from("subtasks")
            .select("*")
            .eq("id", subtask.id)
            .single();

          if (existingSubtask) {
            await supabase
              .from("subtasks")
              .update({
                title: subtask.title,
                completed: subtask.completed === 1,
              })
              .eq("id", subtask.id);
          } else {
            await supabase.from("subtasks").insert({
              id: subtask.id,
              task_id: task.id,
              title: subtask.title,
              completed: subtask.completed === 1,
            });
          }
        }
      }

      console.log("✅ Sync to cloud completed");
    } catch (err) {
      console.error("❌ Sync to cloud failed:", err);
      setError(err as Error);
      throw err;
    }
  }, [db, userId, isOnline]);

  // Sync tasks from Supabase to local
  const syncFromCloud = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.log("No user ID provided");
      return;
    }

    if (!isOnline) {
      console.log("Device is offline, skipping sync");
      return;
    }

    try {
      console.log("🔄 Starting sync from cloud...");

      // Get all tasks from Supabase
      const { data: cloudTasks, error: fetchError } = await supabase
        .from("tasks")  
        .select("*, subtasks!subtasks_task_id_fkey(*)")
        .eq("user_id", userId)
        .is("deleted_at", null);

      if (fetchError) throw fetchError;
      if (!cloudTasks) return;

      // Clear local database
      await db.delete(subtasks);
      await db.delete(tasks);

      // Insert cloud data to local
      for (const cloudTask of cloudTasks) {
        await db.insert(tasks).values({
          id: cloudTask.id,
          title: cloudTask.title,
          description: cloudTask.description,
          notes: cloudTask.notes,
          deadline: cloudTask.deadline,
          status: cloudTask.status,
          reminderEnabled: cloudTask.reminder_enabled ? 1 : 0,
          reminderDaysBefore: cloudTask.reminder_days_before,
          reminderTime: cloudTask.reminder_time,
          notificationId: cloudTask.notification_id,
          createdAt: cloudTask.created_at,
          updatedAt: cloudTask.updated_at,
        });

        // Insert subtasks
        if (cloudTask.subtasks && cloudTask.subtasks.length > 0) {
          for (const cloudSubtask of cloudTask.subtasks) {
            await db.insert(subtasks).values({
              id: cloudSubtask.id,
              taskId: cloudTask.id,
              title: cloudSubtask.title,
              completed: cloudSubtask.completed ? 1 : 0,
              createdAt: cloudSubtask.created_at,
            });
          }
        }
      }

      console.log("✅ Sync from cloud completed");
    } catch (err) {
      console.error("❌ Sync from cloud failed:", err);
      setError(err as Error);
      throw err;
    }
  }, [db, userId, isOnline]);

  // Full bidirectional sync
  const syncNow = useCallback(async (): Promise<void> => {
    if (isSyncing) {
      console.log("Sync already in progress");
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      await syncToCloud();
      await syncFromCloud();
    } catch (err) {
      console.error("Full sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [syncToCloud, syncFromCloud, isSyncing]);

  return {
    syncNow,
    isSyncing,
    isOnline,
    error,
  };
};
