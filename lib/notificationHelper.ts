import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationConfig {
  taskId: number;
  title: string;
  body: string;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: Date;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  reminderTime: string; // Format HH:mm
  repeatEnabled: boolean;
  repeatOption: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  customInterval?: number;
  customUnit?: "days" | "weeks" | "months" | "years";
  endOption?: "never" | "deadline";
}

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Notification permissions not granted");
    return false;
  }

  // Setup notification channel untuk Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return true;
};

/**
 * Membuat notifikasi berdasarkan konfigurasi task
 */
export const scheduleTaskNotifications = async (
  config: NotificationConfig
): Promise<string[]> => {
  const notificationIds: string[] = [];

  if (!config.reminderEnabled) {
    return notificationIds;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return notificationIds;
  }

  try {
    // Parse reminder time (HH:mm)
    const [hours, minutes] = config.reminderTime.split(":").map(Number);

    if (config.category === "tugas") {
      // TUGAS: Create multiple notifications sampai deadline
      const ids = await scheduleTaskReminders(config, hours, minutes);
      notificationIds.push(...ids);
    } else {
      // JADWAL & KEGIATAN: Create recurring notification
      const id = await scheduleRecurringReminder(config, hours, minutes);
      if (id) notificationIds.push(id);
    }

    console.log(
      `✅ Created ${notificationIds.length} notification(s) for task ${config.taskId}`
    );
    return notificationIds;
  } catch (error) {
    console.error("Error scheduling notifications:", error);
    return notificationIds;
  }
};

/**
 * Schedule notifications untuk TUGAS (multiple notifications sampai deadline)
 */
const scheduleTaskReminders = async (
  config: NotificationConfig,
  hours: number,
  minutes: number
): Promise<string[]> => {
  console.log("config ", config);
  const notificationIds: string[] = [];
  const now = new Date();
  const deadline = new Date(config.deadline);

  // Hitung tanggal reminder pertama
  const firstReminderDate = new Date(new Date());
  firstReminderDate.setDate(new Date().getDate() - config.reminderDaysBefore);
  firstReminderDate.setHours(hours, minutes, 0, 0);

  // Jika reminder pertama sudah lewat, set ke hari ini dengan jam yang sesuai
  if (firstReminderDate <= now) {
    firstReminderDate.setDate(firstReminderDate.getDate() + 1);
    // firstReminderDate.setTime(now.getTime());
    // firstReminderDate.setHours(hours, minutes, 0, 0);

    // Jika jam hari ini sudah lewat, mulai besok
    // if (firstReminderDate <= now) {
    // }
  }

  // Jika tidak ada repeat atau repeat = none, buat 1 notifikasi saja
  if (!config.repeatEnabled || config.repeatOption === "none") {
    if (firstReminderDate <= deadline) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Pengingat: ${config.title}`,
          body: config.body,
          data: { taskId: config.taskId, category: config.category },
          sound: true,
        },
        trigger: {
          date: firstReminderDate,
          type: "date",
        },
      });

      notificationIds.push(id);
      console.log(
        `📅 Created 1 Single notification for ${firstReminderDate.toLocaleString()}`
      );
    }
    return notificationIds;
  }

  // Hitung interval dalam hari berdasarkan repeatOption
  let intervalDays = 1;

  switch (config.repeatOption) {
    case "daily":
      intervalDays = 1;
      break;
    case "weekly":
      intervalDays = 7;
      break;
    case "monthly":
      intervalDays = 30; // Approximate
      break;
    case "yearly":
      intervalDays = 365;
      break;
    case "custom":
      if (config.customInterval && config.customUnit) {
        intervalDays = calculateIntervalDays(
          config.customInterval,
          config.customUnit
        );
      }
      break;
  }

  // Hitung berapa kali notifikasi perlu dibuat
  const timeDiff = deadline.getTime() - firstReminderDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const maxNotifications = Math.floor(daysDiff / intervalDays) + 1;

  console.log(`📊 Calculation:
    - First reminder: ${firstReminderDate.toLocaleDateString()}
    - Deadline: ${deadline.toLocaleDateString()}
    - Days difference: ${daysDiff}
    - Interval: ${intervalDays} days
    - Max notifications: ${maxNotifications}
  `);

  // Batasi maksimal 100 notifikasi untuk safety
  const notificationCount = Math.min(maxNotifications, 100);

  if (notificationCount <= 0) {
    console.warn(
      "No notifications to create (deadline too close or already passed)"
    );
    return notificationIds;
  }

  // Create notifications
  let currentDate = new Date(firstReminderDate);
  let count = 0;

  while (currentDate <= deadline && count < notificationCount) {
    if (currentDate > now) {
      try {
        const date = new Date(currentDate);

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Pengingat: ${config.title}`,
            body: config.body,
            data: { taskId: config.taskId, category: config.category },
            sound: true,
          },
          trigger: {
            date,
            type: "date",
          },
        });

        notificationIds.push(id);
        count++;

        console.log(
          `📅 Scheduled notification ${count}/${notificationCount} for ${date.toLocaleString()}`
        );
      } catch (error) {
        console.error(`Failed to schedule notification ${count + 1}:`, error);
      }
    }

    // Move to next interval
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + intervalDays);
  }

  console.log(
    `✅ Created ${notificationIds.length} notification(s) for TUGAS with ${config.repeatOption} repeat`
  );

  return notificationIds;
};

/**
 * Schedule recurring notification untuk JADWAL & KEGIATAN
 */
const scheduleRecurringReminder = async (
  config: NotificationConfig,
  hours: number,
  minutes: number
): Promise<string | null> => {
  const now = new Date();
  const deadline = new Date(config.deadline);

  // Hitung tanggal reminder pertama
  const firstReminderDate = new Date(deadline);
  firstReminderDate.setDate(deadline.getDate() - config.reminderDaysBefore);
  firstReminderDate.setHours(hours, minutes, 0, 0);

  if (firstReminderDate <= now) {
    console.warn("First reminder date is in the past");
    // Jika endOption = never, set ke next occurrence
    if (config.endOption === "never") {
      // Calculate next occurrence
      firstReminderDate.setDate(now.getDate() + 1);
      firstReminderDate.setHours(hours, minutes, 0, 0);
    } else {
      return null;
    }
  }

  let trigger: any;

  // Buat trigger sesuai repeatOption
  switch (config.repeatOption) {
    case "daily":
      trigger = {
        type: "daily" as const,
        hour: hours,
        minute: minutes,
      };
      break;

    case "weekly":
      // Get weekday dari first reminder (1 = Monday, 7 = Sunday in expo)
      const weekday = firstReminderDate.getDay();
      const expoWeekday = weekday === 0 ? 7 : weekday; // Convert Sunday from 0 to 7

      trigger = {
        type: "weekly" as const,
        hour: hours,
        minute: minutes,
        weekday: expoWeekday,
      };
      break;

    case "monthly":
      // Expo menggunakan CalendarNotificationTrigger untuk monthly
      const day = firstReminderDate.getDate();

      trigger = {
        type: "monthly" as const,
        repeats: true,
        hour: hours,
        minute: minutes,
        day: day,
      };
      break;

    case "yearly":
      const month = firstReminderDate.getMonth(); // 1-12
      const yearDay = firstReminderDate.getDate();

      trigger = {
        type: "yearly" as const,
        repeats: true,
        hour: hours,
        minute: minutes,
        day: yearDay,
        month: month,
      };
      break;

    case "custom":
      // Untuk custom, kita gunakan calendar trigger dengan repeats
      if (config.customUnit === "days") {
        // Daily dengan interval
        trigger = {
          type: "daily" as const,
          hour: hours,
          minute: minutes,
        };
        // Note: Expo tidak support interval untuk daily, jadi kita fallback ke daily
        console.warn("Custom days interval not fully supported, using daily");
      } else if (config.customUnit === "weeks") {
        trigger = {
          type: "weekly" as const,
          hour: hours,
          minute: minutes,
          weekday: firstReminderDate.getDay() || 7,
        };
      } else {
        // Fallback untuk months/years
        trigger = firstReminderDate;
      }
      break;

    default:
      // No repeat, just schedule once
      trigger = firstReminderDate;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ ${config.category === "jadwal" ? "Jadwal" : "Kegiatan"}: ${config.title}`,
      body: config.body,
      data: { taskId: config.taskId, category: config.category },
      sound: true,
    },
    trigger,
  });

  return id;
};

/**
 * Convert custom interval to days
 */
const calculateIntervalDays = (
  interval: number,
  unit: "days" | "weeks" | "months" | "years"
): number => {
  switch (unit) {
    case "days":
      return interval;
    case "weeks":
      return interval * 7;
    case "months":
      return interval * 30; // Approximate
    case "years":
      return interval * 365; // Approximate
  }
};

/**
 * Cancel semua notifikasi untuk task tertentu
 */
export const cancelTaskNotifications = async (
  notificationIds: string[]
): Promise<void> => {
  try {
    if (!notificationIds || notificationIds.length === 0) {
      return;
    }

    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    console.log(`✅ Cancelled ${notificationIds.length} notification(s)`);
  } catch (error) {
    console.error("Error cancelling notifications:", error);
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("✅ Cancelled all notifications");
  } catch (error) {
    console.error("Error cancelling all notifications:", error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getAllScheduledNotifications = async () => {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📋 Total scheduled notifications: ${notifications.length}`);
    return notifications;
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
};
