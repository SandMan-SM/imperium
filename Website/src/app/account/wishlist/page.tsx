"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, ShoppingBag, Trash2, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type WishlistItem = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  compare_at_price?: number;
  image_url: string;
  slug: string;
  added_at: string;
};

const mockWishlist: WishlistItem[] = [
  {
    id: "wl-1",
    product_id: "hoodie-01",
    name: "Exclusive Imperium Hoodie",
    price: 88,
    compare_at_price: 110,
    image_url: "/products/hoodie.jpeg",
    slug: "exclusive-imperium-hoodie",
    added_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "wl-2",
    product_id: "sweats-01",
    name: "Imperium Stealth Sweats",
    price: 80,
    image_url: "/products/sweats.jpeg",
    slug: "imperium-stealth-sweats",
    added_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?redirect=/account/wishlist");
        return;
      }
      
      // Use mock data for now
      setWishlist(mockWishlist);
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);

  const removeFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const addToCart = (item: WishlistItem) => {
    // This would integrate with cart context
    router.push(`/shop/${item.slug}`);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-white font-bold">Wishlist</h1>
            <p className="text-white/40 mt-1">{wishlist.length} items saved</p>
          </div>
          {wishlist.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl text-white font-medium mb-2">Your wishlist is empty</h2>
            <p className="text-white/40 mb-6">Save items you love to your wishlist</p>
            <Link
              href="/shop"
              className="px-6 py-3 bg-imperium-gold text-imperium-bg font-bold rounded-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 rounded-2xl overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-[4/5]">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="p-4 bg-imperium-gold rounded-full hover:bg-imperium-gold/80 transition-colors"
                    >
                      <ShoppingBag className="w-5 h-5 text-imperium-bg" />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-4 bg-white/10 rounded-full hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  {/* Discount Badge */}
                  {item.compare_at_price && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      {Math.round(((item.compare_at_price - item.price) / item.compare_at_price) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <Link href={`/shop/${item.slug}`}>
                    <h3 className="text-white font-medium hover:text-imperium-gold transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-imperium-gold font-bold">${item.price}</span>
                    {item.compare_at_price && (
                      <span className="text-white/40 line-through text-sm">
                        ${item.compare_at_price}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full mt-4 py-2 bg-imperium-gold/10 text-imperium-gold font-medium rounded-lg hover:bg-imperium-gold/20 transition-colors text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
