import { users } from "@/db/schema";
import { useAuth } from "@/lib/AuthContext";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  birthDate: string | null;
  educationLevel: string | null;
  institution: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuth();
  const sqlite = useSQLiteContext();
  const db = drizzle(sqlite);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (result.length > 0) {
        setProfile(result[0] as UserProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      "Keluar dari Akun",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Belum diisi";

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("id-ID", { month: "long" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMemberSince = (createdAt: string | null) => {
    if (!createdAt) return "Baru bergabung";
    const date = new Date(createdAt);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 43 }}
    >
      {/* Header Section */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-white pt-16 pb-8 px-6 border-b border-gray-100"
      >
        <View className="items-center">
          {/* Avatar */}
          <View className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 items-center justify-center shadow-lg mb-4">
            <Text className="text-white text-4xl font-bold">
              {getInitials(profile?.fullName || null)}
            </Text>
          </View>

          {/* Name & Email */}
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {profile?.fullName || "Nama belum diisi"}
          </Text>
          <Text className="text-base text-gray-500 mb-3">{profile?.email}</Text>

          {/* Member Since Badge */}
          <View className="bg-gray-100 px-4 py-2 rounded-full">
            <Text className="text-xs font-medium text-gray-600">
              Bergabung sejak {getMemberSince(profile?.createdAt || null)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Profile Information Section */}
      <Animated.View
        entering={FadeInRight.delay(100).duration(400)}
        className="px-6 py-6"
      >
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Informasi Pribadi
        </Text>

        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Full Name */}
          <ProfileItem
            icon="👤"
            label="Nama Lengkap"
            value={profile?.fullName || "Belum diisi"}
          />

          {/* Birth Date */}
          <ProfileItem
            icon="🎂"
            label="Tanggal Lahir"
            value={profile?.birthDate || "Belum diisi"}
          />

          {/* Education Level */}
          <ProfileItem
            icon="🎓"
            label="Jenjang Pendidikan"
            value={profile?.educationLevel || "Belum diisi"}
          />

          {/* Institution */}
          <ProfileItem
            icon="🏫"
            label="Instansi"
            value={profile?.institution || "Belum diisi"}
            isLast
          />
        </View>
      </Animated.View>

      {/* Account Settings Section */}
      <Animated.View
        entering={FadeInRight.delay(200).duration(400)}
        className="px-6 pb-6"
      >
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Pengaturan Akun
        </Text>

        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* Edit Profile */}
          <ActionItem
            icon="✏️"
            label="Edit Profil"
            description="Perbarui informasi pribadi Anda"
            onPress={handleEditProfile}
          />

          {/* Reset Password */}
          <ActionItem
            icon="🔒"
            label="Ubah Kata Sandi"
            description="Perbarui kata sandi akun Anda"
            onPress={() => router.push("/change-password")}
            isLast
          />
        </View>

        {/* Danger Zone */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-500 mb-3 px-1">
            CADANGKAN
          </Text>

          <View className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden mb-3">
            {/* Restore Data */}
            <ActionItem
              icon="☁️"
              label="Cadangan & Sinkronisasi"
              description="Kelola pencadangan data Anda"
              onPress={() => router.push("/backup/settings")}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-50 border-2 border-red-200 rounded-2xl py-4 px-6 flex-row items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Text className="text-lg font-semibold text-red-600 mr-2">
            Keluar dari Akun
          </Text>
          <Text className="text-xl">🚪</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer Info */}
      <View className="px-6 pb-8 items-center">
        <Text className="text-sm text-gray-400 text-center">
          Terakhir diperbarui:{" "}
          {profile?.updatedAt
            ? new Date(profile.updatedAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Tidak tersedia"}
        </Text>
      </View>
    </ScrollView>
  );
}

// Profile Item Component
interface ProfileItemProps {
  icon: string;
  label: string;
  value: string;
  badge?: string;
  isLast?: boolean;
}

function ProfileItem({ icon, label, value, badge, isLast }: ProfileItemProps) {
  return (
    <View
      className={`flex-row items-center px-5 py-4 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-500 mb-1">{label}</Text>
        <View className="flex-row items-center">
          <Text className="text-base font-semibold text-gray-900 flex-1">
            {value}
          </Text>
          {badge && (
            <View className="bg-blue-50 px-3 py-1 rounded-full ml-2">
              <Text className="text-xs font-medium text-blue-600">{badge}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// Action Item Component
interface ActionItemProps {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
  isLast?: boolean;
}

function ActionItem({
  icon,
  label,
  description,
  onPress,
  isLast,
}: ActionItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-5 py-4 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
      activeOpacity={0.6}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-0.5">
          {label}
        </Text>
        <Text className="text-sm text-gray-500">{description}</Text>
      </View>
      <Text className="text-gray-400 text-xl ml-2">›</Text>
    </TouchableOpacity>
  );
}
