"use client";
/**
 * app/page.js
 * Homepage — Hero, Stats, Categories, Featured Products, CTA
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HiArrowRight,
  HiShieldCheck,
  HiTruck,
  HiRefresh,
  HiStar,
} from "react-icons/hi";
import { GiGears, GiCarWheel, GiSuspensionBridge } from "react-icons/gi";
import { MdElectricBolt } from "react-icons/md";
import { TbEngine } from "react-icons/tb";
import ProductGrid from "@/components/product/ProductGrid";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, {
  itemVariants,
} from "@/components/animations/StaggerContainer";
import { getHomepageProducts } from "@/controllers/productController";
import { CATEGORIES } from "@/lib/constants";

// ─── Icon map for categories ──────────────────────────────────
const CATEGORY_ICONS = {
  engine: <TbEngine size={28} />,
  brakes: <GiCarWheel size={28} />,
  suspension: <GiSuspensionBridge size={28} />,
  electrical: <MdElectricBolt size={28} />,
  body: <GiGears size={28} />,
  filters: <GiGears size={28} />,
  exhaust: <GiGears size={28} />,
  transmission: <GiGears size={28} />,
};

const TRUST_STATS = [
  { value: "50K+", label: "Parts In Stock", icon: <GiGears size={22} /> },
  {
    value: "99.2%",
    label: "Customer Satisfaction",
    icon: <HiStar size={22} />,
  },
  { value: "2–5d", label: "Avg. Delivery", icon: <HiTruck size={22} /> },
  { value: "30 days", label: "Free Returns", icon: <HiRefresh size={22} /> },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomepageProducts()
      .then(({ featured, latest }) => {
        setFeatured(featured);
        setLatest(latest);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center bg-steel-950 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-60" />

        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-600/8 rounded-full blur-3xl" />

        {/* Rotating gear decorations */}
        <div className="absolute right-10 top-20 opacity-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <GiGears size={200} className="text-brand-500" />
          </motion.div>
        </div>
        <div className="absolute left-5 bottom-10 opacity-5">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <GiGears size={140} className="text-brand-400" />
          </motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-sm font-heading font-semibold tracking-widest uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                Trusted by 50,000+ Mechanics
              </span>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6">
                Premium Auto
                <span className="block">
                  <span className="gradient-text">Spare Parts</span>
                </span>
                <span className="text-steel-400 text-4xl sm:text-5xl lg:text-6xl">
                  Delivered Fast
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-steel-400 text-lg sm:text-xl max-w-xl leading-relaxed mb-8">
                From engine overhauls to brake replacements — find OEM &amp;
                aftermarket parts for every make and model. Quality guaranteed,
                competitive pricing.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-brand-500 hover:bg-brand-600 text-white font-heading font-bold text-base rounded-xl transition-all duration-200 shadow-glow-orange hover:shadow-glow-orange tracking-wide"
                >
                  Shop All Parts
                  <HiArrowRight size={18} />
                </Link>
                <Link
                  href="/products?is_featured=true"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-brand-400 font-heading font-bold text-base rounded-xl transition-all duration-200 tracking-wide"
                >
                  Featured Deals
                </Link>
              </div>
            </FadeIn>

            {/* Trust badges row */}
            <FadeIn delay={0.5}>
              <div className="flex flex-wrap gap-5 mt-10">
                {[
                  { icon: <HiShieldCheck size={16} />, text: "OEM Certified" },
                  { icon: <HiTruck size={16} />, text: "Free Shipping $75+" },
                  { icon: <HiRefresh size={16} />, text: "30-Day Returns" },
                ].map((b) => (
                  <div
                    key={b.text}
                    className="flex items-center gap-2 text-steel-400 text-sm"
                  >
                    <span className="text-brand-500">{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="bg-brand-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-brand-400">
            {TRUST_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-6 py-4"
              >
                <div className="flex justify-center mb-2 text-white/80">
                  {stat.icon}
                </div>
                <div className="font-heading font-bold text-3xl text-white">
                  {stat.value}
                </div>
                <div className="text-brand-100 text-sm mt-0.5">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-20 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-brand-500 text-sm font-heading font-semibold uppercase tracking-widest mb-2">
                  Browse by
                </p>
                <h2 className="section-title text-steel-900 dark:text-steel-100">
                  Category
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-1.5 text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors"
              >
                View all <HiArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.id} variants={itemVariants}>
                <Link
                  href={`/products?category=${cat.id}`}
                  className="group block"
                >
                  <div className="card p-5 flex flex-col items-center text-center gap-3 hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-300 hover:shadow-glow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                      {CATEGORY_ICONS[cat.id]}
                    </div>
                    <span className="font-heading font-semibold text-sm text-steel-800 dark:text-steel-200 tracking-wide group-hover:text-brand-500 transition-colors">
                      {cat.label}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────── */}
      {(featured.length > 0 || loading) && (
        <section className="py-20 bg-[var(--bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-brand-500 text-sm font-heading font-semibold uppercase tracking-widest mb-2">
                    Hand-picked
                  </p>
                  <h2 className="section-title text-steel-900 dark:text-steel-100">
                    Featured Parts
                  </h2>
                </div>
                <Link
                  href="/products?featured=true"
                  className="hidden sm:flex items-center gap-1.5 text-brand-500 hover:text-brand-600 text-sm font-medium"
                >
                  See all <HiArrowRight size={16} />
                </Link>
              </div>
            </FadeIn>
            <ProductGrid products={featured} loading={loading} columns={4} />
          </div>
        </section>
      )}

      {/* ── LATEST PRODUCTS ──────────────────────────────────── */}
      <section className="py-20 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-brand-500 text-sm font-heading font-semibold uppercase tracking-widest mb-2">
                  Just arrived
                </p>
                <h2 className="section-title text-steel-900 dark:text-steel-100">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-1.5 text-brand-500 hover:text-brand-600 text-sm font-medium"
              >
                View all <HiArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>
          <ProductGrid products={latest} loading={loading} columns={4} />
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-24 bg-steel-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-4">
              Can&#39;t Find the Part You Need?
            </h2>
            <p className="text-steel-400 text-lg mb-8 max-w-xl mx-auto">
              Our parts specialists are standing by. Contact us and we&#39;ll
              source any component for your vehicle.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="mailto:support@ultimatesparepartss.com"
                className="inline-flex items-center gap-2 px-7 py-4 bg-brand-500 hover:bg-brand-600 text-white font-heading font-bold rounded-xl transition-all"
              >
                Contact Us <HiArrowRight size={18} />
              </a>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-4 border border-steel-700 hover:border-brand-500 text-steel-300 hover:text-white font-heading font-bold rounded-xl transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
