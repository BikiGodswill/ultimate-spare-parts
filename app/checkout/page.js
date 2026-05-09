"use client";
/**
 * app/checkout/page.js
 * Checkout — collects buyer info & cart, then opens WhatsApp
 * with the full order summary pre-typed in the message.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { HiShoppingCart } from "react-icons/hi";
import toast from "react-hot-toast";
import PageTransition from "@/components/animations/PageTransition";
import ShippingForm from "@/components/checkout/ShippingForm";
import CartSummary from "@/components/cart/CartSummary";
import { useCart } from "@/context/CartContext";
import { validateShipping, hasErrors } from "@/utils/validators";
import { formatPrice } from "@/utils/formatters";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_OPTIONS } from "@/lib/constants";

// ─── Business WhatsApp number (no + or spaces) ────────────────
const WHATSAPP_NUMBER = "237697987229";

// ─── Empty shipping form defaults ────────────────────────────
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
  country: "Cameroon",
};

/**
 * buildWhatsAppMessage()
 * Builds the full order text that will be pre-filled in WhatsApp.
 */
function buildWhatsAppMessage({ shippingData, shippingOption, items }) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : (SHIPPING_OPTIONS.find((s) => s.id === shippingOption)?.price ?? 5.99);

  const tax = (subtotal + shippingCost) * 0.08;
  const total = subtotal + shippingCost + tax;

  const fullName = `${shippingData.firstName} ${shippingData.lastName}`.trim();

  const addressParts = [
    shippingData.address,
    shippingData.address2,
    shippingData.city,
    shippingData.state,
    shippingData.zip,
    shippingData.country,
  ].filter(Boolean);

  const shippingLabel =
    SHIPPING_OPTIONS.find((s) => s.id === shippingOption)?.label ||
    shippingOption;

  // ── Format each cart item ─────────────────────────────────
  const itemLines = items
    .map(
      (item, idx) =>
        `  ${idx + 1}. ${item.name}\n` +
        `     • Qty      : ${item.quantity}\n` +
        `     • Unit Price: ${formatPrice(item.price)}\n` +
        `     • Subtotal : ${formatPrice(item.price * item.quantity)}`,
    )
    .join("\n\n");

  // ── Assemble the full message ─────────────────────────────
  const lines = [
    "🛒 *NEW ORDER — ULTIMATE SPARE PARTS*",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "👤 *CUSTOMER INFORMATION*",
    `  • Full Name : ${fullName || "—"}`,
    `  • Email     : ${shippingData.email || "—"}`,
    `  • Phone     : ${shippingData.phone || "—"}`,
    "",
    "📍 *SHIPPING ADDRESS*",
    `  • Address   : ${addressParts.join(", ") || "—"}`,
    `  • Method    : ${shippingLabel}`,
    "",
    "🔧 *ITEMS REQUESTED*",
    "──────────────────────────",
    itemLines,
    "──────────────────────────",
    "",
    "💰 *ORDER SUMMARY*",
    `  • Subtotal  : ${formatPrice(subtotal)}`,
    `  • Shipping  : ${shippingCost === 0 ? "FREE 🎉" : formatPrice(shippingCost)}`,
    `  • Tax (8%)  : ${formatPrice(tax)}`,
    `  ─────────────────────────`,
    `  • *TOTAL    : ${formatPrice(total)}*`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Please confirm availability and payment details. Thank you! 🙏",
  ];

  return { message: lines.join("\n"), total };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartCount } = useCart();

  const [shippingData, setShippingData] = useState(EMPTY_SHIPPING);
  const [shippingOption, setShippingOption] = useState("standard");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect back to cart if it's empty
  if (cartCount === 0) {
    router.replace("/cart");
    return null;
  }

  // ── Field change handler ──────────────────────────────────
  const handleFieldChange = (name, value) => {
    setShippingData((d) => ({ ...d, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  // ── Main action: validate → build message → open WhatsApp ─
  const handleWhatsAppCheckout = () => {
    // 1. Validate form
    const errs = validateShipping(shippingData);
    if (hasErrors(errs)) {
      setErrors(errs);
      toast.error("Please fill in all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      // 2. Build the pre-filled message
      const { message } = buildWhatsAppMessage({
        shippingData,
        shippingOption,
        items,
      });

      // 3. Construct WhatsApp deep-link
      const encoded = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

      // 4. Show a toast then open WhatsApp
      toast.success("Opening WhatsApp…", {
        icon: "💬",
        style: {
          background: "#075E54",
          color: "#ffffff",
          border: "1px solid #25D366",
          fontWeight: "600",
        },
      });

      setTimeout(() => {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        setLoading(false);
      }, 500);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // ── Derived totals for the sidebar preview ────────────────
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : (SHIPPING_OPTIONS.find((s) => s.id === shippingOption)?.price ?? 5.99);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100">
            Checkout
          </h1>
          <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
            <FaWhatsapp size={17} />
            <span>Order via WhatsApp</span>
          </div>
        </div>

        {/* ── Step indicator ───────────────────────────────── */}
        <div className="flex items-center gap-2 mb-10">
          {["Cart", "Your Details", "WhatsApp"].map((step, i) => (
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
                  {i < 1 ? "✓" : i === 2 ? "💬" : "2"}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
              {i < 2 && (
                <span className="text-steel-300 dark:text-steel-600">—</span>
              )}
            </div>
          ))}
        </div>

        {/* ── Main grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left col — shipping form + CTA */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <ShippingForm
                data={shippingData}
                errors={errors}
                onChange={handleFieldChange}
                cartTotal={subtotal}
                selectedShipping={shippingOption}
                onShippingChange={setShippingOption}
              />

              {/* ── WhatsApp send button ──────────────────── */}
              <div className="mt-8 pt-6 border-t border-steel-200 dark:border-steel-800 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={handleWhatsAppCheckout}
                  disabled={loading}
                  className="
                    w-full flex items-center justify-center gap-3
                    py-4 rounded-xl text-white
                    bg-[#25D366] hover:bg-[#20b858] active:bg-[#1a9e4c]
                    font-heading font-bold text-lg tracking-wide
                    transition-all duration-200
                    shadow-[0_4px_20px_rgba(37,211,102,0.35)]
                    hover:shadow-[0_6px_28px_rgba(37,211,102,0.5)]
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaWhatsapp size={24} />
                  )}
                  {loading ? "Opening WhatsApp…" : "Send Order via WhatsApp"}
                </motion.button>

                {/* How it works */}
                <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 space-y-2">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    💬 How this works
                  </p>
                  <ol className="text-sm text-green-700 dark:text-green-400 space-y-1 list-decimal list-inside">
                    <li>Fill in your contact &amp; shipping details above</li>
                    <li>
                      Click <strong>Send Order via WhatsApp</strong>
                    </li>
                    <li>WhatsApp opens with your full order pre-typed</li>
                    <li>
                      Press <strong>Send</strong> — we confirm stock &amp; share
                      payment info
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Right col — summary + items + contact */}
          <div className="lg:col-span-1 space-y-4">
            {/* Order price summary */}
            <CartSummary shippingOption={shippingOption} isCheckout />

            {/* Cart items preview */}
            <div className="card p-5 space-y-3">
              <h3 className="font-heading font-semibold text-sm text-steel-900 dark:text-steel-100 flex items-center gap-2">
                <HiShoppingCart size={15} className="text-brand-500" />
                Items ({cartCount})
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-steel-100 dark:bg-steel-800 overflow-hidden flex-shrink-0">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-steel-800 dark:text-steel-200 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-steel-400">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-heading font-bold text-brand-500 flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp contact shortcut */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 flex items-center gap-4 hover:border-green-400 dark:hover:border-green-600 transition-colors group block"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FaWhatsapp size={26} className="text-white" />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm text-steel-800 dark:text-steel-200">
                  Questions? Chat with us
                </p>
                <p className="text-[#25D366] text-sm font-medium">
                  +237 697 987 229
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
