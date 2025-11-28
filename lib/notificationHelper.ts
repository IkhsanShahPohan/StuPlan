import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permissions
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "TaskMaster Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#007AFF",
        sound: "default",
      });
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

// Calculate smart default reminder time (3 hours before deadline)
export function getSmartReminderTime(deadline: Date, time?: string): Date {
  const reminderDate = new Date(deadline);

  if (time) {
    const [hours, minutes] = time.split(":");
    reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    // Subtract 3 hours
    reminderDate.setHours(reminderDate.getHours() - 3);
  } else {
    // If no time specified, set to 9 AM of the deadline day
    reminderDate.setHours(9, 0, 0, 0);
  }

  return reminderDate;
}

// Schedule notification for task/schedule/activity with repeat support
export async function scheduleTaskNotification(task: {
  id: number;
  title: string;
  category: "tugas" | "jadwal" | "kegiatan";
  deadline: string;
  time?: string;
  repeatOption?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  repeatEndDate?: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  reminderTime: string;
  reminderFrequency:
    | "once"
    | "daily"
    | "every_2_days"
    | "every_3_days"
    | "weekly";
}): Promise<string[]> {
  if (!task.reminderEnabled) return [];

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log("❌ Notification permissions not granted");
    return [];
  }

  const notificationIds: string[] = [];
  const deadline = new Date(task.deadline);
  const [hours, minutes] = task.reminderTime.split(":");

  // Get category emoji and label
  const categoryInfo = {
    tugas: { emoji: "📋", label: "Tugas" },
    jadwal: { emoji: "🎓", label: "Jadwal" },
    kegiatan: { emoji: "📅", label: "Kegiatan" },
  };

  const { emoji, label } = categoryInfo[task.category];

  try {
    // Handle repeat notifications for jadwal & kegiatan
    if (
      task.repeatOption &&
      task.repeatOption !== "none" &&
      (task.category === "jadwal" || task.category === "kegiatan")
    ) {
      const repeatEndDate = task.repeatEndDate
        ? new Date(task.repeatEndDate)
        : null;
      const endDate =
        repeatEndDate ||
        new Date(deadline.getTime() + 365 * 24 * 60 * 60 * 1000); // Max 1 year

      let currentDate = new Date(deadline);
      let occurrenceCount = 0;
      const maxOccurrences = 100; // Safety limit

      while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
        // Calculate reminder time for this occurrence
        const reminderDate = new Date(currentDate);
        reminderDate.setDate(reminderDate.getDate() - task.reminderDaysBefore);
        reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (reminderDate > new Date()) {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${emoji} ${label} Reminder`,
              body: `"${task.title}" ${task.time ? `pukul ${task.time}` : "hari ini"}`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: { taskId: task.id, category: task.category },
            },
            trigger: {
              date: reminderDate,
              type: "date",
            },
          });

          notificationIds.push(id);
        }

        // Move to next occurrence
        switch (task.repeatOption) {
          case "daily":
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case "weekly":
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case "yearly":
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
        }

        occurrenceCount++;
      }
    }
    // For tugas with multiple frequency
    else if (task.category === "tugas" && task.reminderFrequency !== "once") {
      const frequencies = {
        daily: 1,
        every_2_days: 2,
        every_3_days: 3,
        weekly: 7,
      };

      const dayInterval =
        frequencies[task.reminderFrequency as keyof typeof frequencies];
      let currentDate = new Date(deadline);
      currentDate.setDate(currentDate.getDate() - task.reminderDaysBefore);
      currentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Schedule multiple notifications up to deadline
      while (currentDate < deadline) {
        if (currentDate > new Date()) {
          const daysUntilDeadline = Math.ceil(
            (deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${emoji} ${label} Reminder`,
              body:
                daysUntilDeadline === 0
                  ? `"${task.title}" deadline hari ini!`
                  : `"${task.title}" deadline dalam ${daysUntilDeadline} hari`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: { taskId: task.id, category: task.category },
            },
            trigger: {
              date: currentDate,
            },
          });

          notificationIds.push(id);
        }

        currentDate.setDate(currentDate.getDate() + dayInterval);
      }
    }
    // Single notification for tugas with "once" or jadwal/kegiatan without repeat
    else {
      const reminderDate = new Date(deadline);
      reminderDate.setDate(reminderDate.getDate() - task.reminderDaysBefore);
      reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (reminderDate > new Date()) {
        const daysUntilEvent = task.reminderDaysBefore;

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${emoji} ${label} Reminder`,
            body:
              daysUntilEvent === 0
                ? `"${task.title}" ${task.category === "tugas" ? "deadline" : ""} hari ini!${task.time ? ` Pukul ${task.time}` : ""}`
                : `"${task.title}" ${task.category === "tugas" ? "deadline" : ""} dalam ${daysUntilEvent} hari${task.time ? ` (${task.time})` : ""}`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { taskId: task.id, category: task.category },
          },
          trigger: {
            date: reminderDate,
            type: "date",
          },
        });

        notificationIds.push(id);
      }
    }

    console.log(
      `✅ Scheduled ${notificationIds.length} notification(s) for ${label} #${task.id}`
    );
    return notificationIds;
  } catch (error) {
    console.error("❌ Error scheduling notifications:", error);
    return [];
  }
}

// Cancel notifications
export async function cancelTaskNotifications(notificationIds: string | null) {
  if (!notificationIds) return;

  try {
    const ids = JSON.parse(notificationIds);
    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    console.log(`✅ Cancelled ${ids.length} notification(s)`);
  } catch (error) {
    console.error("❌ Error cancelling notifications:", error);
  }
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📱 ${notifications.length} notifications scheduled`);
    return notifications;
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}

// Initialize notifications on app start
export async function initializeNotifications() {
  try {
    await requestNotificationPermissions();

    // Listen for notification responses
    Notifications.addNotificationResponseReceivedListener((response) => {
      const { taskId, category } = response.notification.request.content.data;
      console.log(`📱 User tapped notification for ${category} #${taskId}`);
      // You can navigate to task detail here if needed
    });

    console.log("✅ Notifications initialized");
  } catch (error) {
    console.error("❌ Error initializing notifications:", error);
  }
}
