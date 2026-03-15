"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Package, Search, Filter,
  CheckCircle, Clock, Truck, XCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  created_at: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: { name: string; quantity: number; price: number; image_url?: string }[];
  shipping_address?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
};

const mockOrders: Order[] = [
  {
    id: "ORD-IMP-001",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "shipped",
    total: 132.00,
    items: [
      { name: "Imperium Command Tee", quantity: 2, price: 44, image_url: "/products/shirt.jpeg" },
      { name: "Imperium Stealth Sweats", quantity: 1, price: 80, image_url: "/products/sweats.jpeg" },
    ],
    shipping_address: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
  },
  {
    id: "ORD-IMP-002",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "delivered",
    total: 88.00,
    items: [
      { name: "Exclusive Imperium Hoodie", quantity: 1, price: 88, image_url: "/products/hoodie.jpeg" },
    ],
    shipping_address: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
  },
  {
    id: "ORD-IMP-003",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: "delivered",
    total: 176.00,
    items: [
      { name: "Imperium Command Tee", quantity: 2, price: 44, image_url: "/products/shirt.jpeg" },
      { name: "Exclusive Imperium Hoodie", quantity: 1, price: 88, image_url: "/products/hoodie.jpeg" },
    ],
    shipping_address: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?redirect=/account/orders");
        return;
      }
      
      // Use mock data for now
      setOrders(mockOrders);
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);

  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Pending" },
    processing: { icon: Package, color: "text-blue-400", bg: "bg-blue-400/10", label: "Processing" },
    shipped: { icon: Truck, color: "text-purple-400", bg: "bg-purple-400/10", label: "Shipped" },
    delivered: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", label: "Delivered" },
    cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Cancelled" },
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-3xl text-white font-bold mb-8">Orders</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "processing", "shipped", "delivered"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? "bg-imperium-gold text-imperium-bg"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl text-white font-medium mb-2">No orders found</h2>
            <p className="text-white/40 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "You haven't placed any orders yet"}
            </p>
            <Link
              href="/shop"
              className="px-6 py-3 bg-imperium-gold text-imperium-bg font-bold rounded-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-2xl overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-white font-bold">{order.id}</h3>
                        <p className="text-white/40 text-sm">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-full capitalize ${config.bg} ${config.color}`}>
                          <config.icon className="w-4 h-4" />
                          {config.label}
                        </span>
                        <span className="text-imperium-gold font-bold text-lg">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-white/40 text-sm">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-white/60">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="p-4 sm:p-6 bg-black/20 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-lg transition-colors text-sm"
                    >
                      View Details
                    </button>
                    {order.status === "delivered" && (
                      <button className="px-4 py-2 bg-imperium-gold/10 text-imperium-gold hover:bg-imperium-gold/20 rounded-lg transition-colors text-sm font-medium">
                        Buy Again
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
