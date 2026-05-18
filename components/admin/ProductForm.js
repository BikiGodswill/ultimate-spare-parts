"use client";
/**
 * components/admin/ProductForm.js
 * Add / Edit product form.
 * Image upload is non-blocking — if the bucket is missing, shows
 * setup instructions and saves the product without an image.
 */

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPhotograph,
  HiCheck,
  HiExternalLink,
  HiInformationCircle,
} from "react-icons/hi";
import { MdWarning } from "react-icons/md";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/constants";
import { validateProduct, hasErrors } from "@/utils/validators";
import { uploadProductImage } from "@/services/storageService";
import { cn } from "@/utils/helpers";

const EMPTY_FORM = {
  name: "",
  price: "",
  description: "",
  category: "",
  stock: "",
  image_url: "",
  is_featured: false,
};

const UPLOAD_ERRORS = {
  BUCKET_NOT_FOUND: {
    title: "Storage bucket not set up yet",
    body: 'The "product-images" bucket does not exist in your Supabase project.',
  },
  STORAGE_PERMISSION_DENIED: {
    title: "Storage permission denied",
    body: "Your Supabase Storage policies are blocking uploads.",
  },
};

export default function ProductForm({
  product = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = !!product;

  const [form, setForm] = useState(
    isEdit
      ? {
          name: product.name || "",
          price: product.price || "",
          description: product.description || "",
          category: product.category || "",
          stock: product.stock ?? "",
          image_url: product.image_url || "",
          is_featured: product.is_featured || false,
        }
      : EMPTY_FORM,
  );

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [useUrl, setUseUrl] = useState(false);
  const fileInputRef = useRef(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setImageFile(null);
    setUploadError(null);
    setImagePreview(form.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Upload file if selected; fall back gracefully on bucket error
  const tryUpload = async () => {
    if (!imageFile) return form.image_url || null;
    setUploading(true);
    setUploadError(null);
    try {
      const { publicUrl } = await uploadProductImage(imageFile);
      setUploading(false);
      return publicUrl;
    } catch (err) {
      setUploading(false);
      const known = UPLOAD_ERRORS[err.message];
      if (known) {
        setUploadError(known);
        toast.error("Image not uploaded — product saved without image.");
      } else {
        toast.error("Image upload failed: " + err.message);
      }
      return form.image_url || null; // non-blocking fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProduct(form);
    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }
    const image_url = await tryUpload();
    await onSubmit({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      image_url,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-auto max-h-[80vh]">
      {/* Image section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-steel-700 dark:text-steel-300">
          Product Image
        </label>

        {/* Upload / URL toggle */}
        <div className="flex rounded-lg overflow-hidden border border-steel-200 dark:border-steel-700 w-fit text-sm">
          {[
            { key: false, label: "⬆️ Upload File" },
            { key: true, label: "🔗 Paste URL" },
          ].map(({ key, label }) => (
            <button
              key={String(key)}
              type="button"
              onClick={() => {
                setUseUrl(key);
                setUploadError(null);
              }}
              className={cn(
                "px-4 py-2 font-medium transition-colors",
                useUrl === key
                  ? "bg-brand-500 text-white"
                  : "bg-white dark:bg-steel-900 text-steel-600 dark:text-steel-400 hover:bg-steel-50 dark:hover:bg-steel-800",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* File upload drop zone */}
        {!useUrl && (
          <div className="space-y-2">
            <div
              onClick={() => !imageFile && fileInputRef.current?.click()}
              className={cn(
                "relative w-full h-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors",
                imageFile
                  ? "border-brand-400 cursor-default"
                  : "border-steel-300 dark:border-steel-700 hover:border-brand-400 cursor-pointer",
              )}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-xl"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-white text-steel-900 rounded-lg text-xs font-semibold"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-steel-100 dark:bg-steel-800 flex items-center justify-center">
                    <HiPhotograph size={26} className="text-steel-400" />
                  </div>
                  <p className="text-sm font-medium text-steel-600 dark:text-steel-400">
                    Click to upload
                  </p>
                  <p className="text-xs text-steel-400">
                    JPG, PNG, WebP — max 5 MB
                  </p>
                </>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                  <span className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {imageFile && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <HiCheck size={13} /> {imageFile.name} (
                {(imageFile.size / 1024).toFixed(0)} KB) ready
              </p>
            )}
          </div>
        )}

        {/* URL input */}
        {useUrl && (
          <div className="space-y-2">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => {
                set("image_url", e.target.value);
                setImagePreview(e.target.value);
              }}
              placeholder="https://example.com/image.jpg"
              className="input-field"
            />
            {imagePreview && (
              <div className="relative h-36 rounded-xl overflow-hidden border border-steel-200 dark:border-steel-700">
                <Image
                  src={imagePreview}
                  alt="preview"
                  fill
                  className="object-cover"
                  sizes="400px"
                  onError={() => setImagePreview(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* Bucket error banner */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4 space-y-3">
                <div className="flex gap-2">
                  <MdWarning
                    size={18}
                    className="text-yellow-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      {uploadError.title}
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                      {uploadError.body}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-bold text-yellow-800 dark:text-yellow-300 uppercase tracking-wide">
                    One-time fix:
                  </p>
                  <ol className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 list-decimal list-inside">
                    <li>
                      Open <strong>Supabase Dashboard</strong> → your project
                    </li>
                    <li>
                      Click <strong>SQL Editor</strong>
                    </li>
                    <li>
                      Paste &amp; run{" "}
                      <code className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">
                        supabase_storage_setup.sql
                      </code>
                    </li>
                    <li>Come back and try uploading again</li>
                  </ol>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-300 hover:underline"
                  >
                    Open Supabase <HiExternalLink size={12} />
                  </a>
                </div>

                <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                  <HiInformationCircle size={13} />
                  Product was saved — edit it later to add the image.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. High-Performance Brake Pads"
          className={cn("input-field", errors.name && "border-red-500")}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0.00"
            className={cn("input-field", errors.price && "border-red-500")}
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
            Stock Qty
          </label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="0"
            className="input-field"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={cn("input-field", errors.category && "border-red-500")}
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the product — specs, compatibility, features…"
          className={cn(
            "input-field resize-none",
            errors.description && "border-red-500",
          )}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-red-500 text-xs">{errors.description}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-steel-400">
            {form.description.length}/2000
          </p>
        </div>
      </div>

      {/* Featured toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => set("is_featured", e.target.checked)}
            className="sr-only"
          />
          <div
            className={cn(
              "w-11 h-6 rounded-full transition-colors duration-200",
              form.is_featured
                ? "bg-brand-500"
                : "bg-steel-300 dark:bg-steel-600",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                form.is_featured ? "translate-x-5" : "translate-x-0",
              )}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-steel-700 dark:text-steel-300">
          Feature on homepage
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading || uploading} fullWidth>
          {isEdit ? "Update Product" : "Add Product"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-shrink-0"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
