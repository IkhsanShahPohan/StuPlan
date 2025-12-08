import { users } from "@/db/schema";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
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
} from "react-native";
import Animated, {
    FadeIn,
    FadeInRight,
    FadeOutLeft,
    Layout,
} from "react-native-reanimated";

interface OnboardingData {
  fullName: string;
  birthDate: string;
  educationLevel: string;
  institution: string;
}

const EDUCATION_LEVELS = [
  { value: "SD", label: "Sekolah Dasar (SD)" },
  { value: "SMP", label: "Sekolah Menengah Pertama (SMP)" },
  { value: "SMA/SMK", label: "Sekolah Menengah Atas (SMA/SMK)" },
  { value: "D3", label: "Diploma 3 (D3)" },
  { value: "S1/D4", label: "Sarjana/Diploma 4 (S1/D4)" },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: "",
    birthDate: "",
    educationLevel: "",
    institution: "",
  });

  const router = useRouter();
  const { user } = useAuth();
  const sqlite = useSQLiteContext();
  const db = drizzle(sqlite);

  const totalSteps = 4;

  const updateFormData = (key: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      const formatted = `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`;
      updateFormData("birthDate", formatted);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error("❌ No user found");
      alert("Terjadi kesalahan. Silakan login kembali.");
      return;
    }

    setLoading(true);
    try {
      // 1. Save to Supabase profiles table
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

      // 2. Update local SQLite
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

      console.log("✅ Onboarding data saved successfully");

      // 3. Navigate to main app - AuthContext will handle the redirect
      router.replace("/(tabs)");
    } catch (error) {
      console.error("❌ Error saving onboarding data:", error);
      alert("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim().length > 2;
      case 2:
        return formData.birthDate.trim().length > 0;
      case 3:
        return formData.educationLevel.trim().length > 0;
      case 4:
        return formData.institution.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View className="flex-1 px-6 pt-12 pb-6">
            {/* Header with Progress */}
            <Animated.View entering={FadeIn.duration(400)} className="mb-16">
              <Text className="text-sm font-semibold text-gray-900 mb-2 tracking-wider">
                LANGKAH {currentStep} DARI {totalSteps}
              </Text>
              <View className="flex-row gap-2 mt-4">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <View
                    key={i}
                    className="h-1.5 flex-1 rounded-full overflow-hidden bg-gray-200"
                  >
                    <View
                      className={`h-full rounded-full transition-all duration-300 ${
                        i < currentStep ? "bg-black" : "bg-transparent"
                      }`}
                    />
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Step Content */}
            <View className="flex-1 mb-8">
              {currentStep === 1 && (
                <StepContent
                  title="Siapa nama lengkap Anda?"
                  description="Gunakan nama asli sesuai dengan identitas resmi Anda"
                  stepNumber="01"
                >
                  <View className="mt-10">
                    <TextInput
                      value={formData.fullName}
                      onChangeText={(text) => updateFormData("fullName", text)}
                      placeholder="Contoh: Ahmad Rizki Pratama"
                      className="text-2xl font-normal text-gray-900 border-b-2 border-gray-300 pb-4"
                      autoFocus
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                      autoComplete="name"
                      returnKeyType="next"
                      onSubmitEditing={() => isStepValid() && handleNext()}
                    />
                    {formData.fullName.length > 0 &&
                      formData.fullName.length < 3 && (
                        <Text className="text-red-500 text-sm mt-2">
                          Nama minimal 3 karakter
                        </Text>
                      )}
                  </View>
                </StepContent>
              )}

              {currentStep === 2 && (
                <StepContent
                  title="Kapan tanggal lahir Anda?"
                  description="Informasi ini membantu kami menyesuaikan pengalaman belajar Anda"
                  stepNumber="02"
                >
                  <View className="mt-10">
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="border-b-2 border-gray-300 pb-4"
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-2xl ${
                          formData.birthDate
                            ? "text-gray-900 font-normal"
                            : "text-gray-400 font-light"
                        }`}
                      >
                        {formData.birthDate || "Pilih tanggal lahir"}
                      </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <View className="mt-6">
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
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
                            <Text className="text-white text-center font-medium">
                              Konfirmasi
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </StepContent>
              )}

              {currentStep === 3 && (
                <StepContent
                  title="Jenjang pendidikan Anda?"
                  description="Pilih jenjang pendidikan yang sedang atau terakhir Anda tempuh"
                  stepNumber="03"
                >
                  <View className="mt-10 gap-3">
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
                              <Text className="text-white text-xs font-bold">
                                ✓
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </StepContent>
              )}

              {currentStep === 4 && (
                <StepContent
                  title="Instansi atau organisasi?"
                  description="Sebutkan nama sekolah, universitas, atau tempat kerja Anda saat ini"
                  stepNumber="04"
                >
                  <View className="mt-10">
                    <TextInput
                      value={formData.institution}
                      onChangeText={(text) =>
                        updateFormData("institution", text)
                      }
                      placeholder="Contoh: Universitas Indonesia"
                      className="text-2xl font-normal text-gray-900 border-b-2 border-gray-300 pb-4"
                      autoFocus
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                      returnKeyType="done"
                      onSubmitEditing={() => isStepValid() && handleSubmit()}
                    />
                  </View>
                </StepContent>
              )}
            </View>

            {/* Navigation Buttons */}
            <View className="gap-3 pt-4">
              <TouchableOpacity
                onPress={handleNext}
                disabled={!isStepValid() || loading}
                className={`py-4 rounded-2xl shadow-sm ${
                  isStepValid() && !loading ? "bg-black" : "bg-gray-300"
                }`}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base tracking-wide">
                    {currentStep === totalSteps
                      ? "Selesai & Mulai"
                      : "Lanjutkan"}
                  </Text>
                )}
              </TouchableOpacity>

              {currentStep > 1 && (
                <TouchableOpacity
                  onPress={handleBack}
                  disabled={loading}
                  className="py-4"
                  activeOpacity={0.6}
                >
                  <Text className="text-gray-600 text-center font-medium text-base">
                    Kembali
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

interface StepContentProps {
  title: string;
  description: string;
  children: React.ReactNode;
  stepNumber: string;
}

function StepContent({
  title,
  description,
  children,
  stepNumber,
}: StepContentProps) {
  return (
    <Animated.View
      entering={FadeInRight.duration(300).springify()}
      exiting={FadeOutLeft.duration(200)}
      layout={Layout.springify()}
    >
      <View className="mb-3">
        <Text className="text-xs font-bold text-gray-400 tracking-widest mb-4">
          {stepNumber}
        </Text>
        <Text className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
          {title}
        </Text>
        <Text className="text-base text-gray-600 leading-relaxed">
          {description}
        </Text>
      </View>
      {children}
    </Animated.View>
  );
}
