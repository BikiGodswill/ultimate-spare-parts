"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import PageTransition from "../animations/PageTransition";
import { HiFilter, HiSearch, HiX } from "react-icons/hi";
import ProductFilters from "./ProductFilters";
import { AnimatePresence } from "framer-motion";
import ProductGrid from "./ProductGrid";
import { getFilteredProducts } from "@/controllers/productController";
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from "@/lib/constants";
import { debounce } from "@/utils/helpers";

// import { useState, useEffect, useCallback, Suspense } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { HiFilter, HiX, HiSearch } from "react-icons/hi";
// import ProductGrid from "@/components/product/ProductGrid";
// import ProductFilters from "@/components/product/ProductFilters";
// import PageTransition from "@/components/animations/PageTransition";
// import { getFilteredProducts } from "@/controllers/productController";
// import { debounce } from "@/utils/helpers";
// import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from "@/lib/constants";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    minPrice: 0,
    maxPrice: 999999,
    priceRange: null,
    sortBy: searchParams.get("sortBy") || "created_at-desc",
    minRating: 0,
    page: 1,
  });

  const loadProducts = useCallback(async (f) => {
    setLoading(true);
    try {
      const result = await getFilteredProducts({
        category: f.category,
        search: f.search,
        minPrice: f.minPrice,
        maxPrice: f.maxPrice,
        sortBy: f.sortBy,
        page: f.page,
        limit: PRODUCTS_PER_PAGE,
      });
      setProducts(result.products);
      setTotal(result.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(filters);
  }, [filters, loadProducts]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((val) => setFilters((f) => ({ ...f, search: val, page: 1 })), 400),
    [],
  );

  const handleSearchChange = (val) => {
    setSearchInput(val);
    debouncedSearch(val);
  };

  const handleFilterChange = (updates) => {
    setFilters((f) => ({ ...f, ...updates, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: "",
      search: "",
      minPrice: 0,
      maxPrice: 999999,
      priceRange: null,
      sortBy: "created_at-desc",
      minRating: 0,
      page: 1,
    });
    setSearchInput("");
  };

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const hasActiveFilters =
    filters.category ||
    filters.search ||
    filters.priceRange ||
    filters.minRating;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100 mb-2">
            All Spare Parts
          </h1>
          <p className="text-steel-500">
            {loading ? "Loading..." : `${total} products found`}
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <HiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400"
              size={18}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search parts, brands, part numbers..."
              className="input-field pl-10"
            />
            {searchInput && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-600"
              >
                <HiX size={16} />
              </button>
            )}
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            className="input-field sm:w-52"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden flex items-center gap-2 px-4 py-3 rounded-lg bg-steel-100 dark:bg-steel-800 font-heading font-semibold text-sm"
          >
            <HiFilter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </button>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium">
                {filters.category}
                <button onClick={() => handleFilterChange({ category: "" })}>
                  <HiX size={12} />
                </button>
              </span>
            )}
            {filters.priceRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium">
                {filters.priceRange}
                <button
                  onClick={() =>
                    handleFilterChange({
                      priceRange: null,
                      minPrice: 0,
                      maxPrice: 999999,
                    })
                  }
                >
                  <HiX size={12} />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-steel-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden sm:block w-64 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <ProductFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {filtersOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                  onClick={() => setFiltersOpen(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.25 }}
                  className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-steel-950 z-50 p-6 overflow-y-auto sm:hidden"
                >
                  <div className="flex justify-between mb-5">
                    <span className="font-heading font-bold text-lg">
                      Filters
                    </span>
                    <button onClick={() => setFiltersOpen(false)}>
                      <HiX size={22} />
                    </button>
                  </div>
                  <ProductFilters
                    filters={filters}
                    onChange={(u) => {
                      handleFilterChange(u);
                      setFiltersOpen(false);
                    }}
                    onReset={() => {
                      handleResetFilters();
                      setFiltersOpen(false);
                    }}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} loading={loading} columns={3} />

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 rounded-lg bg-steel-100 dark:bg-steel-800 disabled:opacity-40 hover:bg-steel-200 dark:hover:bg-steel-700 transition-colors text-sm font-medium"
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setFilters((f) => ({ ...f, page }))}
                      className={`w-10 h-10 rounded-lg text-sm font-heading font-bold transition-colors ${
                        filters.page === page
                          ? "bg-brand-500 text-white"
                          : "bg-steel-100 dark:bg-steel-800 hover:bg-steel-200 dark:hover:bg-steel-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      page: Math.min(totalPages, f.page + 1),
                    }))
                  }
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 rounded-lg bg-steel-100 dark:bg-steel-800 disabled:opacity-40 hover:bg-steel-200 dark:hover:bg-steel-700 transition-colors text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
