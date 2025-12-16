import {
  NewSubtask,
  NewTask,
  Subtask,
  subtasks as subtasksTable,
  Task,
  tasks as tasksTable,
} from "@/db/schema";
import {
  cancelTaskNotifications,
  NotificationConfig,
  scheduleTaskNotifications,
} from "@/lib/notificationHelper";
import { desc, eq } from "drizzle-orm";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useDrizzle } from "./useDrizzle";

// Interface untuk create/update task (UPDATED)
export interface TaskFormData {
  title: string;
  description?: string;
  notes?: string;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: Date;

  // Reminder (NEW)
  reminderEnabled: boolean;
  reminderMinutes: number; // Negatif value dari deadline
  reminderTime: Date; // Calculated reminder datetime

  // Repeat (UPDATED)
  repeatEnabled?: boolean;
  repeatMode?: "daily" | "weekly" | "monthly" | "yearly";
  repeatInterval?: number; // 1-6
  selectedDays?: number[]; // Untuk weekly mode
  repeatEndOption?: "never" | "months";
  repeatEndMonths?: number; // 1-6 untuk jadwal

  subtasks?: string[];
  status?: "pending" | "in_progress" | "completed";
}

export interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
}

export const useTask = (userId: string) => {
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = useDrizzle();

  /**
   * Fetch all tasks untuk user
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tasksData = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.userId, userId))
        .orderBy(desc(tasksTable.createdAt));

      const tasksWithSubtasks: TaskWithSubtasks[] = await Promise.all(
        tasksData.map(async (task) => {
          const taskSubtasks = await db
            .select()
            .from(subtasksTable)
            .where(eq(subtasksTable.taskId, task.id));

          return {
            ...task,
            subtasks: taskSubtasks,
          };
        })
      );

      setTasks(tasksWithSubtasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Gagal memuat tugas");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Refresh tasks - alias untuk fetchTasks
   */
  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Parse reminder time dari Date
   */
  const parseReminderTime = (reminderTime: Date): string => {
    const hours = reminderTime.getHours().toString().padStart(2, "0");
    const minutes = reminderTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  /**
   * Get task by ID
   */
  const getTaskById = useCallback(
    async (taskId: number): Promise<TaskWithSubtasks | null> => {
      try {
        const task = await db
          .select()
          .from(tasksTable)
          .where(eq(tasksTable.id, taskId))
          .limit(1);

        if (task.length === 0) return null;

        const taskSubtasks = await db
          .select()
          .from(subtasksTable)
          .where(eq(subtasksTable.taskId, taskId));

        return {
          ...task[0],
          subtasks: taskSubtasks,
        };
      } catch (err) {
        console.error("Error fetching task:", err);
        return null;
      }
    },
    []
  );

  /**
   * Create new task
   */
  const createTask = async (formData: TaskFormData): Promise<Task | null> => {
    try {
      setLoading(true);
      setError(null);

      const reminderTimeString = parseReminderTime(formData.reminderTime);

      // Prepare task data
      const newTaskData: NewTask = {
        userId,
        title: formData.title,
        description: formData.description || null,
        notes: formData.notes || null,
        category: formData.category,
        deadline: formData.deadline.toISOString(),

        // Reminder
        reminderEnabled: formData.reminderEnabled,
        reminderMinutes: formData.reminderMinutes,
        reminderTime: reminderTimeString,

        // Repeat
        repeatEnabled: formData.repeatEnabled || false,
        repeatMode: formData.repeatMode || null,
        repeatInterval: formData.repeatInterval || 1,
        selectedDays: formData.selectedDays
          ? JSON.stringify(formData.selectedDays)
          : null,
        repeatEndOption: formData.repeatEndOption || "never",
        repeatEndMonths: formData.repeatEndMonths || null,

        status: "in_progress",
        notificationIds: null,
        updatedAt: new Date().toISOString(),
      };

      // Insert task
      const [insertedTask] = await db
        .insert(tasksTable)
        .values(newTaskData)
        .returning();

      // Create subtasks jika ada
      if (
        formData.category === "tugas" &&
        formData.subtasks &&
        formData.subtasks.length > 0
      ) {
        const subtaskData: NewSubtask[] = formData.subtasks.map((title) => ({
          taskId: insertedTask.id,
          title,
          completed: false,
        }));

        await db.insert(subtasksTable).values(subtaskData);
      }

      // Schedule notifications
      if (formData.reminderEnabled) {
        const notificationConfig: NotificationConfig = {
          taskId: insertedTask.id,
          title: formData.title,
          body: formData.description || `Pengingat untuk ${formData.title}`,
          category: formData.category,
          deadline: formData.deadline,
          reminderEnabled: formData.reminderEnabled,
          reminderMinutes: formData.reminderMinutes,
          reminderTime: formData.reminderTime,
          repeatEnabled: formData.repeatEnabled || false,
          repeatMode: formData.repeatMode,
          repeatInterval: formData.repeatInterval,
          selectedDays: formData.selectedDays,
          repeatEndOption: formData.repeatEndOption,
          repeatEndMonths: formData.repeatEndMonths,
        };

        const notificationIds =
          await scheduleTaskNotifications(notificationConfig);

        // Update task dengan notification IDs
        if (notificationIds.length > 0) {
          await db
            .update(tasksTable)
            .set({
              notificationIds: JSON.stringify(notificationIds),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(tasksTable.id, insertedTask.id));

          insertedTask.notificationIds = JSON.stringify(notificationIds);
        }
      }

      await fetchTasks();
      router.replace("/(tabs)/tasks");
      console.log("✅ Task created successfully:", insertedTask.id);
      return insertedTask;
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Gagal membuat tugas");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update task
   * Strategy: Hapus semua notifikasi lama, lalu buat baru
   * Ini memastikan tidak ada konflik dan data selalu sinkron
   */
  const updateTask = async (
    taskId: number,
    formData: Partial<TaskFormData>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const existingTask = await getTaskById(taskId);
      if (!existingTask) {
        setError("Task tidak ditemukan");
        return false;
      }

      // STEP 1: Hapus semua notifikasi lama
      if (existingTask.notificationIds) {
        try {
          const oldIds = JSON.parse(existingTask.notificationIds);
          await cancelTaskNotifications(oldIds);
          console.log(`✅ Cancelled ${oldIds.length} old notifications`);
        } catch (error) {
          console.error("Error cancelling old notifications:", error);
          // Continue anyway
        }
      }

      const reminderTimeString = formData.reminderTime
        ? parseReminderTime(formData.reminderTime)
        : existingTask.reminderTime;

      // Prepare update data
      const updateData: Partial<NewTask> = {
        title: formData.title ?? existingTask.title,
        description: formData.description ?? existingTask.description,
        notes: formData.notes ?? existingTask.notes,
        category: formData.category ?? existingTask.category,
        deadline: formData.deadline
          ? formData.deadline.toISOString()
          : existingTask.deadline,
        reminderEnabled:
          formData.reminderEnabled ?? existingTask.reminderEnabled,
        reminderMinutes:
          formData.reminderMinutes ?? existingTask.reminderMinutes,
        reminderTime: reminderTimeString,
        repeatEnabled: formData.repeatEnabled ?? existingTask.repeatEnabled,
        repeatMode: formData.repeatMode ?? existingTask.repeatMode,
        repeatInterval: formData.repeatInterval ?? existingTask.repeatInterval,
        selectedDays: formData.selectedDays
          ? JSON.stringify(formData.selectedDays)
          : existingTask.selectedDays,
        repeatEndOption:
          formData.repeatEndOption ?? existingTask.repeatEndOption,
        repeatEndMonths:
          formData.repeatEndMonths ?? existingTask.repeatEndMonths,
        status: formData.status ?? existingTask.status,
        updatedAt: new Date().toISOString(),
      };

      await db
        .update(tasksTable)
        .set(updateData)
        .where(eq(tasksTable.id, taskId));

      // Update subtasks
      if (formData.subtasks && formData.category === "tugas") {
        await db.delete(subtasksTable).where(eq(subtasksTable.taskId, taskId));

        if (formData.subtasks.length > 0) {
          const subtaskData: NewSubtask[] = formData.subtasks.map((title) => ({
            taskId,
            title,
            completed: false,
          }));

          await db.insert(subtasksTable).values(subtaskData);
        }
      }

      // Schedule new notifications
      if (updateData.reminderEnabled) {
        const notificationConfig: NotificationConfig = {
          taskId,
          title: updateData.title!,
          body: updateData.description || `Pengingat untuk ${updateData.title}`,
          category: updateData.category!,
          deadline: new Date(updateData.deadline!),
          reminderEnabled: updateData.reminderEnabled,
          reminderMinutes: updateData.reminderMinutes!,
          reminderTime: formData.reminderTime || new Date(),
          repeatEnabled: updateData.repeatEnabled!,
          repeatMode: updateData.repeatMode,
          repeatInterval: updateData.repeatInterval,
          selectedDays: formData.selectedDays,
          repeatEndOption: updateData.repeatEndOption,
          repeatEndMonths: updateData.repeatEndMonths,
        };

        const notificationIds =
          await scheduleTaskNotifications(notificationConfig);

        if (notificationIds.length > 0) {
          await db
            .update(tasksTable)
            .set({
              notificationIds: JSON.stringify(notificationIds),
            })
            .where(eq(tasksTable.id, taskId));
        }
      }

      await fetchTasks();
      console.log("✅ Task updated successfully:", taskId);
      return true;
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Gagal mengupdate tugas");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete task
   */
  const deleteTask = async (taskId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const task = await getTaskById(taskId);
      if (!task) {
        setError("Task tidak ditemukan");
        return false;
      }

      if (task.notificationIds) {
        const notificationIds = JSON.parse(task.notificationIds);
        await cancelTaskNotifications(notificationIds);
      }

      await db.delete(tasksTable).where(eq(tasksTable.id, taskId));
      await fetchTasks();

      console.log("✅ Task deleted successfully:", taskId);
      return true;
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Gagal menghapus tugas");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle task status
   */
  const toggleTaskStatus = async (taskId: number): Promise<boolean> => {
    try {
      const task = await getTaskById(taskId);
      if (!task) return false;

      const newStatus =
        task.status === "completed"
          ? "pending"
          : task.status === "pending"
            ? "in_progress"
            : "completed";

      await db
        .update(tasksTable)
        .set({
          status: newStatus,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasksTable.id, taskId));

      await fetchTasks();
      return true;
    } catch (err) {
      console.error("Error toggling task status:", err);
      return false;
    }
  };

  /**
   * Toggle subtask completion
   */
  const toggleSubtaskCompletion = async (
    subtaskId: number
  ): Promise<boolean> => {
    try {
      const [subtask] = await db
        .select()
        .from(subtasksTable)
        .where(eq(subtasksTable.id, subtaskId))
        .limit(1);

      if (!subtask) return false;

      await db
        .update(subtasksTable)
        .set({ completed: !subtask.completed })
        .where(eq(subtasksTable.id, subtaskId));

      await fetchTasks();
      return true;
    } catch (err) {
      console.error("Error toggling subtask:", err);
      return false;
    }
  };

  /**
   * Update task status
   */
  const updateTaskStatus = async (
    taskId: number,
    status: "pending" | "in_progress" | "completed"
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (status === "completed") {
        const task = await getTaskById(taskId);
        if (task && task.notificationIds) {
          const notificationIds = JSON.parse(task.notificationIds);
          await cancelTaskNotifications(notificationIds);
        }
      }

      await db
        .update(tasksTable)
        .set({
          status,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasksTable.id, taskId));

      await fetchTasks();
      console.log("✅ Task status updated:", taskId, status);
      return true;
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Gagal mengupdate status");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel task notifications by task ID
   */
  const cancelTaskNotificationsByTaskId = async (
    taskId: number
  ): Promise<boolean> => {
    try {
      const task = await getTaskById(taskId);
      if (!task) {
        console.error("Task not found:", taskId);
        return false;
      }

      if (task.notificationIds) {
        const notificationIds = JSON.parse(task.notificationIds);
        await cancelTaskNotifications(notificationIds);

        await db
          .update(tasksTable)
          .set({
            notificationIds: null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(tasksTable.id, taskId));

        console.log("✅ Notifications cancelled for task:", taskId);
        return true;
      }

      return true;
    } catch (err) {
      console.error("Error cancelling notifications:", err);
      return false;
    }
  };

  /**
   * Batch update subtasks
   */
  const batchUpdateSubtasks = async (
    taskId: number,
    subtaskIds: number[]
  ): Promise<boolean> => {
    try {
      await Promise.all(
        subtaskIds.map((subtaskId) =>
          db
            .update(subtasksTable)
            .set({ completed: true })
            .where(eq(subtasksTable.id, subtaskId))
        )
      );

      const taskWithSubtasks = await getTaskById(taskId);
      if (taskWithSubtasks) {
        const allCompleted = taskWithSubtasks.subtasks.every(
          (s) => s.completed
        );

        if (allCompleted && taskWithSubtasks.status !== "completed") {
          await updateTaskStatus(taskId, "completed");
        }
      }

      await fetchTasks();
      return true;
    } catch (err) {
      console.error("Error batch updating subtasks:", err);
      return false;
    }
  };

  // Search & Filter functions
  const searchTasks = useCallback(
    (query: string) => {
      if (!query.trim()) return tasks;
      const lowerQuery = query.toLowerCase();
      return tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerQuery) ||
          task.description?.toLowerCase().includes(lowerQuery)
      );
    },
    [tasks]
  );

  const filterByCategory = useCallback(
    (category: "tugas" | "jadwal" | "kegiatan") => {
      return tasks.filter((task) => task.category === category);
    },
    [tasks]
  );

  const getTasksByCategory = useCallback(
    (category: "tugas" | "jadwal" | "kegiatan") => {
      return filterByCategory(category);
    },
    [filterByCategory]
  );

  const filterByStatus = useCallback(
    (status: "pending" | "in_progress" | "completed" | "all") => {
      if (status === "all") return tasks;
      return tasks.filter((task) => task.status === status);
    },
    [tasks]
  );

  const filterByDateRange = useCallback(
    (startDate: Date | null, endDate: Date | null) => {
      if (!startDate && !endDate) return tasks;

      return tasks.filter((task) => {
        const taskDate = new Date(task.deadline);
        taskDate.setHours(0, 0, 0, 0);

        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return taskDate >= start && taskDate <= end;
        } else if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          return taskDate >= start;
        } else if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return taskDate <= end;
        }
        return true;
      });
    },
    [tasks]
  );

  const getUpcomingTasks = useCallback(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    return tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      return deadline >= now && deadline <= sevenDaysLater;
    });
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      return deadline < now && task.status !== "completed";
    });
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter((task) => task.status === "completed");
  }, [tasks]);

  const getTodayTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline >= today && deadline < tomorrow;
    });
  }, [tasks]);

  return {
    // Data
    tasks,
    loading,
    error,

    // CRUD operations
    createTask,
    
    updateTask,
    updateTaskStatus,
    deleteTask,
    fetchTasks,
    refreshTasks,
    getTaskById,

    // Search & Filters
    searchTasks,
    filterByCategory,
    filterByStatus,
    filterByDateRange,
    getTasksByCategory,
    getUpcomingTasks,
    getOverdueTasks,
    getTodayTasks,
    getCompletedTasks,

    // Actions
    batchUpdateSubtasks,
    toggleTaskStatus,
    toggleSubtaskCompletion,
    cancelTaskNotifications: cancelTaskNotificationsByTaskId,
  };
};
