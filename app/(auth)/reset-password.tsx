import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

const { height } = Dimensions.get("window");    

export default function ForgotPasswordOTP() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk mengatur step form
  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  // Step 1: Kirim OTP ke email
  async function handleSendOtp() {
    if (!email) {
      Alert.alert("Error", "Silakan masukkan email Anda");
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Format email tidak valid");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined, // Tidak menggunakan redirect URL
      });

      if (error) throw error;

      Alert.alert(
        "OTP Terkirim!",
        "Kode OTP 6 digit telah dikirim ke email Anda. Silakan cek inbox atau folder spam.",
        [{ text: "OK", onPress: () => setStep("otp") }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verifikasi OTP
  async function handleVerifyOtp() {
    if (!otp) {
      Alert.alert("Error", "Silakan masukkan kode OTP");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Error", "Kode OTP harus 6 digit");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });

      if (error) throw error;

      // OTP berhasil diverifikasi, session sudah aktif
      Alert.alert("OTP Terverifikasi!", "Silakan buat password baru Anda.", [
        { text: "OK", onPress: () => setStep("password") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Kode OTP tidak valid atau sudah kadaluarsa"
      );
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Reset password
  async function handleResetPassword() {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Silakan isi semua field");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password tidak cocok");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      Alert.alert(
        "Berhasil!",
        "Password Anda telah berhasil diubah. Silakan login dengan password baru.",
        [
          {
            text: "OK",
            onPress: () => {
              // Sign out untuk memastikan user harus login ulang
              supabase.auth.signOut();
              router.push("/(auth)/sign-in");
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-purple-50 px-6"
        contentContainerStyle={{ minHeight: height }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center py-8">
          <View className="items-center mb-6">
            <Image
              source={require("../../assets/images/forgot.png")} // ganti path sesuai lokasi file gambar
              style={{ width: 120, height: 120, resizeMode: "contain" }}
            />
          </View>

          <Text className="text-3xl font-bold text-purple-900 text-center mb-2">
            Reset Password
          </Text>

          {/* Indicator step */}
          <Text className="text-sm text-purple-600 text-center mb-6">
            {step === "email" && "Step 1: Masukkan Email"}
            {step === "otp" && "Step 2: Verifikasi OTP"}
            {step === "password" && "Step 3: Buat Password Baru"}
          </Text>

          {/* Step 1: Email Input */}
          {step === "email" && (
            <View>
              <TextInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white p-4 rounded-xl border border-purple-100 mb-4"
              />

              <TouchableOpacity
                onPress={handleSendOtp}
                className="bg-purple-700 py-4 rounded-xl mb-4"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">
                    Kirim OTP
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: OTP Input */}
          {step === "otp" && (
            <View>
              <View className="bg-white p-4 rounded-xl border border-purple-100 mb-2">
                <Text className="text-gray-600 text-sm mb-1">Email</Text>
                <Text className="text-gray-900 font-medium">{email}</Text>
              </View>

              <TextInput
                placeholder="Masukkan 6 digit OTP"
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                maxLength={6}
                className="bg-white p-4 rounded-xl border border-purple-100 mb-4 text-center text-xl tracking-widest font-bold"
              />

              <TouchableOpacity
                onPress={handleVerifyOtp}
                className="bg-purple-700 py-4 rounded-xl mb-2"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">
                    Verifikasi OTP
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep("email")}
                className="py-2"
                disabled={loading}
              >
                <Text className="text-purple-700 text-center">Ganti Email</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Password Input */}
          {step === "password" && (
            <View>
              <View className="bg-white p-4 rounded-xl border border-purple-100 mb-4">
                <Text className="text-gray-600 text-sm mb-1">Email</Text>
                <Text className="text-gray-900 font-medium">{email}</Text>
              </View>

              <TextInput
                placeholder="Password Baru"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                className="bg-white p-4 rounded-xl border border-purple-100 mb-4"
              />

              <TextInput
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                className="bg-white p-4 rounded-xl border border-purple-100 mb-4"
              />

              <TouchableOpacity
                onPress={handleResetPassword}
                className="bg-purple-700 py-4 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Sign In */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in")}
            className="mt-6"
            disabled={loading}
          >
            <Text className="text-purple-700 text-center">
              Kembali ke Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
