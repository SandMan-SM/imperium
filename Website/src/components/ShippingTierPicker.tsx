"use client";

import { SHIPPING_OPTIONS, usd } from "@/lib/checkout-totals";

/**
 * The shipping tiers a buyer can pick.
 *
 * The list comes from the shared totals module, the same place the server
 * reads the price from, so a tier cannot be offered on screen at a price
 * the server does not charge.
 */
export function ShippingTierPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (methodId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {SHIPPING_OPTIONS.map((option) => (
        <label
          key={option.id}
          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
            value === option.id
              ? "border-imperium-gold bg-imperium-gold/5"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="shipping"
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                value === option.id ? "border-imperium-gold" : "border-white/30"
              }`}
            >
              {value === option.id && <div className="w-2 h-2 rounded-full bg-imperium-gold" />}
            </div>
            <div>
              <p className="text-white font-medium">{option.name}</p>
              <p className="text-white/40 text-sm">{option.days}</p>
            </div>
          </div>
          <span className="text-imperium-gold font-bold">
            {option.price === 0 ? "FREE" : `$${usd(option.price)}`}
          </span>
        </label>
      ))}
    </div>
  );
}
