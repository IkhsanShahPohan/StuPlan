import { Ionicons } from "@expo/vector-icons";
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
import { useAuth } from "@/lib/AuthContext";

const { height } = Dimensions.get("window");

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();

  async function handleSignUp() {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        // Handle specific error messages
        if (error.message.includes("already registered")) {
          Alert.alert(
            "Account Exists",
            "This email is already registered. Please sign in instead."
          );
        } else if (error.message.includes("Password should be")) {
          Alert.alert("Error", "Password must be at least 6 characters");
        } else {
          Alert.alert("Error", error.message);
        }
        setLoading(false);
        return;
      }

      // Success
      setLoading(false);
      Alert.alert(
        "Success! 🎉",
        "Your account has been created successfully. Please check your email to verify your account before signing in.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/sign-in"),
          },
        ]
      );
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Sign up error:", error);
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
              Join us and manage your tasks efficiently
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
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                Password
              </Text>
              <View className="bg-white rounded-xl shadow-sm border border-purple-100 flex-row items-center">
                <TextInput
                  placeholder="Enter your password (min. 6 characters)"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 px-4 py-4 text-gray-900 text-base"
                  editable={!loading}
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
                  editable={!loading}
                  onSubmitEditing={handleSignUp}
                  returnKeyType="go"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="pr-4"
                  activeOpacity={0.7}
                  disabled={loading}
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

            {/* Password Requirements Info */}
            <View className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <View className="flex-row items-center mb-1">
                <Ionicons name="information-circle" size={16} color="#3b82f6" />
                <Text className="text-xs font-semibold text-blue-900 ml-2">
                  Password Requirements:
                </Text>
              </View>
              <Text className="text-xs text-blue-800 ml-6">
                • At least 6 characters long
              </Text>
              <Text className="text-xs text-blue-800 ml-6">
                • Must match confirmation
              </Text>
            </View>

            {/* Sign Up Button */}
            {loading ? (
              <View className="bg-purple-700 py-4 rounded-xl items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSignUp}
                className="bg-purple-700 py-4 rounded-xl shadow-lg active:opacity-90"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-base">
                  Create Account
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
                onPress={() => router.replace("/(auth)/sign-in")}
                disabled={loading}
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