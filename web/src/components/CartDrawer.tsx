"use client";

import { useCart } from "@/lib/cart-context";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
    const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, total, clearCart } = useCart();

    const handleCheckout = () => {
        if (items.length === 0) return;
        
        fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
        }).then(res => res.json()).then(data => {
            if (data.url) {
                window.location.href = data.url;
            }
        }).catch(err => {
            console.error('Checkout error:', err);
        });
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={() => setIsCartOpen(false)}
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0e14] border-l border-white/[0.08] z-[101] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
                            <div className="flex items-center gap-4">
                                <ShoppingBag className="w-5 h-5 text-imperium-gold" />
                                <h2 className="text-lg font-light text-white tracking-wide">Cart</h2>
                                <span className="text-xs text-white/30">({items.length})</span>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {items.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                    <p className="text-white/30 text-sm">Your cart is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                                            {item.image_url && (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white text-sm font-medium truncate">{item.name}</h3>
                                                <p className="text-imperium-gold text-sm mt-1">${item.price.toFixed(2)}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="ml-auto text-white/20 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-6 border-t border-white/[0.08] space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/40 text-sm">Total</span>
                                    <span className="text-white text-xl font-light">${total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-4 bg-imperium-gold text-imperium-bg rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all"
                                >
                                    Checkout
                                </button>
                                <button
                                    onClick={clearCart}
                                    className="w-full py-2 text-white/30 text-xs hover:text-white/50 transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
