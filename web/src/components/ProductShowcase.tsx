"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Product = {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    image_url: string | null;
    stripe_url?: string | null;
};

const CATALOG: Product[] = [
    {
        id: "tee-01",
        name: "Imperium Command Tee",
        category: "shirts",
        description: "Premium heavyweight cotton. Minimal Imperium insignia on chest. Structured drop-cut silhouette designed for the serious operator.",
        price: 44,
        image_url: "/products/shirt.jpeg",
    },
    {
        id: "hoodie-01",
        name: "Exclusive Imperium Hoodie",
        category: "hoodies",
        description: "400gsm heavyweight fleece. Boxy architectural fit with embossed Imperium emblem. Built to signal sovereignty in any room.",
        price: 88,
        image_url: "/products/hoodie.jpeg",
    },
    {
        id: "sweats-01",
        name: "Imperium Stealth Sweats",
        category: "sweats",
        description: "French terry sweatpants. Tapered fit, minimal embroidery, zippered ankles. Built for recovery, remapped for command.",
        price: 80,
        image_url: "/products/sweats.jpeg",
    },
];

export function ProductShowcase() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [addedProduct, setAddedProduct] = useState<string | null>(null);

    const categories = ["All", "Shirts", "Hoodies", "Sweats", "Hats", "Beanies"];

    const { addItem } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("in_stock", true)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Supabase error:", error);
                    setProducts(CATALOG);
                    setLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    setProducts(data);
                } else {
                    setProducts(CATALOG);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setProducts(CATALOG);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
        });
        setAddedProduct(product.id);
        setTimeout(() => setAddedProduct(null), 2000);
    };

    const filtered = activeCategory === "All"
        ? products
        : products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

    return (
        <section className="py-12 sm:py-20">
            {/* Categories */}
            <div className="flex justify-center mb-10 sm:mb-16 px-4">
                <div className="flex items-center gap-2 sm:gap-3 p-1 border border-imperium-gold/20 bg-imperium-gold/5 rounded-full overflow-x-auto max-w-full">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 sm:px-5 py-2 text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-full transition-all duration-300 whitespace-nowrap ${activeCategory === cat
                                ? "bg-imperium-gold text-imperium-bg shadow-lg shadow-imperium-gold/20"
                                : "text-white/30 hover:text-white/60"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse glass-card rounded-2xl h-80 sm:h-96" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-104 opacity-80 group-hover:opacity-95"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-imperium-surface">
                                            <span className="text-imperium-gold text-4xl font-bold tracking-widest">I</span>
                                        </div>
                                    )}
                                    {/* Category badge */}
                                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-imperium-gold/20">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">{product.category}</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
                                        <h3 className="text-base font-medium text-white leading-snug">{product.name}</h3>
                                        <span className="text-imperium-gold font-bold text-sm flex-shrink-0">${Number(product.price).toFixed(2)}</span>
                                    </div>

                                    <p className="text-sm text-white/40 font-light leading-relaxed mb-4 sm:mb-6 flex-1">
                                        {product.description}
                                    </p>

                                    <div className="pt-3 sm:pt-4 flex gap-2">
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={addedProduct === product.id}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold tracking-widest uppercase rounded-lg transition-all duration-300 ${addedProduct === product.id
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                    : "bg-imperium-gold/10 text-imperium-gold border border-imperium-gold/30 hover:bg-imperium-gold/20"
                                                }`}
                                        >
                                            {addedProduct === product.id ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    Added
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </button>
                                        {product.stripe_url && (
                                            <a
                                                href={product.stripe_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold tracking-widest uppercase text-white/50 hover:text-white border border-imperium-gold/20 hover:border-imperium-gold/30 rounded-lg transition-colors"
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                            </a>
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
