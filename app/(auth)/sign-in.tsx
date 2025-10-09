import { router, useRouter } from "expo-router";
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    router.replace("/");

    if (error) {
      Alert.alert(error.message);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 "
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
              Welcome Back
            </Text>
            <Text className="text-sm text-purple-600 text-center max-w-xs">
              Sign in to continue your learning journey
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
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Password
              </Text>
              <View className="bg-white rounded-xl shadow-sm border border-purple-100">
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  className="px-4 py-4 text-gray-900 text-base"
                />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6">
              <Text className="text-purple-700 font-semibold text-sm text-right">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            {loading ? (
              <View className="bg-purple-700 py-4 rounded-xl items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={signInWithEmail}
                className="bg-purple-700 py-4 rounded-xl shadow-lg active:opacity-90"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-base">
                  Sign In
                </Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-sm">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
                <Text className="text-purple-700 font-bold text-sm">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
