import { users } from "@/db/schema";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

// SAMA PERSIS DENGAN ONBOARDING
const EDUCATION_LEVELS = [
  { value: "SD", label: "Sekolah Dasar (SD)" },
  { value: "SMP", label: "Sekolah Menengah Pertama (SMP)" },
  { value: "SMA/SMK", label: "Sekolah Menengah Atas (SMA/SMK)" },
  { value: "D3", label: "Diploma 3 (D3)" },
  { value: "S1/D4", label: "Sarjana/Diploma 4 (S1/D4)" },
];

interface FormData {
  fullName: string;
  birthDate: string;
  educationLevel: string;
  institution: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const sqlite = useSQLiteContext();
  const db = drizzle(sqlite);

  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    birthDate: "",
    educationLevel: "",
    institution: "",
  });

  const [originalData, setOriginalData] = useState<FormData>({
    fullName: "",
    birthDate: "",
    educationLevel: "",
    institution: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Deteksi perubahan
    const changed =
      formData.fullName !== originalData.fullName ||
      formData.birthDate !== originalData.birthDate ||
      formData.educationLevel !== originalData.educationLevel ||
      formData.institution !== originalData.institution;
    setHasChanges(changed);
  }, [formData, originalData]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setIsLoadingData(true);

      // Load dari SQLite
      const userData = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (userData && userData.length > 0) {
        const data = {
          fullName: userData[0].fullName || "",
          birthDate: userData[0].birthDate || "",
          educationLevel: userData[0].educationLevel || "",
          institution: userData[0].institution || "",
        };

        setFormData(data);
        setOriginalData(data);

        // Parse tanggal jika ada (format: DD/MM/YYYY)
        if (data.birthDate) {
          const [day, month, year] = data.birthDate.split("/").map(Number);
          if (day && month && year) {
            setSelectedDate(new Date(year, month - 1, day));
          }
        }
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      Alert.alert("Error", "Gagal memuat data profil");
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      // Format SAMA dengan onboarding: DD/MM/YYYY
      const formatted = `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`;
      updateFormData("birthDate", formatted);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim().length > 2 &&
      formData.birthDate.trim().length > 0 &&
      formData.educationLevel.trim().length > 0 &&
      formData.institution.trim().length > 0
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "Sesi berakhir. Silakan login kembali.");
      return;
    }

    if (!isFormValid()) {
      Alert.alert("Error", "Mohon lengkapi semua data dengan benar");
      return;
    }

    setLoading(true);
    try {
      // 1. Update Supabase - SAMA PERSIS dengan onboarding
      const { error: supabaseError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName,
        birth_date: formData.birthDate,
        education_level: formData.educationLevel,
        institution: formData.institution,
        updated_at: new Date().toISOString(),
      });

      if (supabaseError) {
        console.error("❌ Supabase error:", supabaseError);
        throw supabaseError;
      }

      // 2. Update SQLite - SAMA PERSIS dengan onboarding
      await db
        .update(users)
        .set({
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          educationLevel: formData.educationLevel,
          institution: formData.institution,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, user.id));

      console.log("✅ Profile updated successfully");

      Alert.alert("Berhasil", "Profil berhasil diperbarui", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      Alert.alert("Error", "Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Batalkan Perubahan?",
        "Perubahan yang belum disimpan akan hilang",
        [
          { text: "Lanjut Edit", style: "cancel" },
          {
            text: "Batalkan",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoadingData) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-base text-gray-600 font-medium">
          Memuat data profil...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-5 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleCancel}
              disabled={loading}
              className="p-2 -ml-2"
              activeOpacity={0.6}
            >
              <Ionicons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            
            <View className="flex-1 mx-4">
              <Text className="text-2xl font-bold text-gray-900">
                Edit Profil
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                Perbarui informasi Anda
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid() || loading || !hasChanges}
              className={`px-5 py-2.5 rounded-xl ${
                isFormValid() && hasChanges && !loading
                  ? "bg-black"
                  : "bg-gray-200"
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  className={`text-sm font-semibold ${
                    isFormValid() && hasChanges ? "text-white" : "text-gray-400"
                  }`}
                >
                  Simpan
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="px-6 py-6">
            {/* Email - Read Only */}
            <Animated.View entering={FadeIn.delay(100)} className="mb-8">
              <Text className="text-xs font-bold text-gray-400 tracking-widest mb-3">
                EMAIL AKUN
              </Text>
              <View className="bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-100 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons
                    name="mail"
                    size={20}
                    color="#6B7280"
                    style={{ marginRight: 12 }}
                  />
                  <Text className="text-base font-medium text-gray-600 flex-1">
                    {user?.email}
                  </Text>
                </View>
                <View className="bg-green-100 px-3 py-1.5 rounded-lg flex-row items-center">
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text className="text-xs font-semibold text-green-700 ml-1">
                    Terverifikasi
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Nama Lengkap */}
            <Animated.View entering={FadeIn.delay(200)} className="mb-8">
              <Text className="text-xs font-bold text-gray-400 tracking-widest mb-3">
                NAMA LENGKAP
              </Text>
              <View className="bg-white rounded-2xl px-5 py-4 border-2 border-gray-200">
                <TextInput
                  value={formData.fullName}
                  onChangeText={(text) => updateFormData("fullName", text)}
                  placeholder="Masukkan nama lengkap"
                  className="text-lg font-medium text-gray-900"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
              {formData.fullName.length > 0 &&
                formData.fullName.length < 3 && (
                  <Text className="text-red-500 text-xs mt-2 ml-1">
                    Nama minimal 3 karakter
                  </Text>
                )}
            </Animated.View>

            {/* Tanggal Lahir */}
            <Animated.View entering={FadeIn.delay(300)} className="mb-8">
              <Text className="text-xs font-bold text-gray-400 tracking-widest mb-3">
                TANGGAL LAHIR
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white rounded-2xl px-5 py-4 border-2 border-gray-200"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-lg font-medium ${
                      formData.birthDate ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {formData.birthDate || "Pilih tanggal lahir"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <View className="mt-4 bg-white rounded-2xl p-4 border border-gray-200">
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1950, 0, 1)}
                  />

                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      className="mt-4 bg-black py-3 rounded-xl"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-center font-semibold">
                        Konfirmasi
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Animated.View>

            {/* Jenjang Pendidikan */}
            <Animated.View entering={FadeIn.delay(400)} className="mb-8">
              <Text className="text-xs font-bold text-gray-400 tracking-widest mb-3">
                JENJANG PENDIDIKAN
              </Text>
              <View className="gap-3">
                {EDUCATION_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() =>
                      updateFormData("educationLevel", level.value)
                    }
                    className={`p-5 rounded-2xl border-2 ${
                      formData.educationLevel === level.value
                        ? "border-black bg-gray-50"
                        : "border-gray-200 bg-white"
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          className={`text-lg mb-1 ${
                            formData.educationLevel === level.value
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {level.value}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {level.label}
                        </Text>
                      </View>
                      {formData.educationLevel === level.value && (
                        <View className="w-6 h-6 rounded-full bg-black items-center justify-center ml-3">
                          <Text className="text-white text-xs font-bold">✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Instansi */}
            <Animated.View entering={FadeIn.delay(500)} className="mb-8">
              <Text className="text-xs font-bold text-gray-400 tracking-widest mb-3">
                INSTANSI / ORGANISASI
              </Text>
              <View className="bg-white rounded-2xl px-5 py-4 border-2 border-gray-200">
                <TextInput
                  value={formData.institution}
                  onChangeText={(text) => updateFormData("institution", text)}
                  placeholder="Nama sekolah, universitas, atau tempat kerja"
                  className="text-lg font-medium text-gray-900"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
              </View>
            </Animated.View>

            {/* Info Box - Muncul saat ada perubahan */}
            {hasChanges && (
              <Animated.View
                entering={FadeIn}
                className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex-row items-start mb-6"
              >
                <Ionicons
                  name="information-circle"
                  size={22}
                  color="#3B82F6"
                  style={{ marginTop: 2, marginRight: 10 }}
                />
                <Text className="text-sm text-blue-700 flex-1 leading-5">
                  Anda memiliki perubahan yang belum disimpan. Tekan tombol{" "}
                  <Text className="font-bold">Simpan</Text> di atas untuk
                  menyimpan perubahan.
                </Text>
              </Animated.View>
            )}

            {/* Helper Text */}
            <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-start">
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color="#10B981"
                  style={{ marginTop: 2, marginRight: 10 }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 mb-1">
                    Data Anda Aman
                  </Text>
                  <Text className="text-xs text-gray-600 leading-5">
                    Informasi profil Anda tersimpan dengan aman dan hanya
                    digunakan untuk meningkatkan pengalaman belajar Anda.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}