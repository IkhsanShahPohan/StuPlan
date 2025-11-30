import CustomNavBar from "@/components/CustomNavbar";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const _Layout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.log(error);
    }
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
    // <KeyboardAvoidingView
    //   style={{ flex: 1 }}
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   // kalau pakai header custom atau ingin “angkat” konten sedikit di iOS, bisa atur offset
    //   keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    // >
    // <Tabs
    //   screenOptions={{
    //     tabBarShowLabel: false,
    //     tabBarHideOnKeyboard: true,
    //     tabBarStyle: {
    //       backgroundColor: "rgba(255, 255, 255, 0.95)", // Semi-transparent
    //       borderRadius: 24,
    //       marginBottom: 20,
    //       marginHorizontal: 16,
    //       position: "absolute",
    //       height: 64,
    //       paddingVertical: 8,
    //       paddingHorizontal: 8,
    //       shadowColor: "#000",
    //       shadowOffset: { width: 0, height: 4 },
    //       shadowOpacity: 0.1,
    //       shadowRadius: 20,
    //       elevation: 8,
    //       borderTopWidth: 0,
    //     },
    //     tabBarItemStyle: {
    //       height: "100%",
    //     },
    //   }}
    // >
    //   <Tabs.Screen
    //     name="index"
    //     options={{
    //       title: "Home",
    //       headerShown: false,
    //       tabBarIcon: ({ focused }) => (
    //         <TabIcon title="Home" icon={icons.home2} focused={focused} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="tasks"
    //     options={{
    //       title: "Tasks",
    //       headerShown: false,
    //       tabBarIcon: ({ focused }) => (
    //         <TabIcon title="Tasks" icon={icons.task2} focused={focused} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="learn"
    //     options={{
    //       title: "Learn",
    //       headerShown: false,
    //       tabBarIcon: ({ focused }) => (
    //         <TabIcon title="Learn" icon={icons.learn} focused={focused} />
    //       ),
    //     }}
    //   />

    //   <Tabs.Screen
    //     name="calendar"
    //     options={{
    //       title: "Calendar",
    //       headerShown: false,
    //       tabBarIcon: ({ focused }) => (
    //         <TabIcon title="Calendar" icon={icons.calendar} focused={focused} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="test"
    //     options={{
    //       title: "test",
    //       headerShown: false,
    //       tabBarIcon: ({ focused }) => (
    //         <TabIcon title="Profile" icon={icons.person2} focused={focused} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="profile"
    //     options={{
    //       title: "Profile",
    //       headerShown: false,
    //       tabBarIcon: ({ focused }) => (
    //         <TabIcon title="Profile" icon={icons.person2} focused={focused} />
    //       ),
    //     }}
    //   />
    // </Tabs>
    // </KeyboardAvoidingView>

    <Tabs tabBar={(props) => <CustomNavBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ title: "Tasks", headerShown: false }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: "Calendar", headerShown: false }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: "Learn", headerShown: false }}
      />
      <Tabs.Screen
        name="test"
        options={{ title: "Test", headerShown: false }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", headerShown: false }}
      />
    </Tabs>
  );
};

export default _Layout;
