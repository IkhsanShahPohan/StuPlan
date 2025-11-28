import { useEffect, useState } from "react";
import { subtasks, tasks } from "@/db/schema";
import { and, desc, eq, gte, like, lte, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/lib/AuthContext";
import { 
  scheduleTaskNotification, 
  cancelTaskNotifications 
} from "@/lib/notificationHelper";

interface Task {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  notes: string | null;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: string;
  time: string | null;
  repeatOption: "none" | "daily" | "weekly" | "monthly" | "yearly";
  repeatEndDate: string | null;
  status: "pending" | "in_progress" | "completed";
  reminderEnabled: number | boolean;
  reminderDaysBefore: number | null;
  reminderTime: string | null;
  reminderFrequency: "once" | "daily" | "every_2_days" | "every_3_days" | "weekly";
  notificationIds: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Subtask {
  id: number;
  taskId: number;
  title: string;
  completed: number | boolean;
  createdAt: string | null;
}

export function useTasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const x = useSQLiteContext();
  const db = drizzle(x);

  const fetchTasks = async () => {
    if (!user) {
      setAllTasks([]);
      setLoading(false);
      return;
    }

    try {
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, user.id))
        .orderBy(desc(tasks.createdAt));
      setAllTasks(result as Task[]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const createTask = async (
    input: {
      title: string;
      description?: string;
      notes?: string;
      category: "tugas" | "jadwal" | "kegiatan";
      deadline: string;
      time?: string;
      repeatOption?: "none" | "daily" | "weekly" | "monthly" | "yearly";
      repeatEndDate?: string;
      reminderEnabled?: boolean;
      reminderDaysBefore?: number;
      reminderTime?: string;
      reminderFrequency?: "once" | "daily" | "every_2_days" | "every_3_days" | "weekly";
    },
    subtaskTitles: string[] = []
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const [newTask] = await db
        .insert(tasks)
        .values({
          userId: user.id,
          title: input.title,
          description: input.description || null,
          notes: input.notes || null,
          category: input.category,
          deadline: input.deadline,
          time: input.time || null,
          repeatOption: input.repeatOption || "none",
          repeatEndDate: input.repeatEndDate || null,
          status: "pending",
          reminderEnabled: input.reminderEnabled ? 1 : 0,
          reminderDaysBefore: input.reminderDaysBefore || 1,
          reminderTime: input.reminderTime || "09:00",
          reminderFrequency: input.reminderFrequency || "once",
          notificationIds: null,
        })
        .returning();

      // Schedule notifications
      if (input.reminderEnabled) {
        const notificationIds = await scheduleTaskNotification({
          id: newTask.id,
          title: newTask.title,
          category: newTask.category,
          deadline: newTask.deadline,
          time: newTask.time || undefined,
          repeatOption: newTask.repeatOption as any,
          repeatEndDate: newTask.repeatEndDate || undefined,
          reminderEnabled: true,
          reminderDaysBefore: input.reminderDaysBefore || 1,
          reminderTime: input.reminderTime || "09:00",
          reminderFrequency: input.reminderFrequency || "once",
        });

        if (notificationIds.length > 0) {
          await db
            .update(tasks)
            .set({ notificationIds: JSON.stringify(notificationIds) })
            .where(eq(tasks.id, newTask.id));
        }
      }

      // Subtasks hanya untuk category 'tugas'
      if (input.category === "tugas" && subtaskTitles.length > 0) {
        await db.insert(subtasks).values(
          subtaskTitles.map((title) => ({
            taskId: newTask.id,
            title,
            completed: 0,
          }))
        );
      }
      console.log("Notification addeed successfully!")
      await fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  };

  const updateTask = async (id: number, input: Partial<Task>) => {
    try {
      await db
        .update(tasks)
        .set({ ...input, updatedAt: new Date().toISOString() })
        .where(eq(tasks.id, id));
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      // Get task to cancel notifications
      const taskToDelete = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

      if (taskToDelete.length > 0 && taskToDelete[0].notificationIds) {
        await cancelTaskNotifications(taskToDelete[0].notificationIds);
      }

      await db.delete(tasks).where(eq(tasks.id, id));
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  const searchTasks = async (
    query: string,
    startDate?: Date,
    endDate?: Date,
    category?: "tugas" | "jadwal" | "kegiatan" | "all"
  ) => {
    if (!user) return;

    try {
      const conditions: any[] = [eq(tasks.userId, user.id)];

      if (query.trim()) {
        conditions.push(like(tasks.title, `%${query}%`));
      }

      if (startDate && endDate) {
        conditions.push(
          and(
            gte(tasks.deadline, startDate.toISOString()),
            lte(tasks.deadline, endDate.toISOString())
          )
        );
      }

      if (category && category !== "all") {
        conditions.push(eq(tasks.category, category));
      }

      const result = await db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt));

      setAllTasks(result as Task[]);
    } catch (error) {
      console.error("Error searching tasks:", error);
    }
  };

  const filterByCategory = async (category: "tugas" | "jadwal" | "kegiatan" | "all") => {
    if (!user) return;

    try {
      if (category === "all") {
        await fetchTasks();
        return;
      }

      const result = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.userId, user.id), eq(tasks.category, category)))
        .orderBy(desc(tasks.createdAt));

      setAllTasks(result as Task[]);
    } catch (error) {
      console.error("Error filtering tasks:", error);
    }
  };

  const sortByDeadline = async (order: "nearest" | "farthest" = "nearest") => {
    if (!user) return;

    try {
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, user.id))
        .orderBy(order === "nearest" ? asc(tasks.deadline) : desc(tasks.deadline));

      setAllTasks(result as Task[]);
    } catch (error) {
      console.error("Error sorting tasks:", error);
    }
  };

  const filterByStatus = async (status: "completed" | "pending" | "overdue" | "all") => {
    if (!user) return;

    try {
      const now = new Date().toISOString();
      let result: Task[];

      switch (status) {
        case "completed":
          result = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.userId, user.id), eq(tasks.status, "completed")))
            .orderBy(desc(tasks.createdAt)) as Task[];
          break;
        case "pending":
          result = await db
            .select()
            .from(tasks)
            .where(
              and(
                eq(tasks.userId, user.id),
                eq(tasks.status, "pending"),
                gte(tasks.deadline, now)
              )
            )
            .orderBy(asc(tasks.deadline)) as Task[];
          break;
        case "overdue":
          result = await db
            .select()
            .from(tasks)
            .where(
              and(
                eq(tasks.userId, user.id),
                lte(tasks.deadline, now)
              )
            )
            .orderBy(desc(tasks.deadline)) as Task[];
          break;
        default:
          await fetchTasks();
          return;
      }

      setAllTasks(result);
    } catch (error) {
      console.error("Error filtering by status:", error);
    }
  };

  return {
    tasks: allTasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
    searchTasks,
    filterByCategory,
    sortByDeadline,
    filterByStatus,
  };
}

export function useSubtasks(taskId: number) {
  const [taskSubtasks, setTaskSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const x = useSQLiteContext();
  const db = drizzle(x);

  const fetchSubtasks = async () => {
    if (!taskId) return;
    try {
      const result = await db
        .select()
        .from(subtasks)
        .where(eq(subtasks.taskId, taskId));
      setTaskSubtasks(result as Subtask[]);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const createSubtask = async (title: string) => {
    try {
      await db.insert(subtasks).values({
        taskId,
        title,
        completed: 0,
      });
      await fetchSubtasks();
    } catch (error) {
      console.error("Error creating subtask:", error);
      throw error;
    }
  };

  const toggleSubtask = async (id: number, completed: boolean) => {
    try {
      await db.update(subtasks).set({ completed }).where(eq(subtasks.id, id));
      await fetchSubtasks();
    } catch (error) {
      console.error("Error toggling subtask:", error);
      throw error;
    }
  };

  const deleteSubtask = async (id: number) => {
    try {
      await db.delete(subtasks).where(eq(subtasks.id, id));
      await fetchSubtasks();
    } catch (error) {
      console.error("Error deleting subtask:", error);
      throw error;
    }
  };

  return {
    subtasks: taskSubtasks,
    loading,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
    refreshSubtasks: fetchSubtasks,
  };
}