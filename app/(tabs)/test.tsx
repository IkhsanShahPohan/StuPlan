import { tasks, users } from "@/db/schema"; // schema kamu
import { supabase } from "@/lib/supabase";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Notifications from "expo-notifications";
import { useSQLiteContext } from "expo-sqlite";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InsertUsersScreen() {
  const sqlite = useSQLiteContext();
  const db = drizzle(sqlite);

  const loadTasks = async () => {
    try {
      const result = await db.select().from(tasks);
      //   setRows(result);
      console.log("Tasks:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Select error:", error);
    }
  };

  const delTask = async () => {
    try {
      await db.delete(tasks);
      console.log("Success!");
    } catch (error) {
      console.log("Gagal");
    }
  };

  const clearUserFields = async (userId: string) => {
    try {
      await db
        .update(users)
        .set({
          fullName: null,
          birthDate: null,
          educationLevel: null,
          institution: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error clearing user fields:", error);
    }
  };

  const loadProfile = async () => {
    try {
      const result = await db.select().from(users);
      //   setRows(result);
      console.log("User:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Select error:", error);
    }
  };

  const check = async () => {
    console.log("test");
    const all = await Notifications.getAllScheduledNotificationsAsync();
    console.log("🔍 Semua notif:", all);
  };

  const loadTasksSupa = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      console.log("Tasks:", user);
    } catch (error) {
      console.error("Select error:", error);
    }
  };

  async function schedulePushNotification() {
    console.log("reulst");
    const result = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hei man, how is your day?",
        body: "Here is the notification body",
        sound: "tung.mp3",
        data: {
          data: "goes here",
          test: { test1: "more data" },
          id: 1,
        },
      },
      trigger: null,
    });
    console.log("Result Notification: ", result);
  }

  async function seeAllNotification() {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    console.log(JSON.stringify(pending, null, 2));
  }

  async function scheduleAndCancel(identifier: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log("Berhasil hapus notifikasi dengan identifier ", identifier);
    } catch (error) {
      console.log(error);
    }
  }

  async function cancelAll() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("Berhasil cancel!");
    } catch (error) {}
  }

  async function cancelAllNotifications() {
    const arr = [
      "082ef028-af12-47e0-a3cb-e3c9652142fd",
      "1dc02b2a-290a-418a-bdc3-ea237585856c",
      "32f80555-1980-43bd-b4cc-812488416e4d",
    ];

    for (const id of arr) {
      await scheduleAndCancel(id);
      console.log("Berhasil hapus notifikasi dengan identifier ", id);
    }
  }

  async function checkNotificatinDaily() {
    try {
      const result = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Pengingat Harian",
          body: "Saatnya cek tugasmu hari ini!",
        },
        trigger: {
          type: "daily",
          hour: 16,
          minute: 52,
        },
      });
      console.log("Result: ", result);
      console.log("Sucess notifikasi harian!");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 20, gap: 20 }}>
          Insert Sample Users
        </Text>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={loadTasks}
        >
          <Text style={styles.buttonText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={loadProfile}
        >
          <Text style={styles.buttonText}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={seeAllNotification}
        >
          <Text style={styles.buttonText}>See All Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={schedulePushNotification}
        >
          <Text style={styles.buttonText}>Schedule Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={() =>
            clearUserFields("34faaf39-2208-4b11-a733-c62885210a62")
          }
        >
          <Text style={styles.buttonText}>Delete User Information</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={cancelAll}
        >
          <Text style={styles.buttonText}>Cancel Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={delTask}
        >
          <Text style={styles.buttonText}>Hapus Task!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={() => router.push("")}
        >
          <Text style={styles.buttonText}>Hapus Task!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3A7CFD", // biru elegan
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",

    // bayangan halus (iOS + Android)
    shadowColor: "#3A7CFD",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
