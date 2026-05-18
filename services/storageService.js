/**
 * services/storageService.js
 * Supabase Storage helpers with clear error messages for missing bucket.
 */

import { getSupabaseBrowserClient, STORAGE_BUCKET } from "@/lib/supabase";

// ─── Check if the bucket exists ───────────────────────────────
export async function checkBucketExists() {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);
    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}

// ─── Upload image to Supabase Storage ─────────────────────────
export async function uploadProductImage(file) {
  const supabase = getSupabaseBrowserClient();

  if (!file) throw new Error("No file provided");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5MB");
  if (!file.type.startsWith("image/"))
    throw new Error("Only image files are allowed");

  const ext = file.name.split(".").pop().toLowerCase();
  const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    // Give a clear human-readable message for the most common error
    if (
      error.message?.toLowerCase().includes("bucket") ||
      error.message?.toLowerCase().includes("not found") ||
      error.statusCode === 404 ||
      error.error === "Bucket not found"
    ) {
      throw new Error("BUCKET_NOT_FOUND");
    }
    if (
      error.message?.toLowerCase().includes("policy") ||
      error.statusCode === 403
    ) {
      throw new Error("STORAGE_PERMISSION_DENIED");
    }
    throw new Error(error.message || "Upload failed");
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);
  return { path: data.path, publicUrl: urlData.publicUrl };
}

// ─── Delete image ──────────────────────────────────────────────
export async function deleteProductImage(path) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) throw error;
  return true;
}
