import ProductsPage from "@/components/product/ProductsPage";

/**
 * app/products/page.js
 * Product listing page with sidebar filters, search, sort, pagination
 */
export const metadata = {
  title: "All Products",
  description: "Browse our complete catalog of premium auto spare parts.",
};
export default function page() {
  return <ProductsPage />;
}
