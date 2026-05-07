"use client";
/**
 * app/checkout/success/page.js
 * Order success page after Stripe checkout
 */

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HiCheckCircle, HiArrowRight } from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/formatters";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    // Clear cart on success
    clearCart();

    // Optionally verify the session (for display purposes)
    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setOrderInfo(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full text-center"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
        >
          <HiCheckCircle size={52} className="text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="font-heading font-bold text-4xl text-steel-900 dark:text-steel-100 mb-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-steel-500 text-lg mb-2">
            Thank you for your purchase.
          </p>

          {orderInfo?.customerEmail && (
            <p className="text-steel-400 text-sm mb-6">
              A confirmation email has been sent to{" "}
              <strong>{orderInfo.customerEmail}</strong>
            </p>
          )}

          {orderInfo?.amountTotal && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400 font-heading font-bold text-lg mb-8">
              Total paid: {formatPrice(orderInfo.amountTotal)}
            </div>
          )}

          {/* What's next */}
          <div className="card p-6 text-left mb-8">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-steel-500 mb-4">
              What happens next?
            </h3>
            <ol className="space-y-3">
              {[
                "Order is being processed and verified",
                "Items will be packed and dispatched within 24 hours",
                "You'll receive tracking info via email",
                "Estimated delivery: 2–7 business days",
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-steel-600 dark:text-steel-400"
                >
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders">
              <button className="btn-primary">View My Orders</button>
            </Link>
            <Link href="/products">
              <button className="btn-secondary flex items-center gap-2">
                Continue Shopping <HiArrowRight size={16} />
              </button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
