// // components/NotificationButton.tsx
// import React from 'react';
// import { TouchableOpacity, Text, StyleSheet } from 'react-native';
// import * as Notifications from 'expo-notifications';

// export default function NotificationButton() {
//   const showNotification = () => {
//     Notifications.scheduleNotificationAsync({
//       content: {
//         title: 'Halo 👋',
//         body: 'Ini notifikasi yang muncul dari tombol!',
//       },
//       trigger: null, 
//     });
//   };

//   return (
//     <TouchableOpacity style={styles.button} onPress={showNotification}>
//       <Text style={styles.text}>Tampilkan Notifikasi</Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   button: {
//     backgroundColor: '#4C8BFF',
//     padding: 16,
//     borderRadius: 12,
//     marginTop: 60,
//     alignSelf: 'center',
//   },
//   text: {
//     color: 'white',
//     fontWeight: '600',
//   },
// });
