import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  async function signUpWithEmail() {
    // Validasi sederhana
    if (!email || !password || !confirmPassword) {
      Alert.alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Panggil Supabase API untuk sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `exp://${process.env.PORT}`,
        },
      });

      if (error) throw error;

      // Jika berhasil daftar
      Alert.alert(
        "Success!",
        "Your account has been created. Please verify your email before logging in.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(auth)/sign-in"), // Kembali ke login
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Hero Section */}
          <View className="items-center mb-10">
            <View className="bg-white rounded-full p-6 shadow-lg mb-6">
              <Image
                source={require("../../assets/images/2.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-purple-900 text-center mb-2">
              Create Account
            </Text>
            <Text className="text-sm text-purple-600 text-center max-w-xs">
              Join us and manage your student life easily
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full">
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Email Address
              </Text>
              <View className="bg-white rounded-xl shadow-sm border border-purple-100">
                <TextInput
                  placeholder="email@address.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="px-4 py-4 text-gray-900 text-base"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Password
              </Text>
              <View className="bg-white rounded-xl shadow-sm border border-purple-100 flex-row items-center">
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 px-4 py-4 text-gray-900 text-base"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="pr-4"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Confirm Password
              </Text>
              <View className="bg-white rounded-xl shadow-sm border border-purple-100 flex-row items-center">
                <TextInput
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  className="flex-1 px-4 py-4 text-gray-900 text-base"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="pr-4"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={24}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            {loading ? (
              <View className="bg-purple-700 py-4 rounded-xl items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={signUpWithEmail}
                className="bg-purple-700 py-4 rounded-xl shadow-lg active:opacity-90"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-base">
                  Sign Up
                </Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-sm">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "(auth)/sign-in" }], // halaman baru
                    })
                  )
                }
              >
                <Text className="text-purple-700 font-bold text-sm">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
