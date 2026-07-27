"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Tag, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shippingRupees, setShippingRupees] = useState(0);

  useEffect(() => {
    fetch("/api/shipping")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.shippingRupees != null) {
          setShippingRupees(Number(data.shippingRupees) || 0);
        }
      })
      .catch(() => {
        /* shipping defaults to 0; server recomputes at checkout */
      });
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponChecking(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotalRupees: subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || "Invalid coupon");
      }
      setCouponApplied({ code: couponCode.trim().toUpperCase(), discount: data.discountRupees });
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "Failed to apply coupon");
      setCouponApplied(null);
    } finally {
      setCouponChecking(false);
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError(null);
  }

  const discount = couponApplied?.discount ?? 0;
  const estimatedTotal = Math.max(0, subtotal - discount) + shippingRupees;

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    for (const [key, value] of Object.entries(form)) {
      if (key === "line2") continue;
      if (!value.trim()) {
        setError("Please fill all required fields.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway. Please check your connection.");
      }

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          shippingAddress: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: "India",
          },
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            qty: item.qty,
          })),
          couponCode: couponApplied?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Crestyve",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.customerName,
          email: data.email,
          contact: data.phone,
        },
        theme: { color: "#8B1C3F" },
        handler: async (response: unknown) => {
          try {
            const payload = response as {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            };
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

            clear();
            router.push(`/order/${verifyData.orderNumber}?email=${encodeURIComponent(form.email)}`);
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Payment verification failed. Please contact support with your payment ID."
            );
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setSubmitting(false);
      });
      razorpay.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-lg px-6 text-center">
          <ShoppingBag className="h-10 w-10 text-dark/20 mx-auto mb-4" />
          <h1 className="font-cormorant text-3xl text-dark mb-3">Your bag is empty</h1>
          <p className="font-inter text-sm text-muted mb-8">
            Add something beautiful before checking out.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 bg-primary px-8 py-4 font-manrope text-sm font-medium tracking-wide text-white hover:bg-primary/90 transition-colors"
          >
            Browse Collections
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h1 className="font-cormorant text-4xl md:text-5xl font-light text-dark mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16">
          <form onSubmit={handlePayment} className="space-y-8">
            <div>
              <h2 className="font-manrope text-xs tracking-[0.2em] uppercase text-dark mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                  className="border border-border px-4 py-3 font-inter text-sm focus:outline-none focus:border-primary sm:col-span-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="border border-border px-4 py-3 font-inter text-sm focus:outline-none focus:border-primary"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="border border-border px-4 py-3 font-inter text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="font-manrope text-xs tracking-[0.2em] uppercase text-dark mb-4">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={form.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  className="border border-border px-4 py-3 font-inter text-sm focus:outline-none focus:border-primary"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (optional)"
                  value={form.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                  className="border border-border px-4 py-3 font-inter text-sm focus:outline-none focus:border-primary"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="border border-border px-4 py-3 font-inter text-sm focus:outline-none focus:border-primary"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="border border-border px-4 py-3 font-inter text-sm focus:outline-none focus:border-primary"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={form.pincode}
                    onChange={(e) => updateField("pincode", e.target.value)}
                    className="border border-border px-4 py-3 font-inter text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="font-inter text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary px-10 py-5 font-manrope text-sm font-medium tracking-wide text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay {estimatedTotal > 0 ? `₹${estimatedTotal.toLocaleString("en-IN")}` : ""} with Razorpay
            </button>
          </form>

          <div className="bg-dark/[0.02] border border-border p-6 h-fit">
            <h2 className="font-manrope text-xs tracking-[0.2em] uppercase text-dark mb-6">
              Order Summary
            </h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size ?? "std"}`} className="flex gap-3">
                  <div className="w-14 h-16 bg-dark/5 flex-shrink-0 overflow-hidden">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-manrope text-sm text-dark truncate">{item.name}</p>
                    <p className="font-inter text-xs text-muted">
                      {item.size ? `Size ${item.size} · ` : ""}Qty {item.qty}
                    </p>
                  </div>
                  <p className="font-inter text-sm text-dark whitespace-nowrap">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mb-4">
              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 text-sm">
                  <span className="font-inter text-green-700 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    {couponApplied.code} applied
                  </span>
                  <button type="button" onClick={removeCoupon} className="text-green-700 hover:text-green-900">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 border border-border px-3 py-2.5 font-inter text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponChecking}
                    className="px-4 py-2.5 bg-dark text-white font-manrope text-xs uppercase tracking-wide hover:bg-dark/90 transition-colors disabled:opacity-60"
                  >
                    {couponChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="font-inter text-xs text-red-600 mt-2">{couponError}</p>}
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between font-inter text-sm text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-inter text-sm text-green-700">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-inter text-sm text-muted">
                <span>Shipping</span>
                <span>{shippingRupees > 0 ? `₹${shippingRupees.toLocaleString("en-IN")}` : "Free"}</span>
              </div>
              <div className="flex justify-between font-cormorant text-xl text-dark pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{estimatedTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
