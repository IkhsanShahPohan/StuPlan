// import { subtasks, tasks } from "@/db/schema"; // pastikan kamu punya file ini
// import { eq } from "drizzle-orm";
// import { drizzle } from "drizzle-orm/expo-sqlite";
// import { useSQLiteContext } from "expo-sqlite";
// import React, { useEffect, useState } from "react";
// import { Alert, Text, TouchableOpacity, View } from "react-native";

// const Learn = () => {
//   const [data, setData] = useState<any[]>([]);
//   const sqlite = useSQLiteContext(); // ambil koneksi database dari Provider
//   const db = drizzle(sqlite);
//   // 🔹 ambil semua data dari tabel tasks
//   const getData = async () => {
//     try {
//       const result = await db.select().from(tasks).all();
//       console.log(result);
//       setData(result);
//     } catch (error) {
//       console.error("Gagal ambil data:", error);
//     }
//   };

//   async function seedDummyData() {
//   try {
//     const existing = await db.select().from(tasks);
//     if (existing.length > 0) return;

//     console.log('🌱 Seeding data...');

//     const [task1] = await db.insert(tasks).values({
//       title: 'Project Mobile App',
//       description: 'Buat aplikasi task manager',
//       notes: 'Fokus pada UX yang baik',
//       deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
//       status: 'in_progress',
//     }).returning();

//     const [task2] = await db.insert(tasks).values({
//       title: 'Belajar TypeScript',
//       description: 'Pelajari advanced concepts',
//       notes: 'Buat catatan untuk referensi',
//       deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
//       status: 'pending',
//     }).returning();

//     await db.insert(subtasks).values([
//       { taskId: task1.id, title: 'Setup project', completed: 1 },
//       { taskId: task1.id, title: 'Buat UI', completed: 1 },
//       { taskId: task1.id, title: 'Testing', completed: 0 },
//       { taskId: task2.id, title: 'Baca dokumentasi', completed: 0 },
//     ]);

//     console.log('✅ Seed completed');
//   } catch (error) {
//     console.error('❌ Seed error:', error);
//   }
// }

//   // 🔹 insert data baru ke tabel tasks
//   const handleInsert = async () => {
//     try {
//       await db.insert(tasks).values({
//         title: "Belajar Drizzle + SQLite 🚀",
//       });
//       Alert.alert("Sukses", "Data berhasil ditambahkan!");
//       getData(); // refresh daftar data
//     } catch (error) {
//       console.error("Gagal insert data:", error);
//       Alert.alert("Error", "Gagal menambahkan data");
//     }
//   };

//   // 🔹 hapus salah satu data (contoh aja)
//   const handleDelete = async (id: number) => {
//     try {
//       await db.delete(tasks).where(eq(tasks.id, id));
//       getData(); // refresh
//     } catch (error) {
//       console.error("Gagal hapus data:", error);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   return (
//     <View className="flex-1 justify-center items-center bg-white px-6">
//       <Text className="text-2xl font-bold text-gray-900 mb-6">Learn Page</Text>

//       <TouchableOpacity
//         onPress={seedDummyData}
//         className="bg-blue-600 px-6 py-3 rounded-2xl mb-4"
//       >
//         <Text className="text-white text-lg font-semibold">Tambah Data</Text>
//       </TouchableOpacity>

//       {/* daftar data */}
//       {/* <FlatList
//         data={data}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View className="flex-row items-center justify-between bg-gray-100 px-4 py-2 rounded-xl w-full mb-2">
//             <Text className="text-base text-gray-800">{item.title}</Text>
//             <TouchableOpacity
//               onPress={() => handleDelete(item.id)}
//               className="bg-red-500 px-3 py-1 rounded-xl"
//             >
//               <Text className="text-white text-sm font-semibold">Hapus</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       /> */}
//     </View>
//   );
// };

// export default Learn;

import { supabase } from "@/lib/supabase";
import { useSyncManager } from "@/lib/useSyncManager";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Learn() {
  const [userId, setUserId] = useState<string | null>(null);
  const { isSyncing, isOnline, syncNow, error } = useSyncManager(userId);

  useEffect(() => {
    // Get user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn</Text>

        {/* Sync Status & Button */}
        <View style={styles.syncContainer}>
          {isSyncing ? (
            <View style={styles.syncingIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.syncingText}>Sinkronisasi...</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={syncNow}
              disabled={!isOnline || !userId}
              style={styles.syncButton}
            >
              <Ionicons
                name={isOnline ? "cloud-done" : "cloud-offline"}
                size={24}
                color={isOnline && userId ? "#34C759" : "#8E8E93"}
              />
              <Text
                style={[
                  styles.syncButtonText,
                  { color: isOnline && userId ? "#34C759" : "#8E8E93" },
                ]}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#FF3B30" />
          <Text style={styles.errorText}>
            Sinkronisasi gagal: {error.message}
          </Text>
        </View>
      )}

      {/* Connection Status Info */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Ionicons
            name={isOnline ? "wifi" : "wifi-outline"}
            size={20}
            color={isOnline ? "#34C759" : "#8E8E93"}
          />
          <Text style={styles.statusLabel}>Status Koneksi:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: isOnline ? "#34C759" : "#8E8E93" },
            ]}
          >
            {isOnline ? "Terhubung" : "Tidak Terhubung"}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Ionicons
            name={userId ? "person" : "person-outline"}
            size={20}
            color={userId ? "#007AFF" : "#8E8E93"}
          />
          <Text style={styles.statusLabel}>User:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: userId ? "#007AFF" : "#8E8E93" },
            ]}
          >
            {userId ? "Login" : "Belum Login"}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Ionicons
            name={isSyncing ? "sync" : "sync-outline"}
            size={20}
            color={isSyncing ? "#007AFF" : "#8E8E93"}
          />
          <Text style={styles.statusLabel}>Sinkronisasi:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: isSyncing ? "#007AFF" : "#8E8E93" },
            ]}  
          >
            {isSyncing ? "Sedang Berlangsung" : "Siap"}
          </Text>
        </View>
      </View>

      {/* Manual Sync Button */}
      <TouchableOpacity
        onPress={syncNow}
        disabled={!isOnline || !userId || isSyncing}
        style={[
          styles.manualSyncButton,
          (!isOnline || !userId || isSyncing) && styles.disabledButton,
        ]}
      >
        <Ionicons
          name="cloud-upload"
          size={24}
          color={!isOnline || !userId || isSyncing ? "#8E8E93" : "#FFFFFF"}
        />
        <Text style={styles.manualSyncButtonText}>
          {isSyncing ? "Menyinkronkan..." : "Sinkronkan Manual"}
        </Text>
      </TouchableOpacity>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#007AFF" />
        <Text style={styles.infoText}>
          Data akan otomatis tersinkronisasi saat Anda online. Tekan tombol sync
          untuk menyinkronkan secara manual.
        </Text>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        <Text style={styles.contentTitle}>Konten Learn</Text>
        <Text style={styles.contentText}>
          Tambahkan konten pembelajaran Anda di sini...
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#000000",
  },
  syncContainer: {
    alignItems: "flex-end",
  },
  syncingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  syncingText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 20,
    padding: 12,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#FF3B30",
  },
  statusCard: {
    margin: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: "#000000",
    flex: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  manualSyncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#E5E5EA",
    shadowOpacity: 0,
    elevation: 0,
  },
  manualSyncButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 20,
  },
  content: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    minHeight: 200,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 24,
  },
});
