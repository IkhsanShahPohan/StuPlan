// import NotificationButton from "@/components/ComponentButton";
import { subtasks, tasks } from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Platform, Alert } from "react-native";

// Setup notification handler


const tasksc = () => {
  const x = useSQLiteContext();
  const db = drizzle(x);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request notification permissions saat component mount
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // Function untuk request permission
  async function registerForPushNotificationsAsync() {
    // Setup Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Check if running on real device
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission jika belum granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings"
        );
        setPermissionGranted(false);
        return;
      }

      setPermissionGranted(true);
      console.log("Notification permission granted!");
    } else {
      Alert.alert("Error", "Must use physical device for notifications");
    }
  }

  const showNotification = async () => {
    if (!permissionGranted) {
      Alert.alert(
        "Permission Required",
        "Please allow notifications first",
        [
          {
            text: "Request Permission",
            onPress: () => registerForPushNotificationsAsync(),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Look at that notification 📬",
          body: "I'm so proud of myself!",
          data: { data: "goes here" },
        },
        trigger: null, // null = immediate notification
      });
      console.log("Notification scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling notification:", error);
      Alert.alert("Error", "Failed to schedule notification");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Tasks Page</Text>
      
      {/* Status permission */}
      <Text className="text-sm text-gray-600 mb-4">
        Notification Permission: {permissionGranted ? "✅ Granted" : "❌ Not Granted"}
      </Text>

      <View className="absolute bottom-32 right-6">
        <TouchableOpacity
          className="bg-[#6B4545] w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={showNotification}
        >
          <Text className="text-white text-3xl">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default tasksc;

  // async function seedDummyData() {
  //   try {
  //     // Cek apakah sudah ada data
  //     const existingTasks = await db.select().from(tasks);

  //     if (existingTasks.length > 0) {
  //       console.log("ℹ️  Data already exists, skipping seed");
  //       return;
  //     }

  //     console.log("🌱 Seeding dummy data...");

  //     // Insert dummy tasks
  //     const [task1] = await db
  //       .insert(tasks)
  //       .values({
  //         title: "Selesaikan Project Mobile App",
  //         description:
  //           "Membuat aplikasi task manager dengan React Native + Drizzle ORM",
  //         deadline: new Date(
  //           Date.now() + 7 * 24 * 60 * 60 * 1000
  //         ).toISOString(),
  //         status: "in_progress",
  //       })
  //       .returning();

  //     const [task2] = await db
  //       .insert(tasks)
  //       .values({
  //         title: "Belajar TypeScript Advanced",
  //         description: "Pelajari generics, utility types, dan decorators",
  //         deadline: new Date(
  //           Date.now() + 14 * 24 * 60 * 60 * 1000
  //         ).toISOString(),
  //         status: "pending",
  //       })
  //       .returning();

  //     const [task3] = await db
  //       .insert(tasks)
  //       .values({
  //         title: "Rapat Tim Mingguan",
  //         description: "Diskusi progress dan planning sprint berikutnya",
  //         deadline: new Date(
  //           Date.now() + 2 * 24 * 60 * 60 * 1000
  //         ).toISOString(),
  //         status: "pending",
  //       })
  //       .returning();

  //     // Insert dummy subtasks
  //     await db.insert(subtasks).values([
  //       { taskId: task1.id, title: "Setup Drizzle ORM", completed: 1 },
  //       { taskId: task1.id, title: "Buat UI Components", completed: 1 },
  //       { taskId: task1.id, title: "Testing & Debugging", completed: 0 },
  //       {
  //         taskId: task2.id,
  //         title: "Baca dokumentasi TypeScript",
  //         completed: 0,
  //       },
  //       { taskId: task2.id, title: "Praktik coding exercises", completed: 0 },
  //     ]);

  //     console.log("✅ Dummy data seeded successfully!");
  //   } catch (error) {
  //     console.error("❌ Seed error:", error);
  //   }
  // }


// import { useState, useEffect, useRef } from 'react';
// import { Text, View, Button, Platform } from 'react-native';
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// export default function tasks() {
//   const [expoPushToken, setExpoPushToken] = useState('');
//   const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
//   const [notification, setNotification] = useState<Notifications.Notification | undefined>(
//     undefined
//   );

//   useEffect(() => {
//     registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

//     if (Platform.OS === 'android') {
//       Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
//     }
//     const notificationListener = Notifications.addNotificationReceivedListener(notification => {
//       setNotification(notification);
//     });

//     const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
//       console.log(response);
//     });

//     return () => {
//       notificationListener.remove();
//       responseListener.remove();
//     };
//   }, []);

//   return (
//     <View
//       style={{
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'space-around',
//       }}>
//       <Text>Your expo push token: {expoPushToken}</Text>
//       <Text>{`Channels: ${JSON.stringify(
//         channels.map(c => c.id),
//         null,
//         2
//       )}`}</Text>
//       <View style={{ alignItems: 'center', justifyContent: 'center' }}>
//         <Text>Title: {notification && notification.request.content.title} </Text>
//         <Text>Body: {notification && notification.request.content.body}</Text>
//         <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
//       </View>
//       <Button
//         title="Press to schedule a notification"
//         onPress={async () => {
//           await schedulePushNotification();
//         }}
//       />
//     </View>
//   );
// }

// async function schedulePushNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "You've got mail! 📬",
//       body: 'Here is the notification body',
//       data: { data: 'goes here', test: { test1: 'more data' } },
//     },
//     trigger: {
//       type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
//       seconds: 2,
//     },
//   });
// }

// async function registerForPushNotificationsAsync() {
//   let token;

//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('myNotificationChannel', {
//       name: 'A channel is needed for the permissions prompt to appear',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       alert('Failed to get push token for push notification!');
//       return;
//     }
//     // Learn more about projectId:
//     // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
//     // EAS projectId is used here.
//     try {
//       const projectId =
//         Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//       if (!projectId) {
//         throw new Error('Project ID not found');
//       }
//       token = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//         })
//       ).data;
//       console.log(token);
//     } catch (e) {
//       token = `${e}`;
//     }
//   } else {
//     alert('Must use physical device for Push Notifications');
//   }

//   return token;
// }
