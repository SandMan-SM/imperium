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
  previewView?: string | null;
  setPreview?: (view: string | null) => Promise<void>;
  rawProfile?: Profile | null;
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
  const [rawProfile, setRawProfile] = useState<Profile | null>(null);
  const [previewView, setPreviewView] = useState<string | null>(null);

  // initialize previewView from localStorage on mount so context reflects current state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const v = localStorage.getItem('preview_view');
        if (v) setPreviewView(v);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Listen for storage events so changes to preview_view in another tab or via the helper
  // update the context and re-fetch the profile across the app without requiring a full reload.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStorage = async (e: StorageEvent) => {
      if (e.key === 'preview_view') {
        try {
          const v = e.newValue;
          setPreviewView(v);
          if (user) {
            const p = await fetchProfile(user.id);
            setProfile(p);
          }
        } catch (err) {
          console.warn('failed to handle preview_view storage event', err);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  // When previewView changes in this context, re-fetch the profile so the app reflects the
  // new preview without relying on a full page reload.
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        const p = await fetchProfile(user.id);
        if (mounted) setProfile(p);
      } catch (e) {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [previewView, user]);
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

      // keep an unmodified copy of the raw profile for admin-only features
      try { setRawProfile(data as Profile); } catch (e) {}

      // Check for preview view (admin testing feature)
      const pv = previewView || (typeof window !== 'undefined' ? localStorage.getItem('preview_view') : null);
      if (pv && data) {
        const previewProfile = { ...data };
        switch (pv) {
          case 'public':
            previewProfile.is_subscribed = false;
            previewProfile.is_premium = false;
            previewProfile.subscription_status = null;
            // when previewing as a non-admin view, ensure admin flag is false
            previewProfile.is_admin = false;
            break;
          case 'subscriber':
            previewProfile.is_subscribed = true;
            previewProfile.is_premium = false;
            previewProfile.subscription_status = null;
            previewProfile.is_admin = false;
            break;
          case 'free':
            previewProfile.is_subscribed = true;
            previewProfile.is_premium = false;
            previewProfile.subscription_status = null;
            previewProfile.is_admin = false;
            break;
          case 'premium':
            previewProfile.is_subscribed = true;
            previewProfile.is_premium = true;
            previewProfile.subscription_status = 'active';
            previewProfile.is_admin = false;
            break;
          // 'admin' or null = real profile data
        }
        
        return previewProfile as Profile;
      }
      
      return data as Profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Set preview view programmatically (updates localStorage + refreshes profile)
  const setPreview = async (view: string | null) => {
    try {
      if (typeof window !== 'undefined') {
        if (view) localStorage.setItem('preview_view', view);
        else localStorage.removeItem('preview_view');
      }
      setPreviewView(view);
      if (user) {
        const p = await fetchProfile(user.id);
        setProfile(p);
      }
    } catch (e) {
      console.warn('setPreview failed', e);
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

      // Apply client-side preview override if present (admin testing feature)
      if (typeof window !== 'undefined') {
        const previewView = localStorage.getItem('preview_view');
        if (previewView) {
          const previewProfile = { ...(data as Profile) } as Profile;
          switch (previewView) {
            case 'public':
              previewProfile.is_subscribed = false;
              previewProfile.is_premium = false;
              previewProfile.subscription_status = null;
              previewProfile.is_admin = false;
              break;
            case 'subscriber':
              previewProfile.is_subscribed = true;
              previewProfile.is_premium = false;
              previewProfile.subscription_status = null;
              previewProfile.is_admin = false;
              break;
            case 'free':
              previewProfile.is_subscribed = true;
              previewProfile.is_premium = false;
              previewProfile.subscription_status = null;
              previewProfile.is_admin = false;
              break;
            case 'premium':
              previewProfile.is_subscribed = true;
              previewProfile.is_premium = true;
              previewProfile.subscription_status = 'active';
              previewProfile.is_admin = false;
              break;
          }

          return {
            isPremium: previewProfile.is_premium === true || previewProfile.subscription_status === 'active',
            profile: previewProfile,
          };
        }
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
          rawProfile,
          previewView,
          profileLoaded,
          session,
          loading,
          signIn,
          signUp,
          signOut,
          checkPremiumStatus,
          refreshProfile,
          setPreview,
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
