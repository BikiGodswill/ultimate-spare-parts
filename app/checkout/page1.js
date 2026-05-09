"use client";
/**
 * app/checkout/page.js
 * Checkout page — shipping form + order summary + Stripe redirect
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiLockClosed } from "react-icons/hi";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import PageTransition from "@/components/animations/PageTransition";
import ShippingForm from "@/components/checkout/ShippingForm";
import CartSummary from "@/components/cart/CartSummary";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { validateShipping, hasErrors } from "@/utils/validators";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const EMPTY_SHIPPING = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartCount } = useCart();
  const [shippingData, setShippingData] = useState(EMPTY_SHIPPING);
  const [shippingOption, setShippingOption] = useState("standard");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if cart is empty
  if (cartCount === 0) {
    router.replace("/cart");
    return null;
  }

  const handleFieldChange = (name, value) => {
    setShippingData((d) => ({ ...d, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  const handleCheckout = async () => {
    const errs = validateShipping(shippingData);
    if (hasErrors(errs)) {
      setErrors(errs);
      toast.error("Please fill the required fields before continuing");
      return;
    }

    setLoading(true);
    try {
      // Get auth token (optional)
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image_url: i.image_url,
          })),
          shippingData,
          shippingOption,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Checkout failed");
      }

      const { url } = await res.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      toast.error(err.message || "Failed to initiate checkout");
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100">
            Checkout
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-steel-400">
            <HiLockClosed size={14} />
            <span>Secure checkout</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {["Cart", "Shipping", "Payment"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 text-sm font-heading font-semibold ${
                  i === 1
                    ? "text-brand-500"
                    : i < 1
                      ? "text-green-500"
                      : "text-steel-400"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 1
                      ? "bg-brand-500 text-white"
                      : i < 1
                        ? "bg-green-500 text-white"
                        : "bg-steel-200 dark:bg-steel-700 text-steel-500"
                  }`}
                >
                  {i < 1 ? "✓" : i + 1}
                </span>
                {step}
              </div>
              {i < 2 && (
                <span className="text-steel-300 dark:text-steel-600">—</span>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <ShippingForm
                data={shippingData}
                errors={errors}
                onChange={handleFieldChange}
                cartTotal={items.reduce((s, i) => s + i.price * i.quantity, 0)}
                selectedShipping={shippingOption}
                onShippingChange={setShippingOption}
              />

              <div className="mt-8 pt-6 border-t border-steel-200 dark:border-steel-800">
                <Button
                  onClick={handleCheckout}
                  loading={loading}
                  fullWidth
                  size="lg"
                  icon={<HiLockClosed size={16} />}
                >
                  Proceed to Payment
                </Button>
                <p className="text-xs text-steel-400 text-center mt-3">
                  You&#39;ll be redirected to Stripe&#39;s secure payment page
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary shippingOption={shippingOption} isCheckout />

            {/* Cart Items Preview */}
            <div className="card p-5 mt-4 space-y-3">
              <h3 className="font-heading font-semibold text-sm text-steel-900 dark:text-steel-100">
                Order Items ({cartCount})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-steel-100 dark:bg-steel-800 overflow-hidden relative flex-shrink-0">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="flex-1 truncate text-steel-700 dark:text-steel-300">
                      {item.name}
                    </span>
                    <span className="text-steel-500">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
