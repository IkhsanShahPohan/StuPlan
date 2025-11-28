import { useRouter } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/AuthContext";

const { height } = Dimensions.get("window");

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  async function handleSignIn() {
    // Validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Handle specific error messages
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert("Error", "Invalid email or password");
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert(
            "Email Not Verified",
            "Please verify your email address before signing in. Check your inbox for the verification link."
          );
        } else {
          Alert.alert("Error", error.message);
        }
        setLoading(false);
        return;
      }

      // Success - AuthContext will handle the rest
      // Navigation will happen automatically via auth state listener
      setLoading(false);
      router.replace("/");
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Sign in error:", error);
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
              Welcome Back
            </Text>
            <Text className="text-sm text-purple-600 text-center max-w-xs">
              Sign in to continue managing your tasks
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
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
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
                  editable={!loading}
                  onSubmitEditing={handleSignIn}
                  returnKeyType="go"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="pr-4"
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              className="mb-6"
              onPress={() => router.push("/(auth)/reset-password")}
              disabled={loading}
            >
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
                onPress={handleSignIn}
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
              <TouchableOpacity 
                onPress={() => router.push("/(auth)/sign-up")}
                disabled={loading}
              >
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