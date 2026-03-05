"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

type Product = {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    image_url: string;
    stripe_url?: string;
};

// 5 unique products — 1 tee, 2 hoodies, 2 sweats — no bracelet, no duplicates
const CATALOG: Product[] = [
    {
        id: "tee-01",
        name: "Imperium Command Tee",
        category: "T-Shirt",
        description: "Premium heavyweight cotton. Minimal Imperium insignia on chest. Structured drop-cut silhouette designed for the serious operator.",
        price: 44,
        image_url: "/products/shirt.jpeg",
        stripe_url: "https://buy.stripe.com/14A5kCeKobrC36j9Hh5AQ05",
    },
    {
        id: "hoodie-01",
        name: "Exclusive Imperium Hoodie",
        category: "Hoodie",
        description: "400gsm heavyweight fleece. Boxy architectural fit with embossed Imperium emblem. Built to signal sovereignty in any room.",
        price: 88,
        image_url: "/products/hoodie.jpeg",
        stripe_url: "https://buy.stripe.com/bJedR8gSw67i9uHg5F5AQ03",
    },
    {
        id: "sweats-01",
        name: "Imperium Stealth Sweats",
        category: "Sweatpants",
        description: "French terry sweatpants. Tapered fit, minimal embroidery, zippered ankles. Built for recovery, remapped for command.",
        price: 80,
        image_url: "/products/sweats.jpeg",
        stripe_url: "https://buy.stripe.com/4gM5kC45K8fq36j2eP5AQ06",
    },
];

export function ProductShowcase() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "T-Shirt", "Hoodie", "Sweatpants"];

    useEffect(() => {
        async function fetchProducts() {
            try {
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
                    setProducts(CATALOG);
                    setLoading(false);
                    return;
                }
                const { data, error } = await supabase.from("products").select("*").eq("in_stock", true).limit(8);
                if (error) throw error;
                setProducts(data?.length ? data : CATALOG);
            } catch {
                setProducts(CATALOG);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const filtered = activeCategory === "All"
        ? products
        : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

    return (
        <section className="py-20">
            {/* Categories */}
            <div className="flex justify-center mb-16 px-4 overflow-x-auto w-full no-scrollbar">
                <div className="flex items-center gap-3 p-1 border border-white/5 bg-white/[0.02] rounded-full min-w-max">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 ${activeCategory === cat
                                ? "bg-white text-black shadow-lg shadow-white/10"
                                : "text-white/30 hover:text-white/60"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-6 max-w-6xl">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse glass-card rounded-2xl h-96" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="group glass-card rounded-2xl overflow-hidden flex flex-col hover:border-imperium-gold/25 hover:shadow-[0_8px_40px_-8px_rgba(212,175,55,0.12)] transition-all duration-500"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/5] overflow-hidden bg-imperium-surface">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-104 opacity-80 group-hover:opacity-95"
                                        style={{ transform: "scale(1)" }}
                                        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                                        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                                    />
                                    {/* Category badge */}
                                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">{product.category}</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-base font-medium text-white leading-snug">{product.name}</h3>
                                        <span className="text-imperium-gold font-bold text-sm flex-shrink-0">${product.price}</span>
                                    </div>

                                    <p className="text-sm text-white/40 font-light leading-relaxed mb-6 flex-1">
                                        {product.description}
                                    </p>

                                    <div className="pt-4">
                                        {product.stripe_url ? (
                                            <a
                                                href={product.stripe_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-3 text-[11px] font-bold tracking-widest uppercase text-white/50 hover:text-imperium-gold transition-colors duration-300"
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                Acquire
                                            </a>
                                        ) : (
                                            <button className="flex items-center justify-center gap-2 w-full py-3 text-[11px] font-bold tracking-widest uppercase text-white/50 hover:text-imperium-gold transition-colors duration-300">
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                Acquire
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
