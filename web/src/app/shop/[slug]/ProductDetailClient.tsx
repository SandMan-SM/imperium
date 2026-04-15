"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Minus, Plus, Star, 
  Shield, Truck, RotateCcw, Heart, Share2, Check,
  AlertCircle, ShoppingBag
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  long_description?: string;
  price: number;
  compare_at_price?: number;
  image_url: string | null;
  images?: string[];
  in_stock: boolean;
  stock_quantity?: number;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  material?: string;
  care_instructions?: string;
  features?: string[];
  stripe_url?: string | null;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

const CATALOG: Product[] = [
  {
    id: "tee-01",
    slug: "imperium-command-tee",
    name: "Imperium Command Tee",
    category: "shirts",
    description: "Premium heavyweight cotton. Minimal Imperium insignia on chest. Structured drop-cut silhouette designed for the serious operator.",
    long_description: "Crafted from premium heavyweight cotton, the Imperium Command Tee represents the foundation of your wardrobe. The minimal Imperium insignia on the chest signals your allegiance without words. Designed with a structured drop-cut silhouette for the serious operator who demands both comfort and command.",
    price: 44,
    compare_at_price: 55,
    image_url: "/products/shirt.jpeg",
    images: ["/products/shirt.jpeg", "/products/shirt-2.jpeg", "/products/shirt-3.jpeg"],
    in_stock: true,
    stock_quantity: 150,
    sizes: ["S", "M", "L", "XL", "XXL"],
    material: "100% Premium Cotton, 280gsm",
    care_instructions: "Machine wash cold, tumble dry low",
    features: ["Drop-cut silhouette", "Reinforced collar", "Imperium chest embroidery", "Side seam gussets"],
    stripe_url: null,
  },
  {
    id: "hoodie-01",
    slug: "exclusive-imperium-hoodie",
    name: "Exclusive Imperium Hoodie",
    category: "hoodies",
    description: "400gsm heavyweight fleece. Boxy architectural fit with embossed Imperium emblem. Built to signal sovereignty in any room.",
    long_description: "The Exclusive Imperium Hoodie is built for those who command rooms. 400gsm heavyweight fleece provides unmatched warmth, while the boxy architectural fit makes a statement. The embossed Imperium emblem speaks to your sovereignty.",
    price: 88,
    compare_at_price: 110,
    image_url: "/products/hoodie.jpeg",
    images: ["/products/hoodie.jpeg", "/products/hoodie-2.jpeg", "/products/hoodie-3.jpeg"],
    in_stock: true,
    stock_quantity: 75,
    sizes: ["S", "M", "L", "XL", "XXL"],
    material: "80% Cotton, 20% Polyester, 400gsm",
    care_instructions: "Machine wash cold, hang dry",
    features: ["400gsm heavyweight fleece", "Boxy architectural fit", "Embossed Imperium emblem", "Kangaroo pocket with hidden zipper"],
    stripe_url: null,
  },
  {
    id: "sweats-01",
    slug: "imperium-stealth-sweats",
    name: "Imperium Stealth Sweats",
    category: "sweats",
    description: "French terry sweatpants. Tapered fit, minimal embroidery, zippered ankles. Built for recovery, remapped for command.",
    long_description: "Imperium Stealth Sweats are built for recovery and remapped for command. French terry construction provides comfort, while the tapered fit and minimal embroidery keep your profile low until you're ready to strike.",
    price: 80,
    compare_at_price: 100,
    image_url: "/products/sweats.jpeg",
    images: ["/products/sweats.jpeg", "/products/sweats-2.jpeg", "/products/sweats-3.jpeg"],
    in_stock: true,
    stock_quantity: 100,
    sizes: ["S", "M", "L", "XL", "XXL"],
    material: "100% French Cotton Terry",
    care_instructions: "Machine wash cold, tumble dry low",
    features: ["Tapered fit", "Minimal Imperium embroidery", "Zippered ankles", "Adjustable drawstring waistband"],
    stripe_url: null,
  },
];

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  
  const { addItem, isCartOpen, setIsCartOpen } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const productImages = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    return product?.image_url ? [product.image_url] : ["/products/placeholder.jpg"];
  }, [product]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error || !data) {
          const catalogProduct = CATALOG.find(p => p.slug === slug);
          setProduct(catalogProduct || null);
        } else {
          setProduct(data);
        }
      } catch (err) {
        const catalogProduct = CATALOG.find(p => p.slug === slug);
        setProduct(catalogProduct || null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor || "default"}`,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      size: selectedSize,
      color: selectedColor || undefined,
      quantity: quantity,
    });
    
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      setIsCartOpen(true);
    }, 800);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const discount = product?.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const isLowStock = product && product.stock_quantity !== undefined && product.stock_quantity < 20;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <div className="aspect-[4/5] bg-gray-800 rounded-2xl" />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <div className="h-8 bg-gray-800 rounded w-3/4" />
              <div className="h-6 bg-gray-800 rounded w-1/4" />
              <div className="h-32 bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-imperium-gold mx-auto mb-4" />
          <h1 className="text-2xl text-white mb-2">Product Not Found</h1>
          <p className="text-white/40 mb-6">This product doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-3 bg-imperium-gold text-imperium-bg font-bold rounded-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-white/40">
          <button onClick={() => router.push("/")} className="hover:text-imperium-gold transition-colors">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => router.push("/shop")} className="hover:text-imperium-gold transition-colors">Shop</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => router.push(`/shop?category=${product.category}`)} className="hover:text-imperium-gold transition-colors capitalize">
            {product.category}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white/60">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-imperium-surface mb-4"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={productImages[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  -{discount}%
                </div>
              )}
              
              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`p-4 rounded-full backdrop-blur-md transition-all ${
                    isWishlisted
                      ? "bg-imperium-gold text-imperium-bg"
                      : "bg-black/40 text-white hover:bg-imperium-gold/20"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
                <button aria-label="Share product" className="p-4 rounded-full bg-black/40 text-white hover:bg-imperium-gold/20 backdrop-blur-md transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    aria-label="Previous image"
                    onClick={() => setActiveImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-imperium-gold/40 backdrop-blur-md transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    aria-label="Next image"
                    onClick={() => setActiveImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-imperium-gold/40 backdrop-blur-md transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeImageIndex 
                        ? "border-imperium-gold" 
                        : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category */}
              <span className="text-imperium-gold text-xs font-bold tracking-[0.2em] uppercase">
                {product.category}
              </span>

              {/* Name */}
              <h1 className="text-3xl md:text-4xl text-white font-bold mt-2 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl text-imperium-gold font-bold">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="text-xl text-white/40 line-through">
                    ${Number(product.compare_at_price).toFixed(2)}
                  </span>
                )}
                {isLowStock && (
                  <span className="text-xs text-orange-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Only {product.stock_quantity} left
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= 4 ? "text-imperium-gold fill-imperium-gold" : "text-white/20"}`}
                    />
                  ))}
                </div>
                <span className="text-white/40 text-sm">(12 reviews)</span>
              </div>

              {/* Description */}
              <p className="text-white/60 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Long Description */}
              {product.long_description && (
                <p className="text-white/40 text-sm leading-relaxed mb-8 border-l-2 border-imperium-gold/30 pl-4">
                  {product.long_description}
                </p>
              )}

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white font-medium">Size</label>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-imperium-gold text-sm hover:underline"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg font-bold text-sm transition-all ${
                        selectedSize === size
                          ? "bg-imperium-gold text-imperium-bg"
                          : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="text-white font-medium mb-4 block">Color</label>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          selectedColor === color.name
                            ? "border-imperium-gold bg-imperium-gold/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-white text-sm">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <label className="text-white font-medium mb-4 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-white/5 text-white hover:bg-white/10 flex items-center justify-center transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-white font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-white/5 text-white hover:bg-white/10 flex items-center justify-center transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart || !product.in_stock}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold tracking-wider transition-all ${
                    addedToCart
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-imperium-gold text-imperium-bg hover:bg-imperium-gold/90"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart
                    </>
                  ) : !product.in_stock ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.in_stock}
                  className="flex-1 py-4 rounded-xl font-bold tracking-wider border border-imperium-gold/30 text-imperium-gold hover:bg-imperium-gold/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/60 text-sm">
                      <Check className="w-4 h-4 text-imperium-gold" />
                      {feature}
                    </div>
                  ))}
                </div>
              )}

              {/* Product Details */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                {product.material && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Material</span>
                    <span className="text-white">{product.material}</span>
                  </div>
                )}
                {product.care_instructions && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Care</span>
                    <span className="text-white">{product.care_instructions}</span>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-imperium-gold mx-auto mb-2" />
                  <span className="text-white/60 text-xs">Secure Payment</span>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 text-imperium-gold mx-auto mb-2" />
                  <span className="text-white/60 text-xs">Free Shipping</span>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-imperium-gold mx-auto mb-2" />
                  <span className="text-white/60 text-xs">30-Day Returns</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products - Placeholder */}
        <div className="mt-20">
          <h2 className="text-2xl text-white font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATALOG.filter(p => p.id !== product.id).slice(0, 3).map((relatedProduct) => (
              <div 
                key={relatedProduct.id}
                className="glass-card rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => router.push(`/shop/${relatedProduct.slug}`)}
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src={relatedProduct.image_url || "/products/placeholder.jpg"}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium">{relatedProduct.name}</h3>
                  <span className="text-imperium-gold font-bold">${relatedProduct.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-white font-bold">Size Guide</h3>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="text-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-imperium-gold font-bold">Size</th>
                    <th className="text-left py-3 text-imperium-gold font-bold">Chest (in)</th>
                    <th className="text-left py-3 text-imperium-gold font-bold">Length (in)</th>
                    <th className="text-left py-3 text-imperium-gold font-bold">Sleeve (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((size) => (
                    <tr key={size} className="border-b border-white/5">
                      <td className="py-3 font-bold">{size}</td>
                      <td className="py-3 text-white/60">
                        {size === "S" ? "34-36" : size === "M" ? "38-40" : size === "L" ? "42-44" : size === "XL" ? "46-48" : "50-52"}
                      </td>
                      <td className="py-3 text-white/60">
                        {size === "S" ? "26" : size === "M" ? "27" : size === "L" ? "28" : size === "XL" ? "29" : "30"}
                      </td>
                      <td className="py-3 text-white/60">
                        {size === "S" ? "32" : size === "M" ? "33" : size === "L" ? "34" : size === "XL" ? "35" : "36"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-white/40 text-sm mt-4">
                Measurements are in inches. For the best fit, we recommend sizing up if you're between sizes.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
