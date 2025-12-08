// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { Session, User } from "@supabase/supabase-js";
// import { useSQLiteContext } from "expo-sqlite";
// import { drizzle } from "drizzle-orm/expo-sqlite";
// import { users } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { Alert } from "react-native";

// interface AuthContextType {
//   session: Session | null;
//   user: User | null;
//   loading: boolean;
//   signIn: (email: string, password: string) => Promise<{ error: any }>;
//   signUp: (email: string, password: string) => Promise<{ error: any }>;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType>({
//   session: null,
//   user: null,
//   loading: true,
//   signIn: async () => ({ error: null }),
//   signUp: async () => ({ error: null }),
//   signOut: async () => {},
// });

// export const useAuth = () => useContext(AuthContext);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [session, setSession] = useState<Session | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const sqlite = useSQLiteContext();
//   const db = drizzle(sqlite);

//   useEffect(() => {
//     // Get initial session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setUser(session?.user ?? null);

//       // Sync user to local SQLite
//       if (session?.user) {
//         syncUserToLocal(session.user);
//       }

//       setLoading(false);
//     });

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       console.log("Auth state changed:", _event, session?.user?.email);
//       setSession(session);
//       setUser(session?.user ?? null);

//       // Sync user to local SQLite
//       if (session?.user) {
//         syncUserToLocal(session.user);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const syncUserToLocal = async (supabaseUser: User) => {
//     try {
//       // Check if user exists in local DB
//       const existingUser = await db
//         .select()
//         .from(users)
//         .where(eq(users.id, supabaseUser.id))
//         .limit(1);

//       if (existingUser.length === 0) {
//         // Insert new user
//         await db.insert(users).values({
//           id: supabaseUser.id,
//           email: supabaseUser.email!,
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString(),
//         });
//         console.log("✅ User synced to local SQLite:", supabaseUser.email);
//       } else {
//         console.log("✅ User already exists in local SQLite:", supabaseUser.email);
//       }
//     } catch (error) {
//       console.error("❌ Error syncing user to local SQLite:", error);
//     }
//   };

//   const signIn = async (email: string, password: string) => {
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         return { error };
//       }

//       // Sync to local on successful login
//       if (data.user) {
//         await syncUserToLocal(data.user);
//       }

//       return { error: null };
//     } catch (error: any) {
//       console.error("Sign in error:", error);
//       return { error };
//     }
//   };

//   const signUp = async (email: string, password: string) => {
//     try {
//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//       });

//       if (error) {
//         return { error };
//       }

//       // Note: User will be synced when they verify email and sign in
//       return { error: null };
//     } catch (error: any) {
//       console.error("Sign up error:", error);
//       return { error };
//     }
//   };

//   const signOut = async () => {
//     try {
//       await supabase.auth.signOut();
//       setSession(null);
//       setUser(null);
//       console.log("✅ User signed out");
//     } catch (error) {
//       console.error("❌ Error signing out:", error);
//       Alert.alert("Error", "Failed to sign out");
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// ===========================================================================

import { users } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useRouter, useSegments } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  needsOnboarding: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const sqlite = useSQLiteContext();
  const db = drizzle(sqlite);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Sync user to local SQLite
      if (session?.user) {
        syncUserToLocal(session.user);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);

      // Sync user to local SQLite
      if (session?.user) {
        syncUserToLocal(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Protected routes navigation
  useEffect(() => {
    if (loading) return;
    checkOnboardingStatus(user?.id);
    const inAuthGroup = segments[0] === "(auth)";
    console.log("Needs", needsOnboarding);
    console.log("Segment", segments[0]);
    console.log("InAuth", inAuthGroup);

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log("Kondisi pertama dipanggil");
      router.replace("/sign-in");
    } else if (user && needsOnboarding && segments[0] !== "onboarding") {
      // Redirect to onboarding if needed
      console.log("Kondisi kedua dipanggil");
      router.replace("/onboarding");
    } else if (user && !needsOnboarding && inAuthGroup) {
      // Redirect to home if authenticated and completed onboarding
      console.log("Kondisi ketiga dipanggil");
      router.replace("/(tabs)");
    }
    console.log("Semua kondisi gak dipanggil!");
  }, [user, loading, needsOnboarding, segments]);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const localUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (localUser.length > 0 && localUser[0].fullName) {
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setNeedsOnboarding(true);
    }
  };

  const syncUserToLocal = async (supabaseUser: User) => {
    try {
      // Check if user exists in local DB
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, supabaseUser.id))
        .limit(1);

      if (existingUser.length === 0) {
        // Insert new user
        await db.insert(users).values({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log("✅ User synced to local SQLite:", supabaseUser.email);
        setNeedsOnboarding(true);
      } else {
        console.log(
          "✅ User already exists in local SQLite:",
          supabaseUser.email
        );
        // Check if onboarding completed
        await checkOnboardingStatus(supabaseUser.id);
      }
    } catch (error) {
      console.error("❌ Error syncing user to local SQLite:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Sync to local on successful login
      if (data.user) {
        await syncUserToLocal(data.user);
      }

      return { error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setNeedsOnboarding(false);
      console.log("✅ User signed out");
    } catch (error) {
      console.error("❌ Error signing out:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        needsOnboarding,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
