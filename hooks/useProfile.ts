import { users } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import { useDrizzle } from "./useDrizzle";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  birthDate: string | null;
  educationLevel: string | null;
  institution: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateProfileData {
  fullName?: string;
  birthDate?: string;
  educationLevel?: string;
  institution?: string;
}

export const useProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = useDrizzle();

  /**
   * Load profile from SQLite
   */
  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [userProfile] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userProfile) {
        setProfile(userProfile as UserProfile);
      } else {
        setError("Profil tidak ditemukan");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  }, [userId, db]);

  /**
   * Update profile to both SQLite and Supabase
   */
  const updateProfile = useCallback(
    async (data: UpdateProfileData): Promise<boolean> => {
      if (!userId) {
        setError("User ID tidak ditemukan");
        return false;
      }

      try {
        setUpdating(true);
        setError(null);

        const updateData = {
          ...data,
          updatedAt: new Date().toISOString(),
        };

        // Update SQLite first
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId));

        console.log("✅ Profile updated in SQLite");

        // Then sync to Supabase
        const { error: supabaseError } = await supabase
          .from("users")
          .update({
            full_name: data.fullName,
            birth_date: data.birthDate,
            education_level: data.educationLevel,
            institution: data.institution,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (supabaseError) {
          console.error("Supabase sync error:", supabaseError);
          // SQLite is updated, but Supabase sync failed
          // We continue since local data is more important
        } else {
          console.log("✅ Profile synced to Supabase");
        }

        // Reload profile to get updated data
        await loadProfile();

        return true;
      } catch (err) {
        console.error("Error updating profile:", err);
        setError("Gagal memperbarui profil");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [userId, db, loadProfile]
  );

  /**
   * Sync profile from Supabase to SQLite
   */
  const syncFromSupabase = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError || !data) {
        console.error("Error fetching from Supabase:", fetchError);
        return false;
      }

      // Update SQLite with Supabase data
      await db
        .update(users)
        .set({
          fullName: data.full_name,
          birthDate: data.birth_date,
          educationLevel: data.education_level,
          institution: data.institution,
          updatedAt: data.updated_at,
        })
        .where(eq(users.id, userId));

      console.log("✅ Profile synced from Supabase to SQLite");
      await loadProfile();
      return true;
    } catch (err) {
      console.error("Error syncing from Supabase:", err);
      return false;
    }
  }, [userId, db, loadProfile]);

  /**
   * Calculate profile completion percentage
   */
  const getProfileCompletion = useCallback((): number => {
    if (!profile) return 0;

    const fields = [
      profile.fullName,
      profile.birthDate,
      profile.educationLevel,
      profile.institution,
    ];

    const completedFields = fields.filter((field) => field && field.trim() !== "").length;
    return Math.round((completedFields / fields.length) * 100);
  }, [profile]);

  /**
   * Check if profile is complete
   */
  const isProfileComplete = useCallback((): boolean => {
    return getProfileCompletion() === 100;
  }, [getProfileCompletion]);

  /**
   * Get age from birth date
   */
  const getAge = useCallback((): number | null => {
    if (!profile?.birthDate) return null;

    const birthDate = new Date(profile.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }, [profile]);

  /**
   * Format birth date for display
   */
  const getFormattedBirthDate = useCallback((): string | null => {
    if (!profile?.birthDate) return null;

    const date = new Date(profile.birthDate);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [profile]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    // Data
    profile,
    loading,
    updating,
    error,

    // Actions
    updateProfile,
    loadProfile,
    syncFromSupabase,

    // Computed
    profileCompletion: getProfileCompletion(),
    isProfileComplete: isProfileComplete(),
    age: getAge(),
    formattedBirthDate: getFormattedBirthDate(),
  };
};