import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Alert, FlatList } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";
import { tasks } from "@/db/schema"; // pastikan kamu punya file ini

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
        onPress={handleInsert}
        className="bg-blue-600 px-6 py-3 rounded-2xl mb-4"
      >
        <Text className="text-white text-lg font-semibold">Tambah Data</Text>
      </TouchableOpacity>

      {/* daftar data */}
      <FlatList
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
      />
    </View>
  );
};

export default Learn;
