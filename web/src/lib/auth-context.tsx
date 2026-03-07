"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  auth_id: string | null;
  is_admin: boolean;
  is_premium: boolean;
  is_subscribed: boolean;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  // becomes true once we've attempted to load the profile (even if it's null)
  profileLoaded?: boolean;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkPremiumStatus: (email: string) => Promise<{ isPremium: boolean; profile: Profile | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id)
          .then((profileData) => setProfile(profileData))
          .catch((err) => {
            console.error("Error fetching profile on init:", err);
            setProfile(null);
          })
          .finally(() => {
            setLoading(false);
            setProfileLoaded(true);
          });
      } else {
        setLoading(false);
        setProfileLoaded(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id)
          .then((profileData) => setProfile(profileData))
          .catch((err) => {
            console.error("Error fetching profile on auth change:", err);
            setProfile(null);
          })
          .finally(() => setProfileLoaded(true));
      } else {
        setProfile(null);
        setProfileLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: crypto.randomUUID(),
          auth_id: data.user.id,
          email: email.toLowerCase(),
          first_name: firstName || null,
          is_premium: false,
          is_admin: false,
          is_subscribed: false,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setProfileLoaded(true);
  };

  const checkPremiumStatus = async (email: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("email", email.toLowerCase()).single();

      if (error || !data) {
        return { isPremium: false, profile: null };
      }

      return {
        isPremium: data.is_premium === true || data.subscription_status === "active",
        profile: data as Profile,
      };
    } catch (error) {
      return { isPremium: false, profile: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileLoaded,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        checkPremiumStatus,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
