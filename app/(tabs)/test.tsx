import { tasks, users } from "@/db/schema"; // schema kamu
import { supabase } from "@/lib/supabase";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Notifications from "expo-notifications";
import { useSQLiteContext } from "expo-sqlite";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InsertUsersScreen() {
  // Ambil DB dari SQLiteProvider
  const sqlite = useSQLiteContext();
  const db = drizzle(sqlite);

  const insertUsers = async () => {
    try {
      await db.insert(users).values([
        {
          id: "user-101",
          email: "john@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "user-102",
          email: "sarah@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "user-103",
          email: "michael@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      console.log("✅ Inserted sample users!");
    } catch (err) {
      console.error("❌ Insert error:", err);
    }
  };

  const loadTasks = async () => {
    try {
      const result = await db.select().from(tasks);
      //   setRows(result);
      console.log("Tasks:", result);
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hei man, how is your day?",
        body: "Here is the notification body",
        // vibrate:
        data: {
          data: "goes here",
          test: { test1: "more data" },
          id: 1,
        },
      },
      trigger: null,
    });
  }

  return (
    <SafeAreaView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>
          Insert Sample Users
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={schedulePushNotification}
        >
          <Text style={styles.buttonText}>Insert Users</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
