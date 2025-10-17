import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Linking } from "react-native";
import "../global.css";

export default function RootLayout() {
  const router = useRouter();

  // useEffect(() => {
  //   const handleDeepLink = async (event) => {
  //     const url = event.url;
  //     const { access_token, refresh_token, type } =
  //       Linking.parse(url)?.queryParams || {};

  //     if (access_token && refresh_token && type === "recovery") {
  //       try {
  //         await supabase.auth.setSession({ access_token, refresh_token });
  //         router.push("/(auth)/new-password");
  //       } catch (err) {
  //         console.error("Failed to set session:", err);
  //       }
  //     }
  //   };

  //   const subscription = Linking.addEventListener("url", handleDeepLink);
  //   return () => subscription.remove();
  // }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false, // sembunyikan header default
      }}
    />
  );
}
