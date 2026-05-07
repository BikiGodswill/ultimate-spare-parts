"use client";
/**
 * app/auth/login/page.js
 * Sign in page with email/password
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import { GiGears } from "react-icons/gi";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { signIn } from "@/controllers/authController";
import { validateEmail } from "@/utils/validators";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (validateEmail(form.email)) errs.email = validateEmail(form.email);
    if (!form.password) errs.password = "Password is required";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: form.email, password: form.password });
      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-orange">
            <GiGears size={30} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-steel-900 dark:text-steel-100">
            Welcome Back
          </h1>
          <p className="text-steel-500 mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <HiMail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400"
                  size={18}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? "border-red-500" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-steel-700 dark:text-steel-300">
                  Password
                </label>
                <Link
                  href="/auth/forgot"
                  className="text-xs text-brand-500 hover:text-brand-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <HiLockClosed
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400"
                  size={18}
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  className={`input-field pl-10 pr-11 ${errors.password ? "border-red-500" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-600"
                >
                  {showPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-steel-200 dark:border-steel-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-steel-900 px-3 text-steel-400">
                Don&#39;t have an account?
              </span>
            </div>
          </div>

          <Link href="/auth/signup">
            <Button variant="secondary" fullWidth>
              Create Account
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
