"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Package, Heart, MapPin, User, Settings, LogOut,
  ChevronRight, ShoppingBag, Clock, CheckCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?redirect=/account");
        return;
      }
      
      setUser(user);
      
      // Fetch orders (mock for now)
      setOrders([
        {
          id: "ORD-001",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "delivered",
          total: 132.00,
          items: [
            { name: "Imperium Command Tee", quantity: 2, price: 44 },
            { name: "Imperium Stealth Sweats", quantity: 1, price: 80 },
          ],
        },
        {
          id: "ORD-002",
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: "shipped",
          total: 88.00,
          items: [
            { name: "Exclusive Imperium Hoodie", quantity: 1, price: 88 },
          ],
        },
      ]);
      
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-imperium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { icon: ShoppingBag, label: "Orders", href: "/account/orders", count: 2 },
    { icon: Heart, label: "Wishlist", href: "/account/wishlist", count: 0 },
    { icon: MapPin, label: "Addresses", href: "/account/addresses" },
    { icon: User, label: "Profile", href: "/account/profile" },
    { icon: Settings, label: "Settings", href: "/account/settings" },
  ];

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    processing: "text-blue-400 bg-blue-400/10",
    shipped: "text-purple-400 bg-purple-400/10",
    delivered: "text-green-400 bg-green-400/10",
    cancelled: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-white font-bold">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </h1>
            <p className="text-white/40 mt-1">Manage your account and orders</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-imperium-gold text-imperium-bg rounded-full">
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-2xl p-6">
                <Package className="w-6 h-6 text-imperium-gold mb-4" />
                <p className="text-2xl text-white font-bold">{orders.length}</p>
                <p className="text-white/40 text-sm">Total Orders</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <Heart className="w-6 h-6 text-imperium-gold mb-4" />
                <p className="text-2xl text-white font-bold">0</p>
                <p className="text-white/40 text-sm">Wishlist Items</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <Clock className="w-6 h-6 text-imperium-gold mb-4" />
                <p className="text-2xl text-white font-bold">
                  {orders.filter(o => o.status === "shipped").length}
                </p>
                <p className="text-white/40 text-sm">In Transit</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-white font-bold">Recent Orders</h2>
                <Link href="/account/orders" className="text-imperium-gold text-sm hover:underline">
                  View All
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">No orders yet</p>
                  <Link href="/shop" className="text-imperium-gold text-sm hover:underline mt-2 inline-block">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-black/20 rounded-xl"
                    >
                      <div>
                        <p className="text-white font-medium">{order.id}</p>
                        <p className="text-white/40 text-sm">
                          {new Date(order.created_at).toLocaleDateString()} · {order.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-imperium-gold font-bold">${order.total.toFixed(2)}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full capitalize ${statusColors[order.status]}`}>
                          {order.status === "delivered" && <CheckCircle className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/shop"
                className="p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
              >
                <ShoppingBag className="w-8 h-8 text-imperium-gold mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">Shop Again</h3>
                <p className="text-white/40 text-sm">Browse our latest collection</p>
              </Link>
              <Link
                href="/account/wishlist"
                className="p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
              >
                <Heart className="w-8 h-8 text-imperium-gold mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">Your Wishlist</h3>
                <p className="text-white/40 text-sm">Items saved for later</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
