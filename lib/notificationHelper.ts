import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationConfig {
  taskId: number;
  title: string;
  body: string;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: Date;
  reminderEnabled: boolean;
  reminderMinutes: number; // Negatif dari deadline
  reminderTime: Date; // Calculated reminder datetime
  repeatEnabled: boolean;
  repeatMode?: "daily" | "weekly" | "monthly" | "yearly";
  repeatInterval?: number; // 1-6
  selectedDays?: number[]; // Array of day indices untuk weekly
  repeatEndOption?: "never" | "months";
  repeatEndMonths?: number; // 1-6 bulan
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
 * Main function: Schedule task notifications
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
    console.log(config.category);
    if (config.category === "tugas") {
      // TUGAS: Generate multiple notifications sampai deadline
      const ids = await scheduleTaskReminders(config);
      notificationIds.push(...ids);
    } else {
      // JADWAL & KEGIATAN
      if (config.repeatEnabled && config.repeatEndOption === "never") {
        // Use recurring notification
        const id = await scheduleRecurringReminder(config);
        if (id) notificationIds.push(id);
      } else {
        // Generate multiple notifications (1-6 bulan)
        const ids = await scheduleJadwalKegiatanReminders(config);
        notificationIds.push(...ids);
      }
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
 * Schedule notifications untuk TUGAS
 * Generate multiple single notifications sampai deadline
 */
const scheduleTaskReminders = async (
  config: NotificationConfig
): Promise<string[]> => {
  const notificationIds: string[] = [];
  const now = new Date();
  const deadline = new Date(config.deadline);

  // First reminder time (calculated from reminderMinutes)
  const firstReminderDate = new Date(config.reminderTime);
  firstReminderDate.setSeconds(0, 0);

  // Jika reminder pertama sudah lewat, skip
  if (firstReminderDate <= now) {
    console.warn("First reminder date is in the past");
    return notificationIds;
  }

  // Jika tidak ada repeat, buat 1 notifikasi saja
  if (!config.repeatEnabled || !config.repeatMode) {
    if (firstReminderDate <= deadline) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Pengingat: ${config.title}`,
          body: config.body,
          data: { taskId: config.taskId, category: config.category },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: firstReminderDate,
        },
      });

      notificationIds.push(id);
      console.log(
        `📅 Created 1 notification for ${firstReminderDate.toLocaleString()}`
      );
    }
    return notificationIds;
  }

  // Hitung interval dalam hari
  let intervalDays = 1;
  if (config.repeatMode === "daily") {
    intervalDays = config.repeatInterval || 1;
  } else if (config.repeatMode === "weekly") {
    intervalDays = (config.repeatInterval || 1) * 7;
  }

  // Untuk weekly dengan selected days
  if (
    config.repeatMode === "weekly" &&
    config.selectedDays &&
    config.selectedDays.length > 0
  ) {
    return await scheduleWeeklyTaskReminders(
      config,
      firstReminderDate,
      deadline,
      now
    );
  }

  const reminderDate2 = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    firstReminderDate.getHours(),
    firstReminderDate.getMinutes(),
    firstReminderDate.getSeconds(),
    firstReminderDate.getMilliseconds()
  );

  // Untuk daily
  const timeDiff = deadline.getTime() - reminderDate2.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const maxNotifications = Math.floor(daysDiff) + 1;
  const notificationCount = Math.min(maxNotifications, 100);

  const test = {
    notificationCount,
    deadline,
    firstReminderDate,
    intervalDays,
    reminderDate2,
    maxNotifications,
    daysDiff,
    timeDiff,
  };
  console.log("Tasks:", JSON.stringify(test, null, 2));

  if (notificationCount <= 0) {
    console.warn("No notifications to create (deadline too close)");
    return notificationIds;
  }

  let currentDate = new Date(reminderDate2);
  currentDate.setSeconds(0, 0);
  let count = 0;

  while (currentDate <= deadline && count < notificationCount) {
    if (currentDate > now) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Pengingat: ${config.title}`,
            body: config.body,
            data: { taskId: config.taskId, category: config.category },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(currentDate),
          },
        });

        notificationIds.push(id);
        count++;
        console.log(
          `📅 Scheduled notification ${count}/${notificationCount} for ${currentDate.toLocaleString()}`
        );
      } catch (error) {
        console.error(`Failed to schedule notification ${count + 1}:`, error);
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
    console.log("After++: ", currentDate);
  }

  return notificationIds;
};

/**
 * Schedule weekly task reminders dengan selected days
 */
const scheduleWeeklyTaskReminders = async (
  config: NotificationConfig,
  firstReminderDate: Date,
  deadline: Date,
  now: Date
): Promise<string[]> => {
  const notificationIds: string[] = [];
  const selectedDays = config.selectedDays || [];
  const interval = config.repeatInterval || 1;

  // Get time from first reminder
  const hours = firstReminderDate.getHours();
  const minutes = firstReminderDate.getMinutes();

  let currentWeekStart = new Date();
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setSeconds(0, 0);

  // Mundurkan ke hari Minggu terdekat
  const dayOfWeek = currentWeekStart.getDay();
  currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);
  const test = {
    selectedDays,
    interval,
    firstReminderDate,
    currentWeekStart,
    dayOfWeek,
  };
  console.log("Tasks:", JSON.stringify(test, null, 2));
  // return

  let count = 0;
  const maxNotifications = 100;

  while (currentWeekStart <= deadline && count < maxNotifications) {
    for (const day of selectedDays) {
      const notificationDate = new Date(currentWeekStart);
      notificationDate.setDate(currentWeekStart.getDate() + day);
      notificationDate.setHours(hours, minutes, 0, 0);
      notificationDate.setSeconds(0, 0);

      if (notificationDate > now && notificationDate <= deadline) {
        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ Pengingat: ${config.title}`,
              body: config.body,
              data: { taskId: config.taskId, category: config.category },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: notificationDate,
            },
          });

          notificationIds.push(id);
          count++;
          console.log(
            `📅 Scheduled notification for ${notificationDate.toLocaleString()}`
          );
        } catch (error) {
          console.error("Failed to schedule notification:", error);
        }
      }
    }

    // Next week(s)
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return notificationIds;
};

/**
 * Schedule notifications untuk JADWAL & KEGIATAN (with end months)
 * Generate multiple notifications hingga X bulan
 */
const scheduleJadwalKegiatanReminders = async (
  config: NotificationConfig
): Promise<string[]> => {
  const notificationIds: string[] = [];
  const now = new Date();
  const firstReminderDate = new Date(config.reminderTime);
  firstReminderDate.setSeconds(0, 0);

  if (firstReminderDate <= now) {
    // Set to next occurrence
    firstReminderDate.setDate(now.getDate() + 1);
  }

  // Calculate end date
  const endDate = new Date(now);
  if (config.repeatEndOption === "months" && config.repeatEndMonths) {
    endDate.setMonth(now.getMonth() + config.repeatEndMonths);
  } else {
    // Default 6 bulan jika tidak ada
    endDate.setMonth(now.getMonth() + 6);
  }

  if (!config.repeatEnabled || !config.repeatMode) {
    // Single notification
    if (firstReminderDate <= endDate) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${config.category === "jadwal" ? "Jadwal" : "Kegiatan"}: ${config.title}`,
          body: config.body,
          data: { taskId: config.taskId, category: config.category },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: firstReminderDate,
        },
      });

      notificationIds.push(id);
    }
    return notificationIds;
  }

  // Calculate interval
  let intervalDays = 1;
  if (config.repeatMode === "daily") {
    intervalDays = config.repeatInterval || 1;
  } else if (config.repeatMode === "weekly") {
    intervalDays = (config.repeatInterval || 1) * 7;
  } else if (config.repeatMode === "monthly") {
    // Handled separately
    return await scheduleMonthlyReminders(
      config,
      firstReminderDate,
      endDate,
      now
    );
  } else if (config.repeatMode === "yearly") {
    // Handled separately
    return await scheduleYearlyReminders(
      config,
      firstReminderDate,
      endDate,
      now
    );
  }

  // For weekly with selected days
  if (
    config.repeatMode === "weekly" &&
    config.selectedDays &&
    config.selectedDays.length > 0
  ) {
    return await scheduleWeeklyJadwalReminders(
      config,
      firstReminderDate,
      endDate,
      now
    );
  }

  // For daily
  let currentDate = new Date(firstReminderDate);
  let count = 0;
  const maxNotifications = 100;

  while (currentDate <= endDate && count < maxNotifications) {
    if (currentDate > now) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ ${config.category === "jadwal" ? "Jadwal" : "Kegiatan"}: ${config.title}`,
            body: config.body,
            data: { taskId: config.taskId, category: config.category },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(currentDate),
          },
        });
        console.log(
          `📅 Scheduled notification ${count} for ${currentDate.toLocaleString()}`
        );
        notificationIds.push(id);
        count++;
      } catch (error) {
        console.error("Failed to schedule notification:", error);
      }
    }

    currentDate.setDate(currentDate.getDate() + intervalDays);
    currentDate.setSeconds(0, 0);
  }

  return notificationIds;
};

/**
 * Schedule weekly jadwal/kegiatan dengan selected days
 */
const scheduleWeeklyJadwalReminders = async (
  config: NotificationConfig,
  firstReminderDate: Date,
  endDate: Date,
  now: Date
): Promise<string[]> => {
  const notificationIds: string[] = [];
  const selectedDays = config.selectedDays || [];
  const interval = config.repeatInterval || 1;

  const hours = firstReminderDate.getHours();
  const minutes = firstReminderDate.getMinutes();

  let currentWeekStart = new Date(firstReminderDate);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setSeconds(0, 0);

  const dayOfWeek = currentWeekStart.getDay();
  currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);

  let count = 0;
  const maxNotifications = 100;

  while (currentWeekStart <= endDate && count < maxNotifications) {
    for (const day of selectedDays) {
      const notificationDate = new Date(currentWeekStart);
      notificationDate.setDate(currentWeekStart.getDate() + day);
      notificationDate.setHours(hours, minutes, 0, 0);
      notificationDate.setSeconds(0, 0);

      if (notificationDate > now && notificationDate <= endDate) {
        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ ${config.category === "jadwal" ? "Jadwal" : "Kegiatan"}: ${config.title}`,
              body: config.body,
              data: { taskId: config.taskId, category: config.category },
              sound: true,
            },
            trigger: {
              date: notificationDate,
              type: Notifications.SchedulableTriggerInputTypes.DATE,
            },
          });

          notificationIds.push(id);
          count++;
        } catch (error) {
          console.error("Failed to schedule notification:", error);
        }
      }
    }

    currentWeekStart.setDate(currentWeekStart.getDate() + 7 * interval);
  }

  return notificationIds;
};

/**
 * Schedule monthly reminders
 */
const scheduleMonthlyReminders = async (
  config: NotificationConfig,
  firstReminderDate: Date,
  endDate: Date,
  now: Date
): Promise<string[]> => {
  const notificationIds: string[] = [];
  const dayOfMonth = firstReminderDate.getDate();
  const hours = firstReminderDate.getHours();
  const minutes = firstReminderDate.getMinutes();

  let currentDate = new Date(firstReminderDate);
  currentDate.setSeconds(0, 0);

  let count = 0;
  const maxNotifications = 100;

  while (currentDate <= endDate && count < maxNotifications) {
    if (currentDate > now) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ ${config.category === "jadwal" ? "Jadwal" : "Kegiatan"}: ${config.title}`,
            body: config.body,
            data: { taskId: config.taskId, category: config.category },
            sound: true,
          },
          trigger: {
            date: new Date(currentDate),
            type: Notifications.SchedulableTriggerInputTypes.DATE,
          },
        });

        notificationIds.push(id);
        count++;
      } catch (error) {
        console.error("Failed to schedule notification:", error);
      }
    }

    // Next month, same day
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(dayOfMonth);
    currentDate.setHours(hours, minutes, 0, 0);
  }

  return notificationIds;
};

/**
 * Schedule yearly reminders
 */
const scheduleYearlyReminders = async (
  config: NotificationConfig,
  firstReminderDate: Date,
  endDate: Date,
  now: Date
): Promise<string[]> => {
  const notificationIds: string[] = [];
  const month = firstReminderDate.getMonth();
  const day = firstReminderDate.getDate();
  const hours = firstReminderDate.getHours();
  const minutes = firstReminderDate.getMinutes();

  let currentDate = new Date(firstReminderDate);
  currentDate.setSeconds(0, 0);

  let count = 0;
  const maxNotifications = 10; // Max 10 tahun

  while (currentDate <= endDate && count < maxNotifications) {
    if (currentDate > now) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ ${config.category === "jadwal" ? "Jadwal" : "Kegiatan"}: ${config.title}`,
            body: config.body,
            data: { taskId: config.taskId, category: config.category },
            sound: true,
          },
          trigger: {
            date: new Date(currentDate),
            type: Notifications.SchedulableTriggerInputTypes.DATE,
          },
        });

        notificationIds.push(id);
        count++;
      } catch (error) {
        console.error("Failed to schedule notification:", error);
      }
    }

    // Next year
    currentDate.setFullYear(currentDate.getFullYear() + 1);
    currentDate.setMonth(month);
    currentDate.setDate(day);
    currentDate.setHours(hours, minutes, 0, 0);
  }

  return notificationIds;
};

/**
 * Schedule recurring notification untuk JADWAL & KEGIATAN (repeat = never)
 * Use Expo's recurring notification types
 */
const scheduleRecurringReminder = async (
  config: NotificationConfig
): Promise<string | null> => {
  const now = new Date();
  const firstReminderDate = new Date(config.reminderTime);
  firstReminderDate.setSeconds(0, 0);

  const repeatOption = config.repeatMode;
  const hours = firstReminderDate.getHours();
  const minutes = firstReminderDate.getMinutes();

  let trigger: any;
  const test = {
    firstReminderDate,
    repeatOption,
  };
  console.log("Tasks:", JSON.stringify(test, null, 2));

  if (!repeatOption) {
    trigger = firstReminderDate;
  } else if (repeatOption === "daily") {
    trigger = {
      hour: hours,
      minute: minutes,
      type: "daily",
    };
  } else if (
    repeatOption === "weekly" &&
    config.selectedDays &&
    config.selectedDays.length > 0
  ) {
    // For multiple days, create separate recurring notifications
    const ids: string[] = [];
    let count = 0;
    for (const day of config.selectedDays) {
      const weekday = day === 0 ? 7 : day; // Convert Sunday from 0 to 7

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${config.category === "jadwal" ? "Jadwal" : "Kegiatan"}: ${config.title}`,
          body: config.body,
          data: { taskId: config.taskId, category: config.category },
          sound: true,
        },
        trigger: {
          type: "weekly",
          weekday,
          hour: hours,
          minute: minutes,
        },
      });

      ids.push(id);
      count;
      console.log(`📅 Created ${count} notification`);
    }
    return ids.join(","); // Return comma-separated IDs
  } else if (repeatOption === "monthly") {
    console.log("monthly");

    const day = firstReminderDate.getDate();
    trigger = {
      day,
      hour: hours,
      minute: minutes,
      type: "monthly",
    };
  } else if (repeatOption === "yearly") {
    const month = firstReminderDate.getMonth() + 1;
    const day = firstReminderDate.getDate();
    trigger = {
      month,
      day,
      hour: hours,
      minute: minutes,
      type: "yearly",
    };
  } else {
    trigger = firstReminderDate;
  }

  console.log(`📅 Created 1 notification for ${trigger}`);
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ ${config.category === "jadwal" ? "Jadwal" : "Kegiatan"}: ${config.title}`,
      body: config.body,
      data: { taskId: config.taskId, category: config.category },
    },
    trigger,
  });

  return id;
};

/**
 * Cancel notifications
 */
export const cancelTaskNotifications = async (
  notificationIds: string[]
): Promise<void> => {
  try {
    if (!notificationIds || notificationIds.length === 0) {
      return;
    }

    for (const id of notificationIds) {
      // Handle comma-separated IDs (from recurring weekly)
      if (id.includes(",")) {
        const ids = id.split(",");
        for (const subId of ids) {
          await Notifications.cancelScheduledNotificationAsync(subId);
        }
      } else {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
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
