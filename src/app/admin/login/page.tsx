"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-cormorant text-[32px] font-semibold text-white tracking-wide">
            CRESTYVE
          </h1>
          <p className="font-inter text-[13px] text-white/40 mt-2">
            Admin Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 md:p-10">
          <h2 className="font-cormorant text-[24px] text-dark mb-1">
            Welcome back
          </h2>
          <p className="font-inter text-[13px] text-muted mb-8">
            Sign in to manage your website
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 mb-6 font-inter text-[13px]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-manrope text-[11px] tracking-wide text-dark mb-2 block font-medium">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-transparent font-inter text-[14px] focus:outline-none focus:border-dark transition-colors"
                placeholder="admin@crestyve.com"
              />
            </div>

            <div>
              <label className="font-manrope text-[11px] tracking-wide text-dark mb-2 block font-medium">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-transparent font-inter text-[14px] focus:outline-none focus:border-dark transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover px-6 py-3.5 font-manrope text-[13px] font-medium tracking-wide text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && (
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-inter text-[11px] text-white/30 mt-6">
          © {new Date().getFullYear()} CRESTYVE. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
