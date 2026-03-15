"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Lock, CreditCard, Truck, ShieldCheck,
  AlertCircle, Check, X, Loader2
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

const SHIPPING_OPTIONS = [
  { id: "standard", name: "Standard Shipping", price: 0, days: "5-7 business days" },
  { id: "express", name: "Express Shipping", price: 15, days: "2-3 business days" },
  { id: "overnight", name: "Overnight Shipping", price: 30, days: "Next business day" },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, total, clearCart } = useCart();
  
  const [step, setStep] = useState<"shipping" | "payment" | "success">("shipping");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const shipping = SHIPPING_OPTIONS.find(s => s.id === shippingMethod) || SHIPPING_OPTIONS[0];
  const shippingCost = total >= 100 ? 0 : shipping.price;
  const discount = promoDiscount;
  const taxRate = 0.08;
  const tax = Math.round((total - discount) * taxRate) / 100;
  const grandTotal = total - discount + shippingCost + tax;

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setStep("success");
      clearCart();
    }
  }, [searchParams, clearCart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    const required = ["email", "firstName", "lastName", "address", "city", "state", "zip"];
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').trim()}`);
        return false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    setError(null);
    if (validateShipping()) {
      setStep("payment");
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "IMPERIUM20") {
      setPromoDiscount(20);
      setPromoApplied(true);
    } else {
      setError("Invalid promo code");
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: { ...formData, shippingMethod },
          discount,
          email: formData.email,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Failed to process checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-3 bg-imperium-gold text-imperium-bg font-bold rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
        <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-400" />
          </motion.div>
          <h1 className="text-3xl text-white font-bold mb-4">Order Confirmed!</h1>
          <p className="text-white/60 mb-2">
            Thank you for your order. We've sent a confirmation email to {formData.email || "your email"}.
          </p>
          <p className="text-white/40 text-sm mb-8">
            Order #IMP-{Date.now().toString(36).toUpperCase()}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/shop")}
              className="px-6 py-3 bg-imperium-gold text-imperium-bg font-bold rounded-lg"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push("/account/orders")}
              className="px-6 py-3 border border-imperium-gold/30 text-imperium-gold font-bold rounded-lg"
            >
              View Orders
            </button>
          </div>
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
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Form */}
          <div className="lg:w-3/5">
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step === "shipping" ? "text-imperium-gold" : step === "payment" ? "text-green-400" : "text-white/40"}`}>
                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold">
                  {step === "payment" ? <Check className="w-4 h-4" /> : "1"}
                </span>
                <span className="text-sm font-medium">Shipping</span>
              </div>
              <div className="flex-1 h-px bg-white/10" />
              <div className={`flex items-center gap-2 ${step === "payment" ? "text-imperium-gold" : "text-white/40"}`}>
                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="text-sm font-medium">Payment</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Shipping Form */}
            {step === "shipping" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl text-white font-bold mb-6">Shipping Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-imperium-gold focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-imperium-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-imperium-gold focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-imperium-gold focus:outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-imperium-gold focus:outline-none"
                      placeholder="123 Main St"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-imperium-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-imperium-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">ZIP</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-imperium-gold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <h3 className="text-lg text-white font-bold mt-8 mb-4">Shipping Method</h3>
                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                        shippingMethod === option.id
                          ? "border-imperium-gold bg-imperium-gold/5"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={shippingMethod === option.id}
                          onChange={() => setShippingMethod(option.id)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          shippingMethod === option.id ? "border-imperium-gold" : "border-white/30"
                        }`}>
                          {shippingMethod === option.id && <div className="w-2 h-2 rounded-full bg-imperium-gold" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{option.name}</p>
                          <p className="text-white/40 text-sm">{option.days}</p>
                        </div>
                      </div>
                      <span className="text-imperium-gold font-bold">
                        {option.price === 0 ? "FREE" : `$${option.price}`}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleContinueToPayment}
                  className="w-full mt-8 py-4 bg-imperium-gold text-imperium-bg font-bold rounded-lg hover:bg-imperium-gold/90 transition-colors"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* Payment Form */}
            {step === "payment" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl text-white font-bold">Payment</h2>
                  <button
                    onClick={() => setStep("shipping")}
                    className="text-imperium-gold text-sm hover:underline"
                  >
                    Edit Shipping
                  </button>
                </div>

                {/* Shipping Summary */}
                <div className="p-4 bg-white/5 rounded-lg mb-6">
                  <p className="text-white/60 text-sm">Shipping to</p>
                  <p className="text-white">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zip}
                  </p>
                </div>

                {/* Card Input Placeholder - Stripe would go here */}
                <div className="p-6 border border-white/10 rounded-lg bg-white/5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-imperium-gold" />
                      <span className="text-white font-medium">Credit Card</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-white/10 rounded" />
                      <div className="w-8 h-5 bg-white/10 rounded" />
                      <div className="w-8 h-5 bg-white/10 rounded" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card number"
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 text-white/40 text-sm">
                  <Lock className="w-4 h-4" />
                  Your payment is secure and encrypted
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-4 bg-imperium-gold text-imperium-bg font-bold rounded-lg hover:bg-imperium-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${grandTotal.toFixed(2)}`
                  )}
                </button>

                <button
                  onClick={() => setStep("shipping")}
                  className="w-full mt-4 py-3 text-white/60 hover:text-white transition-colors"
                >
                  Back to Shipping
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-2/5">
            <div className="bg-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg text-white font-bold mb-4">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      {item.size && <p className="text-white/40 text-xs">Size: {item.size}</p>}
                      {item.color && <p className="text-white/40 text-xs">Color: {item.color}</p>}
                      <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm placeholder-white/30"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied}
                    className="px-4 py-2 border border-imperium-gold/30 text-imperium-gold text-sm font-bold rounded-lg hover:bg-imperium-gold/10 disabled:opacity-50"
                  >
                    {promoApplied ? "Applied" : "Apply"}
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Promo applied!
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-imperium-gold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center gap-4 text-white/30">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs">Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span className="text-xs">Fast Ship</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
