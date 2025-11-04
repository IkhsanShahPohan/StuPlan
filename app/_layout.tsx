import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform, Linking } from "react-native";
import "../global.css";

export default function AuthLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} 
    >
      <Stack screenOptions={{ headerShown: false }} />
    </KeyboardAvoidingView>
  );
}
