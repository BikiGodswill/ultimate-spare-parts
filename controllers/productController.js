/**
 * controllers/productController.js
 * Business logic for product operations
 */

import {
  fetchProducts,
  fetchProductById,
  fetchFeaturedProducts,
  fetchRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAdminProducts,
} from "@/models/Product";
import { getSupabaseServerClient, STORAGE_BUCKET } from "@/lib/supabase";

// ─── Get products with filter/sort/pagination ─────────────────
export async function getFilteredProducts(searchParams) {
  const {
    category = "",
    search = "",
    minPrice = 0,
    maxPrice = 999999,
    sortBy: rawSort = "created_at-desc",
    page = 1,
    limit = 12,
  } = searchParams;

  const [sortBy, sortOrder] = rawSort.split("-");

  return fetchProducts({
    category: category || null,
    search,
    minPrice: Number(minPrice),
    maxPrice: Number(maxPrice),
    sortBy,
    sortOrder,
    page: Number(page),
    limit: Number(limit),
  });
}

// ─── Get single product detail ────────────────────────────────
export async function getProductDetail(id) {
  const product = await fetchProductById(id);
  if (!product) throw new Error("Product not found");
  return product;
}

// ─── Get homepage data ────────────────────────────────────────
export async function getHomepageProducts() {
  const [featured, latest] = await Promise.all([
    fetchFeaturedProducts(8),
    fetchProducts({ sortBy: "created_at", sortOrder: "desc", limit: 8 }),
  ]);
  return { featured, latest: latest.products };
}

// ─── Admin: create product ────────────────────────────────────
export async function adminCreateProduct(data, userId) {
  const productData = {
    name: data.name.trim(),
    description: data.description.trim(),
    price: parseFloat(data.price),
    category: data.category,
    image_url: data.image_url || null,
    stock: parseInt(data.stock) || 0,
    is_featured: Boolean(data.is_featured),
    created_by: userId,
  };
  return createProduct(productData);
}

// ─── Admin: update product ────────────────────────────────────
export async function adminUpdateProduct(id, data) {
  const updates = {
    name: data.name?.trim(),
    description: data.description?.trim(),
    price: data.price !== undefined ? parseFloat(data.price) : undefined,
    category: data.category,
    image_url: data.image_url,
    stock: data.stock !== undefined ? parseInt(data.stock) : undefined,
    is_featured: data.is_featured,
    updated_at: new Date().toISOString(),
  };

  // Remove undefined keys
  Object.keys(updates).forEach(
    (k) => updates[k] === undefined && delete updates[k],
  );
  return updateProduct(id, updates);
}

// ─── Admin: delete product (+ clean up storage image) ────────
export async function adminDeleteProduct(id) {
  const supabase = getSupabaseServerClient();

  // Fetch product first to get image path
  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  // Delete from DB
  await deleteProduct(id);

  // Try to remove image from storage if it's a Supabase URL
  if (product?.image_url?.includes("supabase")) {
    const segments = product.image_url.split("/");
    const filename = segments[segments.length - 1];
    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([filename]);
    } catch {
      // Non-critical — continue even if image cleanup fails
    }
  }

  return true;
}

// ─── Admin: get all products ──────────────────────────────────
export async function adminGetAllProducts() {
  return fetchAdminProducts();
}

// ─── Get related products ─────────────────────────────────────
export async function getRelatedProducts(productId, category) {
  return fetchRelatedProducts(productId, category, 4);
}
