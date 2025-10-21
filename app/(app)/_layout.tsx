import { TabIcon } from "@/components/TabIcon";
import { icons } from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";



// const TabIcon = ({ focused, icon, title }: any) => {
//   if (focused) {
//     return (
//       <View className="flex flex-row flex-1 min-w-[110px] w-full min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
//         <View className="flex flex-row justify-center items-center bg-white/95 rounded-full px-4 py-3 shadow-md">
//           <Image source={icon} tintColor="#6366F1" className="size-5" />
//           <Text className="text-indigo-600 text-base font-semibold ml-2">
//             {title}
//           </Text>
//         </View>
//       </View>
//     );
//   } else {
//     return (
//       <View className="flex justify-center items-center w-[110px] h-14 mt-4 rounded-full">
//         <Image source={icon} tintColor="#94A3B8" className="size-5" />
//       </View>
//     );
//   }
// };

const _Layout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek session pertama kali
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Dengarkan perubahan status login
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Tampilkan loading indicator sementara cek session
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Redirect jika belum login
  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
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
          height: 52,
          shadowColor: "#6366F1",
          shadowOffset: {
            width: 0,
            height: 4,
          },
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
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Home" icon={icons.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Learn" icon={icons.learn} focused={focused} />
          ),
        }}
      />
            <Tabs.Screen
        name="calender"
        options={{
          title: "calender",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="calender" icon={icons.calendar} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Tasks" icon={icons.task} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon title="Profile" icon={icons.person} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;