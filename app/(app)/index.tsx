// import { useEffect, useState } from "react";
// import { ActivityIndicator, View } from "react-native";
// import { Session } from "@supabase/supabase-js";
// import { router } from "expo-router";
// import { supabase } from "../lib/supabase";
// import "react-native-url-polyfill/auto";

import { Text, View } from "react-native";

// export default function Index() {
//   const [session, setSession] = useState<Session | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Cek session pertama kali saat app dibuka
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setLoading(false);

//       if (session) {
//         router.replace("/home");
//       } else {
//         router.replace("/sign-in");
//       }
//     });

//     // Dengarkan perubahan status login
//   const { data: { subscription } } = supabase.auth.onAuthStateChange(
//     (_event, session) => {
//       setSession(session);
//       if (session) {
//         router.replace("/home");
//       } else {
//         router.replace("/sign-in");
//       }
//     }
//   );

//     return () => {
//       subscription?.unsubscribe();
//     };
//   }, []);

//   // Tampilkan loading indicator sementara cek session
//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <ActivityIndicator size="large" color="#6C63FF" />
//       </View>
//     );
//   }

//   return null; // tidak perlu render apapun, karena langsung redirect
// }
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Home Page</Text>

      {/* Tombol Sign Out */}
      {/* <TouchableOpacity
        className="border border-indigo-600 py-4 px-10 rounded-xl mt-2 active:opacity-80"
        onPress={() => supabase.auth.signOut()}
      >
        <Text className="text-indigo-600 font-semibold text-base">
          Sign Out
        </Text>
      </TouchableOpacity> */}

      {/* Tombol ke Index */}
      {/* <TouchableOpacity
        className="border border-indigo-600 py-4 px-10 rounded-xl mt-4 active:opacity-80"
        onPress={() => router.replace("/")}
      >
        <Text className="text-indigo-600 font-semibold text-base">Index</Text>
      </TouchableOpacity> */}
    </View>
  );
}
