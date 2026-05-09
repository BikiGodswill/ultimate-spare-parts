"use client";
/**
 * components/ui/ErrorBoundary.js
 * Catches render errors so the whole page never goes completely blank.
 */

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f0f0f",
            fontFamily: "sans-serif",
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              background: "#1a1a1a",
              border: "1px solid #f97316",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            {/* Gear icon */}
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>⚙️</div>

            <h1
              style={{
                color: "#f97316",
                fontSize: "22px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                color: "#a3a3a3",
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "24px",
              }}
            >
              The app encountered an error. This is usually caused by missing
              environment variables in your Vercel project settings.
            </p>

            {/* Most common fix */}
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid #2a2a2a",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "left",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  color: "#f97316",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "10px",
                }}
              >
                ✅ Fix: Add these to Vercel → Settings → Environment Variables
              </p>
              {[
                "NEXT_PUBLIC_SUPABASE_URL",
                "NEXT_PUBLIC_SUPABASE_ANON_KEY",
                "SUPABASE_SERVICE_ROLE_KEY",
                "NEXT_PUBLIC_APP_URL",
                "NEXT_PUBLIC_ADMIN_EMAIL",
              ].map((v) => (
                <div
                  key={v}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#e5e5e5",
                    padding: "4px 0",
                    borderBottom: "1px solid #2a2a2a",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>

            {/* Error detail */}
            {this.state.error?.message && (
              <details style={{ marginBottom: "20px", textAlign: "left" }}>
                <summary
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginBottom: "6px",
                  }}
                >
                  Error details
                </summary>
                <code
                  style={{
                    display: "block",
                    background: "#0f0f0f",
                    color: "#ef4444",
                    fontSize: "11px",
                    padding: "10px",
                    borderRadius: "6px",
                    wordBreak: "break-all",
                    lineHeight: "1.5",
                  }}
                >
                  {this.state.error.message}
                </code>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
