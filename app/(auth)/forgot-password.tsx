import { CommonActions, useNavigation } from "@react-navigation/native";
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
import { supabase } from "../../lib/supabase";

const { height } = Dimensions.get("window");

export default function ForgotPassword() {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    if (!email) {
      Alert.alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {  
        redirectTo: "last://reset-password",
      });

      if (error) throw error;

      Alert.alert(
        "Email Sent!",
        "We've sent a password reset link to your email. Please check your inbox.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "(auth)/sign-in" }],
                })
              ),
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
                source={require("../../assets/images/forgot.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-purple-900 text-center mb-2">
              Reset Password
            </Text>
            <Text className="text-sm text-purple-600 text-center max-w-xs">
              Enter your registered email and we'll send you a password reset
              link
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full">
            {/* Email Input */}
            <View className="mb-6">
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

            {/* Reset Button */}
            {loading ? (
              <View className="bg-purple-700 py-4 rounded-xl items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleResetPassword}
                className="bg-purple-700 py-4 rounded-xl shadow-lg active:opacity-90"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-base">
                  Send Reset Link
                </Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Back to Login */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-sm">
                Remember your password?{" "}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "(auth)/sign-in" }],
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
