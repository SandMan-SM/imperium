"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ChevronLeft, User, Mail, Lock, Phone, Bell, CreditCard,
  Check, AlertCircle, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    marketingEmails: false,
    newProducts: true,
    promotions: false,
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?redirect=/account/profile");
        return;
      }
      
      setUser(user);
      setFormData({
        ...formData,
        email: user.email || "",
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
      });
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-imperium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] pb-20">
      {/* Header */}
      <div className="border-b border-white/10 py-4">
        <div className="container mx-auto px-4">
          <Link
            href="/account"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Account
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-white font-bold mb-8">Profile Settings</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-4"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-4"
          >
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-green-400 text-sm">Settings updated successfully!</p>
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <User className="w-5 h-5 text-imperium-gold" />
              <h2 className="text-xl text-white font-bold">Profile Information</h2>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white/40 cursor-not-allowed"
                />
                <p className="text-white/30 text-xs mt-1">Contact support to change your email</p>
              </div>
              
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-imperium-gold text-imperium-bg font-bold rounded-lg hover:bg-imperium-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="w-5 h-5 text-imperium-gold" />
              <h2 className="text-xl text-white font-bold">Change Password</h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={saving || !formData.currentPassword || !formData.newPassword}
                className="px-6 py-3 bg-imperium-gold text-imperium-bg font-bold rounded-lg hover:bg-imperium-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </form>
          </div>

          {/* Email Preferences */}
          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <Bell className="w-5 h-5 text-imperium-gold" />
              <h2 className="text-xl text-white font-bold">Email Preferences</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { key: "orderUpdates", label: "Order Updates", desc: "Shipping confirmations, delivery updates" },
                { key: "marketingEmails", label: "Marketing Emails", desc: "Promotions, sales, and special offers" },
                { key: "newProducts", label: "New Products", desc: "Be the first to know about new releases" },
                { key: "promotions", label: "Exclusive Promotions", desc: "Early access to sales and member-only deals" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-white/40 text-sm">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-black/20 text-imperium-gold focus:ring-imperium-gold focus:ring-offset-0"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
