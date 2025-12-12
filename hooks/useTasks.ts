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

// Interface untuk create/update task
export interface TaskFormData {
  title: string;
  description?: string;
  notes?: string;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: Date;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  reminderTime: Date | string; // ISO string atau Date object
  repeatEnabled?: boolean;
  repeatOption?: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  customInterval?: number;
  customUnit?: "days" | "weeks" | "months" | "years";
  endOption?: "never" | "deadline";
  subtasks?: string[]; // Array of subtask titles
  status?: "pending" | "in_progress" | "completed";
}

export interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
}

export const useTask = (userId: string) => {
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]); // Ganti nama dari allTasks ke tasks
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

      // Fetch tasks
      const tasksData = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.userId, userId))
        .orderBy(desc(tasksTable.createdAt));

      // Fetch subtasks untuk semua tasks
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
   * Refresh tasks - alias untuk fetchTasks (untuk backward compatibility)
   */
  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  /**
   * Fetch tasks on mount
   */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Search tasks by title or description
   */
  const searchTasks = useCallback(
    (query: string) => {
      if (!query.trim()) {
        return tasks;
      }

      const lowerQuery = query.toLowerCase();
      return tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerQuery) ||
          task.description?.toLowerCase().includes(lowerQuery)
      );
    },
    [tasks]
  );

  /**
   * Filter tasks by category
   */
  const filterByCategory = useCallback(
    (category: "tugas" | "jadwal" | "kegiatan") => {
      return tasks.filter((task) => task.category === category);
    },
    [tasks]
  );

  /**
   * Get tasks by category (alias untuk filterByCategory)
   */
  const getTasksByCategory = useCallback(
    (category: "tugas" | "jadwal" | "kegiatan") => {
      return filterByCategory(category);
    },
    [filterByCategory]
  );

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
   * Parse reminder time dari Date atau string
   */
  const parseReminderTime = (reminderTime: Date | string): string => {
    let timeDate: Date;

    if (typeof reminderTime === "string") {
      timeDate = new Date(reminderTime);
    } else {
      timeDate = reminderTime;
    }

    const hours = timeDate.getHours().toString().padStart(2, "0");
    const minutes = timeDate.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  /**
   * Create new task
   */
  const createTask = async (formData: TaskFormData): Promise<Task | null> => {
    try {
      setLoading(true);
      setError(null);

      // Parse reminder time
      const reminderTimeString = parseReminderTime(formData.reminderTime);

      // Prepare task data
      const newTaskData: NewTask = {
        userId,
        title: formData.title,
        description: formData.description || null,
        notes: formData.notes || null,
        category: formData.category,
        deadline: formData.deadline.toISOString(),
        reminderEnabled: formData.reminderEnabled,
        reminderDaysBefore: formData.reminderDaysBefore,
        reminderTime: reminderTimeString,
        repeatEnabled: formData.repeatEnabled || false,
        repeatOption: formData.repeatOption || "none",
        customInterval: formData.customInterval || null,
        customUnit: formData.customUnit || null,
        endOption: formData.endOption || "deadline",
        status: "in_progress",
        notificationIds: null,
        updatedAt: new Date().toISOString(),
      };

      // Insert task
      const [insertedTask] = await db
        .insert(tasksTable)
        .values(newTaskData)
        .returning();

      // Create subtasks jika ada (hanya untuk category 'tugas')
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
          reminderDaysBefore: formData.reminderDaysBefore,
          reminderTime: reminderTimeString,
          repeatEnabled: formData.repeatEnabled || false,
          repeatOption: formData.repeatOption || "none",
          customInterval: formData.customInterval,
          customUnit: formData.customUnit,
          endOption: formData.endOption,
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

      // Refresh tasks
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
   */
  const updateTask = async (
    taskId: number,
    formData: Partial<TaskFormData>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get existing task
      const existingTask = await getTaskById(taskId);
      if (!existingTask) {
        setError("Task tidak ditemukan");
        return false;
      }

      // Cancel old notifications jika ada
      if (existingTask.notificationIds) {
        const oldIds = JSON.parse(existingTask.notificationIds);
        await cancelTaskNotifications(oldIds);
      }

      // Parse reminder time jika ada
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
        reminderDaysBefore:
          formData.reminderDaysBefore ?? existingTask.reminderDaysBefore,
        reminderTime: reminderTimeString,
        repeatEnabled: formData.repeatEnabled ?? existingTask.repeatEnabled,
        repeatOption: formData.repeatOption ?? existingTask.repeatOption,
        customInterval: formData.customInterval ?? existingTask.customInterval,
        customUnit: formData.customUnit ?? existingTask.customUnit,
        endOption: formData.endOption ?? existingTask.endOption,
        status: formData.status ?? existingTask.status,
        updatedAt: new Date().toISOString(),
      };

      // Update task
      await db
        .update(tasksTable)
        .set(updateData)
        .where(eq(tasksTable.id, taskId));

      // Update subtasks jika ada
      if (formData.subtasks && formData.category === "tugas") {
        // Delete old subtasks
        await db.delete(subtasksTable).where(eq(subtasksTable.taskId, taskId));

        // Create new subtasks
        if (formData.subtasks.length > 0) {
          const subtaskData: NewSubtask[] = formData.subtasks.map((title) => ({
            taskId,
            title,
            completed: false,
          }));

          await db.insert(subtasksTable).values(subtaskData);
        }
      }

      // Schedule new notifications jika enabled
      if (updateData.reminderEnabled) {
        const notificationConfig: NotificationConfig = {
          taskId,
          title: updateData.title!,
          body: updateData.description || `Pengingat untuk ${updateData.title}`,
          category: updateData.category!,
          deadline: new Date(updateData.deadline!),
          reminderEnabled: updateData.reminderEnabled,
          reminderDaysBefore: updateData.reminderDaysBefore!,
          reminderTime: reminderTimeString!,
          repeatEnabled: updateData.repeatEnabled!,
          repeatOption: updateData.repeatOption!,
          customInterval: updateData.customInterval ?? undefined,
          customUnit: updateData.customUnit ?? undefined,
          endOption: updateData.endOption,
        };

        const notificationIds =
          await scheduleTaskNotifications(notificationConfig);

        // Update notification IDs
        if (notificationIds.length > 0) {
          await db
            .update(tasksTable)
            .set({
              notificationIds: JSON.stringify(notificationIds),
            })
            .where(eq(tasksTable.id, taskId));
        }
      }

      // Refresh tasks
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

      // Get task untuk cancel notifications
      const task = await getTaskById(taskId);
      if (!task) {
        setError("Task tidak ditemukan");
        return false;
      }

      // Cancel notifications
      if (task.notificationIds) {
        const notificationIds = JSON.parse(task.notificationIds);
        await cancelTaskNotifications(notificationIds);
      }

      // Delete task (subtasks akan terhapus otomatis karena cascade)
      await db.delete(tasksTable).where(eq(tasksTable.id, taskId));

      // Refresh tasks
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
   * Get upcoming tasks (deadline dalam 7 hari)
   */
  const getUpcomingTasks = useCallback(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    return tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      return deadline >= now && deadline <= sevenDaysLater;
    });
  }, [tasks]);

  /**
   * Get overdue tasks
   */
  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      return deadline < now && task.status !== "completed";
    });
  }, [tasks]);

  /**
   * Get completed tasks
   */
  const getCompletedTasks = useCallback(() => {
    return tasks.filter((task) => task.status === "completed");
  }, [tasks]);

  /**
   * Update task status (untuk konfirmasi task selesai)
   */
  const updateTaskStatus = async (
    taskId: number,
    status: "pending" | "in_progress" | "completed"
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get task untuk cancel notifications jika status = completed
      if (status === "completed") {
        const task = await getTaskById(taskId);
        if (task && task.notificationIds) {
          const notificationIds = JSON.parse(task.notificationIds);
          await cancelTaskNotifications(notificationIds);
        }
      }

      // Update status
      await db
        .update(tasksTable)
        .set({
          status,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasksTable.id, taskId));

      // Refresh tasks
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
   * (untuk dipanggil dari component)
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

        // Update task untuk clear notification IDs
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
   * Get today's tasks
   */
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

  /**
   * Batch update subtasks (untuk konfirmasi sekaligus)
   */
  const batchUpdateSubtasks = async (
    taskId: number,
    subtaskIds: number[]
  ): Promise<boolean> => {
    try {
      // Update semua subtasks yang dipilih
      await Promise.all(
        subtaskIds.map((subtaskId) =>
          db
            .update(subtasksTable)
            .set({ completed: true })
            .where(eq(subtasksTable.id, subtaskId))
        )
      );

      // Check if all subtasks completed
      const taskWithSubtasks = await getTaskById(taskId);
      if (taskWithSubtasks) {
        const allCompleted = taskWithSubtasks.subtasks.every(
          (s) => s.completed
        );

        // Auto-complete task if all subtasks done
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

  /**
   * Filter by status
   */
  const filterByStatus = useCallback(
    (status: "pending" | "in_progress" | "completed" | "all") => {
      if (status === "all") return tasks;
      return tasks.filter((task) => task.status === status);
    },
    [tasks]
  );

  /**
   * Filter by date range
   */
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

  // return {
  //   // Data
  //   tasks, // Export sebagai tasks (bukan allTasks)
  //   loading,
  //   error,

  //   // CRUD operations
  //   createTask,
  //   updateTask,
  //   deleteTask,
  //   fetchTasks,
  //   refreshTasks, // Alias untuk fetchTasks
  //   getTaskById,

  //   // Search & Filters
  //   searchTasks,
  //   filterByCategory,
  //   getTasksByCategory,
  //   getUpcomingTasks,
  //   getOverdueTasks,
  //   getCompletedTasks,

  //   // Actions
  //   toggleTaskStatus,
  //   toggleSubtaskCompletion,
  // };
  return {
    // Data
    tasks,
    loading,
    error,

    // CRUD operations
    createTask,
    updateTask,
    updateTaskStatus, // ✅ TAMBAHKAN INI
    deleteTask,
    fetchTasks,
    refreshTasks,
    getTaskById,

    // Search & Filters
    searchTasks,
    filterByCategory,
    filterByStatus, // ✅ TAMBAHKAN INI
    filterByDateRange, // ✅ TAMBAHKAN INI
    getTasksByCategory,
    getUpcomingTasks,
    getOverdueTasks,
    getTodayTasks, // ✅ TAMBAHKAN INI
    getCompletedTasks,

    // Actions
    batchUpdateSubtasks,
    toggleTaskStatus,
    toggleSubtaskCompletion,
    cancelTaskNotifications: cancelTaskNotificationsByTaskId, // ✅ TAMBAHKAN INI (rename untuk clarity)
  };
};
