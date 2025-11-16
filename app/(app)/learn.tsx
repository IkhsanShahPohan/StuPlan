import { subtasks, tasks } from "@/db/schema"; // pastikan kamu punya file ini
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const Learn = () => {
  const [data, setData] = useState<any[]>([]);
  const sqlite = useSQLiteContext(); // ambil koneksi database dari Provider
  const db = drizzle(sqlite);
  // 🔹 ambil semua data dari tabel tasks
  const getData = async () => {
    try {
      const result = await db.select().from(tasks).all();
      console.log(result);
      setData(result);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    }
  };

  async function seedDummyData() {
  try {
    const existing = await db.select().from(tasks);
    if (existing.length > 0) return;

    console.log('🌱 Seeding data...');

    const [task1] = await db.insert(tasks).values({
      title: 'Project Mobile App',
      description: 'Buat aplikasi task manager',
      notes: 'Fokus pada UX yang baik',
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'in_progress',
    }).returning();

    const [task2] = await db.insert(tasks).values({
      title: 'Belajar TypeScript',
      description: 'Pelajari advanced concepts',
      notes: 'Buat catatan untuk referensi',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'pending',
    }).returning();

    await db.insert(subtasks).values([
      { taskId: task1.id, title: 'Setup project', completed: 1 },
      { taskId: task1.id, title: 'Buat UI', completed: 1 },
      { taskId: task1.id, title: 'Testing', completed: 0 },
      { taskId: task2.id, title: 'Baca dokumentasi', completed: 0 },
    ]);

    console.log('✅ Seed completed');
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
}


  // 🔹 insert data baru ke tabel tasks
  const handleInsert = async () => {
    try {
      await db.insert(tasks).values({
        title: "Belajar Drizzle + SQLite 🚀",
      });
      Alert.alert("Sukses", "Data berhasil ditambahkan!");
      getData(); // refresh daftar data
    } catch (error) {
      console.error("Gagal insert data:", error);
      Alert.alert("Error", "Gagal menambahkan data");
    }
  };

  // 🔹 hapus salah satu data (contoh aja)
  const handleDelete = async (id: number) => {
    try {
      await db.delete(tasks).where(eq(tasks.id, id));
      getData(); // refresh
    } catch (error) {
      console.error("Gagal hapus data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Learn Page</Text>

      <TouchableOpacity
        onPress={seedDummyData}
        className="bg-blue-600 px-6 py-3 rounded-2xl mb-4"
      >
        <Text className="text-white text-lg font-semibold">Tambah Data</Text>
      </TouchableOpacity>

      {/* daftar data */}
      {/* <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between bg-gray-100 px-4 py-2 rounded-xl w-full mb-2">
            <Text className="text-base text-gray-800">{item.title}</Text>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              className="bg-red-500 px-3 py-1 rounded-xl"
            >
              <Text className="text-white text-sm font-semibold">Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      /> */}
    </View>
  );
};

export default Learn;
