import { TabIcon } from "@/molecules/TabIcon";
import { icons } from "@/constants/icons";
import { Tabs, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const _Layout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // kalau pakai header custom atau ingin “angkat” konten sedikit di iOS, bisa atur offset
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true, // ⬅️ penting: sembunyikan tab bar saat keyboard muncul
          tabBarItemStyle: {
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderRadius: 50,
            marginBottom: 36,
            position: "absolute",
            overflow: "hidden",
            marginHorizontal: 15,
            height: 56,
            shadowColor: "#6366F1",
            shadowOffset: { width: 2, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            borderTopWidth: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon title="Home" icon={icons.home2} focused={focused} />,
          }}
        />
           <Tabs.Screen
          name="tasks"
          options={{
            title: "Tasks",
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon title="Tasks" icon={icons.task2} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: "Learn",
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon title="Learn" icon={icons.learn} focused={focused} />,
          }}
        />
     
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon title="Calendar" icon={icons.calendar} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon title="Profile" icon={icons.person2} focused={focused} />,
          }}
        />
      </Tabs>
    </KeyboardAvoidingView>
  );
};

export default _Layout;
