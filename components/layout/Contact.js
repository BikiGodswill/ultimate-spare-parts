"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiMail, HiPhone, HiLocationMarker, HiClock } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Link from "next/link";

const CONTACT_DETAILS = [
  {
    icon: <HiMail size={20} />,
    label: "Email",
    value: "support@ultimate.com",
    href: "mailto:bikigodswill25@gmail.com",
  },
  {
    icon: <HiPhone size={20} />,
    label: "Phone",
    value: "+1 (800) 555-0123",
    href: "tel:+237675229819",
  },
  {
    icon: <HiLocationMarker size={20} />,
    label: "Address",
    value: "4725 Auto Park Drive, Detroit, MI",
    href: "https://maps.google.com/?q=4725+Auto+Park+Drive+Detroit+MI",
  },
  {
    icon: <HiClock size={20} />,
    label: "Hours",
    value: "Mon–Fri 8am–6pm",
    href: "#hours",
  },
];

const initialForm = {
  name: "",
  email: "",
  orderId: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to send your message.");
      }

      setSuccess("Message sent successfully. We’ll get back to you soon.");
      setFormData(initialForm);
      setStatus("success");
    } catch (err) {
      setError(err.message || "An error occurred while sending your message.");
      setStatus("error");
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-steel-200 bg-white dark:bg-steel-950 dark:border-steel-800"
      >
        <div className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              Contact Us
            </p>
            <h1 className="mt-6 text-4xl sm:text-5xl font-heading font-bold tracking-tight">
              We’re here to help with your order, warranty, or vehicle needs.
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-slate-600 dark:text-slate-300">
              Reach out anytime and our experts will respond quickly. Whether you need part recommendations, order support, or warranty details, we make every interaction fast and friendly.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/faq"
                className="rounded-2xl border border-steel-200 bg-steel-50 px-5 py-4 text-center text-sm font-semibold text-steel-800 transition hover:border-brand-500 hover:bg-brand-50 dark:border-steel-800 dark:bg-steel-900 dark:text-slate-200 dark:hover:bg-steel-800"
              >
                Visit our FAQ
              </Link>
              <a
                href="mailto:support@ultimate.com"
                className="rounded-2xl border border-brand-500 bg-brand-500 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Email support
              </a>
              <a
                href="tel:+18005550123"
                className="rounded-2xl border border-steel-200 bg-transparent px-5 py-4 text-center text-sm font-semibold text-steel-800 transition hover:border-brand-500 hover:bg-brand-50 dark:border-steel-800 dark:text-slate-200 dark:hover:bg-steel-800"
              >
                Call us
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-[2rem] border border-steel-200 bg-white p-8 shadow-card dark:border-steel-800 dark:bg-steel-900"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold">Send us a message</h2>
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400 leading-7">
                Fill out the form below and our team will reply within one business day. For urgent order issues, please call us directly.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="input-field"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <span>Order ID (optional)</span>
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    placeholder="123456"
                    className="input-field"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <span>Subject</span>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What can we help with?"
                    className="input-field"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <span>Message</span>
                <textarea
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your request"
                  className="input-field min-h-[180px] resize-none"
                />
              </label>

              {status === "error" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              {status === "success" && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  We’ll respond within one business day.
                </p>
                <Button type="submit" variant="primary" size="lg" disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            <div className="rounded-[2rem] border border-steel-200 bg-white p-6 shadow-card dark:border-steel-800 dark:bg-steel-900">
              <h3 className="text-2xl font-heading font-bold">Contact details</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400 leading-7">
                Need help right away? Choose one of the fastest ways to reach our support team.
              </p>
              <div className="mt-6 space-y-4">
                {CONTACT_DETAILS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-start gap-4 rounded-3xl border border-steel-200 bg-steel-50 p-4 transition hover:border-brand-500 hover:bg-brand-50 dark:border-steel-800 dark:bg-steel-900 dark:hover:bg-steel-800"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-white">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-brand-500/20 bg-brand-50 p-6 text-slate-700 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-slate-200">
              <h4 className="text-xl font-heading font-bold">Why contact us?</h4>
              <ul className="mt-4 space-y-3 text-sm leading-7">
                <li>Fast support for parts recommendations and compatibility questions.</li>
                <li>Order tracking and warranty assistance.</li>
                <li>Dedicated help for business and fleet buyers.</li>
              </ul>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  );
}
