import { Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Feather } from "@expo/vector-icons";

const profile = () => {
  const router = useRouter();
  
  const [userData] = useState({
    nama: "Ikhsan Shah Pohan",
    nim: "231402039",
    jurusan: "Teknologi Informasi",
    semester: "5",
    email: "Ikhsanshah@students.usu.ac.id",
    phone: "0895611248157",
    angkatan: "2023"
  });

  const [stats] = useState({
    totalTugas: 24,
    tugasSelesai: 18,
    totalPengeluaran: "Rp 2.450.000",
    sisaBudget: "Rp 550.000"
  });

  // Fungsi untuk mengambil inisial nama
  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) {
              router.replace("/(auth)/sign-in");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-purple-50">
      {/* Header dengan Pattern Background */}
      <View className="relative overflow-hidden bg-purple-700">
        {/* Glassmorphism Blur Circles Background */}
        <View className="absolute inset-0">
          {/* Large circle top right */}
          <View 
            className="absolute bg-purple-500 rounded-full opacity-40"
            style={{
              width: 200,
              height: 200,
              right: -50,
              top: -50,
            }}
          />
          {/* Medium circle bottom left */}
          <View 
            className="absolute bg-purple-400 rounded-full opacity-30"
            style={{
              width: 150,
              height: 150,
              left: -30,
              bottom: 20,
            }}
          />
          {/* Small circle middle */}
          <View 
            className="absolute bg-purple-300 rounded-full opacity-25"
            style={{
              width: 120,
              height: 120,
              right: 60,
              bottom: 80,
            }}
          />
          {/* Tiny circle top left */}
          <View 
            className="absolute bg-purple-600 rounded-full opacity-35"
            style={{
              width: 80,
              height: 80,
              left: 40,
              top: 60,
            }}
          />
        </View>

        {/* Profile Content */}
        <View className="pt-12 pb-24 px-6">
          <View className="items-center relative z-10">
            {/* Avatar dengan Inisial */}
            <View className="w-28 h-28 rounded-full bg-purple-200 items-center justify-center mb-3 shadow-lg border-4 border-white">
              <Text className="text-purple-800 text-4xl font-bold">
                {getInitials(userData.nama)}
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold">{userData.nama}</Text>
            <Text className="text-purple-200 text-base mt-1">NIM: {userData.nim}</Text>
          </View>
        </View>
      </View>

      {/* Informasi Mahasiswa */}
      <View className="px-6 -mt-16 mb-6">
        <View className="bg-white rounded-2xl shadow-lg p-5">
          <Text className="text-gray-800 font-bold text-lg mb-4">Informasi Mahasiswa</Text>
          
          <View className="mb-3">
            <Text className="text-gray-500 text-sm mb-1">Jurusan</Text>
            <Text className="text-gray-900 text-base font-medium">{userData.jurusan}</Text>
          </View>

          <View className="h-px bg-gray-100 my-3" />

          <View className="mb-3">
            <Text className="text-gray-500 text-sm mb-1">Semester</Text>
            <Text className="text-gray-900 text-base font-medium">Semester {userData.semester}</Text>
          </View>

          <View className="h-px bg-gray-100 my-3" />

          <View className="mb-3">
            <Text className="text-gray-500 text-sm mb-1">Angkatan</Text>
            <Text className="text-gray-900 text-base font-medium">{userData.angkatan}</Text>
          </View>

          <View className="h-px bg-gray-100 my-3" />

          <View className="mb-3">
            <Text className="text-gray-500 text-sm mb-1">Email</Text>
            <Text className="text-gray-900 text-base font-medium">{userData.email}</Text>
          </View>

          <View className="h-px bg-gray-100 my-3" />

          <View>
            <Text className="text-gray-500 text-sm mb-1">No. Telepon</Text>
            <Text className="text-gray-900 text-base font-medium">{userData.phone}</Text>
          </View>
        </View>
      </View>

      {/* Menu Pengaturan */}
      <View className="px-6 mb-6">
        <View className="bg-white rounded-2xl shadow p-5 border border-purple-100">
          <Text className="text-gray-800 font-bold text-lg mb-4">Pengaturan</Text>
          
          <TouchableOpacity 
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => Alert.alert("Edit Profile", "Fitur ini akan segera tersedia")}
          >
            <Feather name="user" size={22} color="#6b7280" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-gray-800 text-base font-medium">Edit Profile</Text>
            <Feather name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => router.push("/(auth)/reset-password")}
          >
            <Feather name="lock" size={22} color="#6b7280" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-gray-800 text-base font-medium">Ganti Password</Text>
            <Feather name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => Alert.alert("Notifikasi", "Pengaturan notifikasi akan segera tersedia")}
          >
            <Feather name="bell" size={22} color="#6b7280" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-gray-800 text-base font-medium">Notifikasi</Text>
            <Feather name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => Alert.alert("Kelola Budget", "Fitur manajemen budget akan segera tersedia")}
          >
            <Feather name="dollar-sign" size={22} color="#6b7280" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-gray-800 text-base font-medium">Kelola Budget</Text>
            <Feather name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3"
            onPress={() => Alert.alert("Tentang StuPlan", "StuPlan v1.0.0\nAplikasi Pengelolaan Mahasiswa")}
          >
            <Feather name="info" size={22} color="#6b7280" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-gray-800 text-base font-medium">Tentang Aplikasi</Text>
            <Feather name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tombol Logout */}
      <View className="px-6 mb-28">
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500 rounded-xl py-4 items-center shadow-lg active:opacity-90 flex-row justify-center"
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-bold text-base">Keluar dari Akun</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default profile;