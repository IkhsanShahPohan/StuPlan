import { subtasks, tasks } from "@/db/schema";
import { and, desc, eq, gte, like, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  description: string | null;
  notes: string | null;
  deadline: string;
  status: "pending" | "in_progress" | "completed";
  reminderEnabled: number;
  reminderDaysBefore: number | null;
  notificationId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Subtask {
  id: number;
  taskId: number;
  title: string;
  completed: number;
  createdAt: string | null;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  notes: string | null;
  deadline: string;
  status: "pending" | "in_progress" | "completed";
  reminderEnabled: number;
  reminderDaysBefore: number | null;
  reminderTime: string | null;
  notificationId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Subtask {
  id: number;
  taskId: number;
  title: string;
  completed: number;
  createdAt: string | null;
}

export function useTasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const x = useSQLiteContext();
  const db = drizzle(x);

  const fetchTasks = async () => {
    try {
      const result = await db
        .select()
        .from(tasks)
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
  }, []);

  const createTask = async (
    input: {
      title: string;
      description?: string;
      notes?: string;
      deadline: string;
      reminderEnabled?: boolean;
      reminderDaysBefore?: number;
      reminderTime?: string;
    },
    subtaskTitles: string[]
  ) => {
    try {
      const [newTask] = await db
        .insert(tasks)
        .values({
          title: input.title,
          description: input.description || null,
          notes: input.notes || null,
          deadline: input.deadline,
          status: "pending",
          reminderEnabled: input.reminderEnabled ? 1 : 0,
          reminderDaysBefore: input.reminderDaysBefore || 1,
          reminderTime: input.reminderTime || "09:00",
          notificationId: null,
        })
        .returning();

      if (subtaskTitles.length > 0) {
        await db.insert(subtasks).values(
          subtaskTitles.map((title) => ({
            taskId: newTask.id,
            title,
            completed: 0,
          }))
        );
      }

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
    endDate?: Date
  ) => {
    try {
      const conditions: any[] = [];

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

      if (conditions.length === 0) {
        await fetchTasks();
        return;
      }

      const result = await db
        .select()
        .from(tasks)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(tasks.createdAt));

      setAllTasks(result as Task[]);
    } catch (error) {
      console.error("Error searching tasks:", error);
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
