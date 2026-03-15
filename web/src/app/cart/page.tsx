"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Trash2, Minus, Plus, ShoppingBag, 
  Check, AlertCircle, Loader2
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApplyPromo = async () => {
    setPromoError(null);
    
    if (promoCode.toUpperCase() === "IMPERIUM20") {
      setPromoDiscount(20);
      setPromoApplied(true);
    } else {
      setPromoError("Invalid promo code");
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const shippingCost = total >= 100 ? 0 : 15;
  const discount = promoDiscount;
  const taxRate = 0.08;
  const tax = Math.round((total - discount) * taxRate) / 100;
  const grandTotal = total - discount + shippingCost + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
        <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ShoppingBag className="w-10 h-10 text-imperium-gold" />
          </motion.div>
          <h1 className="text-3xl text-white font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-white/40 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="px-8 py-4 bg-imperium-gold text-imperium-bg font-bold rounded-xl hover:bg-imperium-gold/90 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] pb-20">
      {/* Header */}
      <div className="border-b border-white/10 py-4">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-white font-bold mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="lg:w-3/5">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex gap-6 py-6 border-b border-white/10"
                >
                  {/* Image */}
                  <div 
                    className="w-28 h-32 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => router.push("/shop")}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-imperium-gold text-2xl font-bold">I</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 
                          className="text-white font-medium cursor-pointer hover:text-imperium-gold transition-colors"
                          onClick={() => router.push("/shop")}
                        >
                          {item.name}
                        </h3>
                        {item.size && (
                          <p className="text-white/40 text-sm">Size: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-white/40 text-sm">Color: {item.color}</p>
                        )}
                      </div>
                      <span className="text-imperium-gold font-bold text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={clearCart}
              className="mt-6 text-white/40 hover:text-red-400 text-sm transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:w-2/5">
            <div className="bg-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg text-white font-bold mb-4">Order Summary</h3>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-white/60 text-sm mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied}
                    className="px-4 py-3 border border-imperium-gold/30 text-imperium-gold font-bold rounded-lg hover:bg-imperium-gold/10 disabled:opacity-50 transition-colors"
                  >
                    {promoApplied ? <Check className="w-5 h-5" /> : "Apply"}
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {promoError}
                  </p>
                )}
                {promoApplied && (
                  <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Promo code applied!
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                {total < 100 && shippingCost > 0 && (
                  <p className="text-white/40 text-xs">
                    Add ${(100 - total).toFixed(2)} more for free shipping
                  </p>
                )}
                
                <div className="flex justify-between text-white/60">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-white font-bold text-xl pt-3 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-imperium-gold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full mt-6 py-4 bg-imperium-gold text-imperium-bg font-bold rounded-xl hover:bg-imperium-gold/90 transition-colors"
              >
                Proceed to Checkout
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center gap-6 text-white/30 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 border border-white/20 rounded" /> Secure Checkout
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 border border-white/20 rounded" /> Free Returns
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
