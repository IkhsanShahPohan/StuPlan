/**
 * lib/backupReminderHelper.ts
 * Helper untuk schedule weekly backup reminder setiap Minggu
 *
 * Features:
 * - Schedule notifikasi setiap Minggu pukul 09:00
 * - Cancel reminder
 * - Check reminder status
 * - Persistent storage untuk notification ID
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const BACKUP_REMINDER_KEY = "backup_reminder_notification_id";

/**
 * Schedule weekly backup reminder
 * Setiap hari Minggu pukul 09:00
 */
export const scheduleBackupReminder = async (): Promise<string | null> => {
  try {
    // Request permission first
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        console.log("❌ Notification permission not granted");
        return null;
      }
    }

    // Cancel existing reminder if any
    await cancelBackupReminder();

    // Schedule new weekly notification
    // Trigger: Setiap Minggu (weekday: 1 = Sunday) pukul 09:00
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Waktunya Cadangkan Data!",
        body: "Jangan lupa mencadangkan tugas dan data penting Anda ke cloud untuk menjaga keamanan.",
        data: {
          type: "backup_reminder",
          action: "open_backup_settings",
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        weekday: 1, // 1 = Sunday (Minggu)
        hour: 9,
        minute: 0,
        type: "weekly",
      },
    });

    // Save notification ID to AsyncStorage
    await AsyncStorage.setItem(BACKUP_REMINDER_KEY, notificationId);

    console.log("✅ Backup reminder scheduled:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("❌ Error scheduling backup reminder:", error);
    return null;
  }
};

/**
 * Cancel backup reminder
 */
export const cancelBackupReminder = async (): Promise<void> => {
  try {
    // Get stored notification ID
    const notificationId = await AsyncStorage.getItem(BACKUP_REMINDER_KEY);

    if (notificationId) {
      // Cancel the notification
      await Notifications.cancelScheduledNotificationAsync(notificationId);

      // Remove from storage
      await AsyncStorage.removeItem(BACKUP_REMINDER_KEY);

      console.log("✅ Backup reminder cancelled:", notificationId);
    }
  } catch (error) {
    console.error("❌ Error cancelling backup reminder:", error);
  }
};

/**
 * Check if backup reminder is enabled
 */
export const checkBackupReminderStatus = async (): Promise<boolean> => {
  try {
    const notificationId = await AsyncStorage.getItem(BACKUP_REMINDER_KEY);

    if (!notificationId) {
      return false;
    }

    // Verify if notification still exists
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const exists = scheduledNotifications.some(
      (notif) => notif.identifier === notificationId
    );

    if (!exists) {
      // Notification was cancelled elsewhere, clean up storage
      await AsyncStorage.removeItem(BACKUP_REMINDER_KEY);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error checking backup reminder status:", error);
    return false;
  }
};

/**
 * Get next backup reminder date
 */
export const getNextBackupReminderDate = (): Date => {
  const now = new Date();
  const nextSunday = new Date(now);

  // Calculate days until next Sunday
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  nextSunday.setDate(now.getDate() + daysUntilSunday);

  // Set time to 09:00
  nextSunday.setHours(9, 0, 0, 0);

  return nextSunday;
};

/**
 * Format next reminder date for display
 */
export const formatNextReminderDate = (): string => {
  const nextDate = getNextBackupReminderDate();

  return nextDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
