/**
 * services/storageService.js
 * Supabase Storage upload/delete helpers
 */

import { getSupabaseBrowserClient, STORAGE_BUCKET } from '@/lib/supabase'

// ─── Upload image to Supabase Storage ────────────────────────
export async function uploadProductImage(file) {
  const supabase = getSupabaseBrowserClient()

  if (!file) throw new Error('No file provided')
  if (file.size > 5 * 1024 * 1024) throw new Error('File must be under 5MB')
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed')

  const ext = file.name.split('.').pop().toLowerCase()
  const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  }
}

// ─── Delete image from Supabase Storage ──────────────────────
export async function deleteProductImage(path) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  if (error) throw error
  return true
}

// ─── Get public URL for a storage path ───────────────────────
export function getImagePublicUrl(path) {
  const supabase = getSupabaseBrowserClient()
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data?.publicUrl || ''
}
