import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, Linking } from "react-native";
import "../global.css";

export default function AuthLayout() {
  const router = useRouter();

  // deep link handler kamu (opsional) tetap bisa dipakai di sini
  // useEffect(() => {
  //   const handleDeepLink = async (event: { url: string }) => {
  //     const url = event.url;
  //     const { access_token, refresh_token, type } =
  //       Linking.parse(url)?.queryParams || {};
  //     if (access_token && refresh_token && type === "recovery") {
  //       await supabase.auth.setSession({ access_token, refresh_token });
  //       router.push("/(auth)/new-password");
  //     }
  //   };
  //   const subscription = Linking.addEventListener("url", handleDeepLink);
  //   return () => subscription.remove();
  // }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // sesuaikan jika pakai custom header
    >
      <Stack screenOptions={{ headerShown: false }} />
    </KeyboardAvoidingView>
  );
}
