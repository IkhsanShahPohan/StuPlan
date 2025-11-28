import migrations from "@/drizzle/migrations";
import { AuthProvider } from "@/lib/AuthContext";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { SQLiteProvider, openDatabaseSync } from "expo-sqlite";
import { Suspense, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export const DATABASE_NAME = "tasks";

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
      const id = notification.request.content.data?.id;
      console.log(id);
      router.push(`/tasks/${id}`);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      }
    );

    const last = Notifications.getLastNotificationResponse();
    console.log(last);
    if (last?.notification) {
      redirect(last.notification);
    }

    return () => {
      subscription.remove();
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
          <Stack screenOptions={{ headerShown: false }} />
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
      seconds: 2,
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

  // if (Device.isDevice) {
  //   const { status: existingStatus } =
  //     await Notifications.getPermissionsAsync();
  //   let finalStatus = existingStatus;
  //   if (existingStatus !== "granted") {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     finalStatus = status;
  //   }
  //   if (finalStatus !== "granted") {
  //     alert("Failed to get push token for push notification!");
  //     return;
  //   }
  //   // Learn more about projectId:
  //   // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
  //   // EAS projectId is used here.
  //   try {
  //     const projectId =
  //       Constants?.expoConfig?.extra?.eas?.projectId ??
  //       Constants?.easConfig?.projectId;
  //     if (!projectId) {
  //       throw new Error("Project ID not found");
  //     }
  //     token = (
  //       await Notifications.getExpoPushTokenAsync({
  //         projectId,
  //       })
  //     ).data;
  //     console.log(token);
  //   } catch (e) {
  //     token = `${e}`;
  //   }
  // } else {
  //   alert("Must use physical device for Push Notifications");
  // }

  return token;
}
