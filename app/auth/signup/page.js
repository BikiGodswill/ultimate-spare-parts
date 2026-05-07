'use client'
/**
 * app/auth/signup/page.js
 * Account creation page
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi'
import { GiGears } from 'react-icons/gi'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { signUp } from '@/controllers/authController'
import { validateEmail, validatePassword } from '@/utils/validators'

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    const emailErr = validateEmail(form.email)
    if (emailErr) errs.email = emailErr
    const pwErr = validatePassword(form.password)
    if (pwErr) errs.password = pwErr
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'

    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, fullName: form.fullName })
      setSuccess(true)
    } catch (err) {
      toast.error(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center card p-10"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiMail size={32} className="text-green-500" />
          </div>
          <h2 className="font-heading font-bold text-2xl mb-2">Check Your Email</h2>
          <p className="text-steel-500 mb-6">
            We&#39;ve sent a verification email to <strong>{form.email}</strong>.
            Click the link to activate your account.
          </p>
          <Link href="/auth/login">
            <Button fullWidth>Go to Login</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-orange">
            <GiGears size={30} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-steel-900 dark:text-steel-100">
            Create Account
          </h1>
          <p className="text-steel-500 mt-1">Join the Ultimate Spare Parts community</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" size={18} />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="John Doe"
                  className={`input-field pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">Email Address</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" size={18} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`input-field pl-10 pr-11 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel-400">
                  {showPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" size={18} />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Repeat your password"
                  className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-steel-500 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-500 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
