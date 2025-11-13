// import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
// import { useSQLiteContext } from "expo-sqlite";
// import React from "react";
// import { Text, TouchableOpacity, View } from "react-native";
// import { tasks as t } from "@/db/schema";

// const tasks = () => {
//   const db = useSQLiteContext();
//   const x = drizzle(db);
  
//   const { data } = useLiveQuery(x.select().from(t));
//   console.log(JSON.stringify(data))

//   return (
//     <View className="flex-1 justify-center items-center bg-white px-6">
//       <Text className="text-2xl font-bold text-gray-900 mb-6">Tasks Page</Text>
//       <View className="absolute bottom-32 right-6">
//         <TouchableOpacity
//           className="bg-[#6B4545] w-16 h-16 rounded-full items-center justify-center shadow-lg"
//           onPress={() => alert("Tambah Task")}
//         >
//           <Text className="text-white text-3xl">+</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default tasks;

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
