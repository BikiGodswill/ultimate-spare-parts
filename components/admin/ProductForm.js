"use client";
/**
 * components/admin/ProductForm.js
 * Add / Edit product form for admin panel
 */

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { HiUpload, HiX, HiPhotograph } from "react-icons/hi";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/constants";
import { validateProduct, hasErrors } from "@/utils/validators";
import { getSupabaseBrowserClient, STORAGE_BUCKET } from "@/lib/supabase";
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
  const fileInputRef = useRef(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image_url;

    const supabase = getSupabaseBrowserClient();
    const ext = imageFile.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    setUploading(true);
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, imageFile, { cacheControl: "3600", upsert: false });
    setUploading(false);
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProduct(form);
    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }

    try {
      const image_url = await uploadImage();
      await onSubmit({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        image_url,
      });
    } catch (err) {
      toast.error(err.message || "Failed to save product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-2">
          Product Image
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative w-full h-48 rounded-xl border-2 border-dashed cursor-pointer",
            "flex flex-col items-center justify-center gap-3 transition-colors duration-200",
            imagePreview
              ? "border-brand-400 dark:border-brand-600"
              : "border-steel-300 dark:border-steel-700 hover:border-brand-400 dark:hover:border-brand-600",
          )}
        >
          {imagePreview ? (
            <>
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">
                  Click to change
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-xl bg-steel-100 dark:bg-steel-800 flex items-center justify-center">
                <HiPhotograph size={28} className="text-steel-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-steel-700 dark:text-steel-300">
                  Click to upload image
                </p>
                <p className="text-xs text-steel-400 mt-1">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Or URL */}
        <div className="mt-3">
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => {
              set("image_url", e.target.value);
              setImagePreview(e.target.value);
            }}
            placeholder="Or paste an image URL..."
            className="input-field text-sm"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
          Product Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g., High-Performance Brake Pads"
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
            Price ($) *
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
            Stock Quantity
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
          Category *
        </label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={cn("input-field", errors.category && "border-red-500")}
        >
          <option value="">Select a category...</option>
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
          Description *
        </label>
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the product — specs, compatibility, features..."
          className={cn(
            "input-field resize-none",
            errors.description && "border-red-500",
          )}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description}</p>
        )}
        <p className="text-xs text-steel-400 mt-1">
          {form.description.length}/2000
        </p>
      </div>

      {/* Featured toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
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
          Featured product (shown on homepage)
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
