/**
 * app/backup-settings/index.tsx
 * Halaman pengaturan backup dengan fitur reminder
 *
 * Features:
 * - Backup status & last backup info
 * - Manual backup button
 * - Weekly reminder toggle (Setiap Minggu)
 * - Backup history (optional)
 */

import { useSync } from "@/hooks/useSync";
import { useAuth } from "@/lib/AuthContext";
import {
  cancelBackupReminder,
  checkBackupReminderStatus,
  scheduleBackupReminder,
} from "@/lib/backupReminderHelper";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

export default function BackupSettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    isSyncing,
    lastBackupDate,
    hasBackup,
    isOnline,
    backup,
    checkBackupStatus,
    checkConnection,
  } = useSync(user?.id || "");

  const [backupLoading, setBackupLoading] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    checkBackupStatus();
    loadReminderStatus();
  }, []);

  // Load reminder status
  const loadReminderStatus = async () => {
    const isEnabled = await checkBackupReminderStatus();
    setReminderEnabled(isEnabled);
  };

  // Format tanggal backup terakhir
  const formatLastBackup = () => {
    if (!lastBackupDate) return "Belum pernah dicadangkan";

    const now = new Date();
    const diff = now.getTime() - lastBackupDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Baru saja";
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days === 1) return "Kemarin";
    if (days < 7) return `${days} hari yang lalu`;

    return lastBackupDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle manual backup
  const handleBackup = async () => {
    if (!isOnline) {
      Alert.alert(
        "Tidak Ada Koneksi",
        "Pastikan Anda terhubung ke internet untuk mencadangkan data."
      );
      return;
    }

    Alert.alert(
      "Cadangkan Data",
      "Apakah Anda yakin ingin mencadangkan data ke server?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Cadangkan",
          onPress: async () => {
            setBackupLoading(true);
            const result = await backup();
            setBackupLoading(false);

            if (result.success) {
              Alert.alert(
                "Berhasil",
                `${result.tasksBackedUp} tugas dan ${result.subtasksBackedUp} sub-tugas telah dicadangkan.`
              );
            } else {
              Alert.alert("Gagal", result.message);
            }
          },
        },
      ]
    );
  };

  // Handle reminder toggle
  const handleReminderToggle = async (value: boolean) => {
    setReminderLoading(true);

    try {
      if (value) {
        // Enable reminder
        const notificationId = await scheduleBackupReminder();

        if (notificationId) {
          setReminderEnabled(true);
          Alert.alert(
            "Pengingat Diaktifkan",
            "Anda akan menerima pengingat setiap hari Minggu pukul 09:00 untuk mencadangkan data."
          );
        } else {
          Alert.alert(
            "Gagal",
            "Tidak dapat mengaktifkan pengingat. Pastikan notifikasi diizinkan."
          );
        }
      } else {
        // Disable reminder
        await cancelBackupReminder();
        setReminderEnabled(false);
        Alert.alert(
          "Pengingat Dinonaktifkan",
          "Pengingat pencadangan telah dimatikan."
        );
      }
    } catch (error) {
      console.error("Error toggling reminder:", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengatur pengingat.");
    } finally {
      setReminderLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingVertical: 20 }}>
      <ScrollView className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="bg-white px-6 pt-6 pb-8 border-b border-gray-100"
        >
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-2 -ml-2"
              activeOpacity={0.7}
            >
              <Text className="text-2xl">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">
              Cadangan & Sinkronisasi
            </Text>
          </View>
          <Text className="text-gray-600">Kelola pencadangan data Anda</Text>
        </Animated.View>

        {/* Backup Status Card */}
        <Animated.View
          entering={FadeInRight.delay(100).duration(400)}
          className="px-6 py-6"
        >
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Status Cadangan
          </Text>

          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Internet Status */}
            <View
              className={`px-5 py-4 flex-row items-center justify-between border-b border-gray-100 ${
                isOnline ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">{isOnline ? "☁️" : "📵"}</Text>
                <View className="flex-1">
                  <Text
                    className={`font-semibold ${
                      isOnline ? "text-green-900" : "text-gray-900"
                    }`}
                  >
                    {isOnline ? "Terhubung" : "Offline"}
                  </Text>
                  <Text
                    className={`text-sm ${
                      isOnline ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    {isOnline
                      ? "Siap untuk mencadangkan"
                      : "Tidak ada koneksi internet"}
                  </Text>
                </View>
              </View>
              {isSyncing && <ActivityIndicator size="small" color="#000" />}
            </View>

            {/* Last Backup Info */}
            <View className="px-5 py-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-3">🕐</Text>
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">
                    Cadangan Terakhir
                  </Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {formatLastBackup()}
                  </Text>
                </View>
              </View>

              {!hasBackup && (
                <View className="mt-3 p-3 bg-amber-50 rounded-xl flex-row">
                  <Text className="text-xl mr-2">💡</Text>
                  <Text className="flex-1 text-sm text-amber-800">
                    Anda belum pernah mencadangkan data. Cadangkan sekarang
                    untuk mengamankan data Anda.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Backup Actions */}
        <Animated.View
          entering={FadeInRight.delay(200).duration(400)}
          className="px-6 pb-6"
        >
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Tindakan Cepat
          </Text>

          <View className="gap-3">
            {/* Manual Backup Button */}
            <TouchableOpacity
              onPress={handleBackup}
              disabled={!isOnline || backupLoading || isSyncing}
              className={`p-5 rounded-2xl flex-row items-center justify-between shadow-sm ${
                isOnline && !backupLoading && !isSyncing
                  ? "bg-black"
                  : "bg-gray-300"
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">💾</Text>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base mb-0.5">
                    Cadangkan Sekarang
                  </Text>
                  <Text className="text-white/80 text-sm">
                    Simpan data ke server
                  </Text>
                </View>
              </View>
              {(backupLoading || isSyncing) && (
                <ActivityIndicator size="small" color="#FFF" />
              )}
            </TouchableOpacity>

            {/* Advanced Backup Options */}
            <TouchableOpacity
              onPress={() => router.push("/backup")}
              className="p-5 rounded-2xl flex-row items-center justify-between border-2 border-gray-200 bg-white"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">⚙️</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base mb-0.5">
                    Opsi Lanjutan
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Kelola cadangan detail
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Reminder Settings */}
        <Animated.View
          entering={FadeInRight.delay(300).duration(400)}
          className="px-6 pb-6"
        >
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Pengingat Otomatis
          </Text>

          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-4">
                  <Text className="text-2xl mr-3">🔔</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                      Pengingat Mingguan
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Setiap hari Minggu pukul 09:00
                    </Text>
                  </View>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={handleReminderToggle}
                  disabled={reminderLoading}
                  trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                  thumbColor={reminderEnabled ? "#FFF" : "#F3F4F6"}
                />
              </View>

              {reminderEnabled && (
                <View className="mt-4 p-3 bg-green-50 rounded-xl flex-row">
                  <Text className="text-xl mr-2">✅</Text>
                  <Text className="flex-1 text-sm text-green-800">
                    Pengingat aktif. Anda akan menerima notifikasi untuk
                    mencadangkan data setiap minggu.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Info Section */}
        <Animated.View
          entering={FadeInRight.delay(400).duration(400)}
          className="px-6 pb-8"
        >
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <View className="flex-row items-start">
              <Text className="text-xl mr-2">💡</Text>
              <View className="flex-1">
                <Text className="font-semibold text-blue-900 mb-2">
                  Tips Pencadangan:
                </Text>
                <Text className="text-sm text-blue-800 leading-5">
                  • Cadangkan data secara rutin untuk mencegah kehilangan data
                  {"\n"}• Pastikan koneksi internet stabil saat mencadangkan
                  {"\n"}• Aktifkan pengingat agar tidak lupa mencadangkan{"\n"}•
                  Data dicadangkan dengan enkripsi yang aman
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
