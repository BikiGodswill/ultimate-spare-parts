"use client";
/**
 * app/cart/page.js
 * Shopping cart page
 */

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiShoppingCart, HiArrowRight } from "react-icons/hi";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/animations/PageTransition";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { items, clearCart, cartCount } = useCart();

  const handleCheckout = () => router.push("/checkout");

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100">
              Shopping Cart
            </h1>
            {cartCount > 0 && (
              <p className="text-steel-500 mt-1">
                {cartCount} item{cartCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-steel-400 hover:text-red-500 transition-colors"
            >
              Clear cart
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-steel-100 dark:bg-steel-800 flex items-center justify-center mb-6">
              <HiShoppingCart
                size={40}
                className="text-steel-300 dark:text-steel-600"
              />
            </div>
            <h2 className="font-heading font-bold text-2xl text-steel-700 dark:text-steel-300 mb-2">
              Your cart is empty
            </h2>
            <p className="text-steel-400 mb-8 max-w-sm">
              Looks like you haven&#39;t added any parts yet. Browse our catalog
              to find what you need.
            </p>
            <Link href="/products">
              <Button icon={<HiArrowRight size={18} />} iconPosition="right">
                Browse Parts
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Cart Items + Summary */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 mt-4 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <CartSummary onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
