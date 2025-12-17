/**
 * app/backup/index.tsx
 * Halaman backup dengan progress indicator dan status
 *
 * Features:
 * - Internet status check
 * - Backup button dengan loading state
 * - Progress bar & step indicators
 * - Success/Error messages
 * - Navigate to home after success
 */

import { useSync } from "@/hooks/useSync";
import { useAuth } from "@/lib/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BackupScreen = () => {
  const { user } = useAuth();
  const {
    isSyncing,
    progress,
    error,
    lastBackupDate,
    hasBackup,
    isOnline,
    backup,
    checkBackupStatus,
    checkConnection,
  } = useSync(user?.id || "");

  const [showSuccess, setShowSuccess] = useState(false);

  // Check status on mount
  useEffect(() => {
    checkConnection();
    checkBackupStatus();
  }, []);

  // Handle backup button
  const handleBackup = async () => {
    // Check internet first
    const connected = await checkConnection();
    if (!connected) {
      Alert.alert(
        "Tidak Ada Koneksi",
        "Pastikan Anda terhubung ke internet untuk mencadangkan data."
      );
      return;
    }

    // Confirm backup
    Alert.alert(
      "Cadangkan Data",
      "Apakah Anda yakin ingin mencadangkan semua data ke server?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Cadangkan",
          onPress: async () => {
            const result = await backup();

            if (result.success) {
              setShowSuccess(true);
              // Navigate to home after 2 seconds
              setTimeout(() => {
                router.replace("/(tabs)");
              }, 2000);
            }
          },
        },
      ]
    );
  };

  // Skip to home
  const handleSkip = () => {
    Alert.alert(
      "Lewati Pencadangan",
      "Data hanya akan tersimpan di perangkat ini. Anda dapat mencadangkan nanti dari halaman profil.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Lewati",
          onPress: () => router.replace("/(tabs)"),
        },
      ]
    );
  };

  // Progress step mapping
  const getProgressPercentage = () => {
    if (!progress) return 0;
    return progress.current;
  };

  const getStepIcon = (step: string) => {
    if (!progress) return "ellipse-outline";
    if (progress.step === step) return "radio-button-on";
    if (progress.step === "completed") return "checkmark-circle";
    if (progress.step === "error") return "close-circle";
    return "ellipse-outline";
  };

  const getStepColor = (step: string) => {
    if (!progress) return "#D1D5DB";
    if (progress.step === step) return "#6366F1";
    if (progress.step === "completed") return "#10B981";
    if (progress.step === "error") return "#EF4444";
    return "#D1D5DB";
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingVertical: 20 }}>
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="items-center mt-8 mb-6">
          <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="cloud-upload-outline" size={40} color="#6366F1" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Cadangkan Data Anda
          </Text>
          <Text className="text-gray-600 text-center">
            Simpan data tugas Anda ke server agar aman dan dapat diakses dari
            perangkat lain
          </Text>
        </View>

        {/* Status Cards */}
        <View className="mb-6 space-y-3">
          {/* Internet Status */}
          <View
            className={`p-4 rounded-xl flex-row items-center ${
              isOnline ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <Ionicons
              name={isOnline ? "wifi" : "wifi-outline"}
              size={24}
              color={isOnline ? "#10B981" : "#EF4444"}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`font-semibold ${
                  isOnline ? "text-green-900" : "text-red-900"
                }`}
              >
                {isOnline ? "Terhubung ke Internet" : "Tidak Ada Koneksi"}
              </Text>
              <Text
                className={`text-sm ${
                  isOnline ? "text-green-700" : "text-red-700"
                }`}
              >
                {isOnline
                  ? "Siap untuk mencadangkan"
                  : "Hubungkan ke internet terlebih dahulu"}
              </Text>
            </View>
          </View>

          {/* Last Backup */}
          {hasBackup && lastBackupDate && (
            <View className="p-4 bg-blue-50 rounded-xl flex-row items-center">
              <Ionicons name="time-outline" size={24} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-blue-900">
                  Pencadangan Terakhir
                </Text>
                <Text className="text-sm text-blue-700">
                  {new Date(lastBackupDate).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Progress Section */}
        {isSyncing && progress && (
          <View className="mb-6 p-6 bg-gray-50 rounded-xl">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              {progress.message}
            </Text>

            {/* Progress Bar */}
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
              <View
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </View>

            {/* Progress Steps */}
            <View className="space-y-3">
              {[
                { key: "checking", label: "Memeriksa koneksi" },
                { key: "uploading_tasks", label: "Mencadangkan tugas" },
                { key: "uploading_subtasks", label: "Mencadangkan sub-tugas" },
              ].map((step) => (
                <View key={step.key} className="flex-row items-center">
                  <Ionicons
                    name={getStepIcon(step.key)}
                    size={24}
                    color={getStepColor(step.key)}
                  />
                  <Text
                    className="ml-3 text-gray-700"
                    style={{
                      fontWeight: progress.step === step.key ? "600" : "400",
                    }}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Success Message */}
        {showSuccess && !isSyncing && (
          <View className="mb-6 p-6 bg-green-50 rounded-xl items-center">
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text className="text-lg font-bold text-green-900 mt-3">
              Pencadangan Berhasil!
            </Text>
            <Text className="text-green-700 text-center mt-2">
              Data Anda telah tersimpan dengan aman di server
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && !isSyncing && (
          <View className="mb-6 p-4 bg-red-50 rounded-xl flex-row">
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-red-900">
                Pencadangan Gagal
              </Text>
              <Text className="text-sm text-red-700 mt-1">{error}</Text>
            </View>
          </View>
        )}

        {/* Info Box */}
        {!isSyncing && !showSuccess && (
          <View className="mb-6 p-4 bg-amber-50 rounded-xl">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-amber-900 mb-2">
                  Catatan Penting:
                </Text>
                <Text className="text-sm text-amber-800 leading-5">
                  • Pencadangan memerlukan koneksi internet{"\n"}• Data akan
                  disimpan dengan aman di server{"\n"}• Anda dapat mengakses
                  data dari perangkat lain{"\n"}• Proses ini mungkin memakan
                  waktu beberapa saat
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      {!isSyncing && !showSuccess && (
        <View className="p-6 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleBackup}
            disabled={!isOnline}
            className={`py-4 rounded-xl items-center mb-3 ${
              isOnline ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              Cadangkan Sekarang
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            className="py-4 rounded-xl items-center border border-gray-300"
          >
            <Text className="text-gray-700 font-medium">Lewati</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {isSyncing && (
        <View className="p-6 items-center">
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      )}
    </View>
  );
};

export default BackupScreen;
    