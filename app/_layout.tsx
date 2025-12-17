import { AlertProvider } from "@/components/useAlert";
import migrations from "@/drizzle/migrations";
import { AuthProvider } from "@/lib/AuthContext";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider, openDatabaseSync } from "expo-sqlite";
import { Suspense, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export const DATABASE_NAME = "tasks";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function AuthLayout() {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }

    // Redirect notification
    function redirect(notification: Notifications.Notification) {
      const id = notification.request.content.data?.taskId;
      console.log(id);
      if (!id) return;
      router.push(`/tasks/${id}`);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      }
    );

    // Delay pengecekan last notification
    const timer = setTimeout(async () => {
      const last = await Notifications.getLastNotificationResponseAsync();
      console.log(last);
      if (last?.notification) {
        redirect(last.notification);
      }
    }, 500); // Tunggu 500ms untuk memastikan layout sudah mounted9

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, []);

  if (error) {
    console.log(error);
    return (
      <SafeAreaView>
        <View>
          <Text>Migration error: {error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense
      >
        <AuthProvider>
          <AlertProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AlertProvider>
        </AuthProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "A channel is needed for the permissions prompt to appear",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    return token;
  }
}
