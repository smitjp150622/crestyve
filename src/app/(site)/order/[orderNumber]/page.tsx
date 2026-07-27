import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { orders } from "@/lib/repositories/orders";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { orderNumber } = await params;
  const { email } = await searchParams;

  const order = await orders.findByOrderNumber(orderNumber);
  const authorized = order && email && order.email.toLowerCase() === email.toLowerCase();

  if (!authorized) {
    return (
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h1 className="font-cormorant text-3xl text-dark mb-3">Order Not Found</h1>
          <p className="font-inter text-sm text-muted mb-8">
            We couldn&apos;t find that order. Please check the link from your confirmation email.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary px-8 py-4 font-manrope text-sm font-medium tracking-wide text-white hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const address = order.shippingAddress as {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  return (
    <main className="pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        <div className="text-center mb-12">
          <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-6" />
          <h1 className="font-cormorant text-4xl md:text-5xl font-light text-dark mb-3">
            Order Confirmed
          </h1>
          <p className="font-inter text-sm text-muted">
            Thank you, {order.customerName}. Your order <strong>{order.orderNumber}</strong> has been placed.
          </p>
        </div>

        <div className="border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-manrope text-xs tracking-[0.2em] uppercase text-dark mb-4">
              Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-dark/5 flex-shrink-0 overflow-hidden">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-manrope text-sm text-dark">{item.name}</p>
                    <p className="font-inter text-xs text-muted">
                      {item.size ? `Size ${item.size} · ` : ""}Qty {item.qty}
                    </p>
                  </div>
                  <p className="font-inter text-sm text-dark">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h2 className="font-manrope text-xs tracking-[0.2em] uppercase text-dark mb-3">
                Shipping Address
              </h2>
              <p className="font-inter text-sm text-muted leading-relaxed">
                {order.customerName}
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.pincode}
                <br />
                {address.country}
              </p>
            </div>
            <div>
              <h2 className="font-manrope text-xs tracking-[0.2em] uppercase text-dark mb-3">
                Payment Status
              </h2>
              <p className="font-inter text-sm text-muted">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${
                    order.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p className="font-inter text-xs text-muted mt-3">
                Order status: {order.status}
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between font-inter text-sm text-muted">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between font-inter text-sm text-green-700">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-inter text-sm text-muted">
                <span>Shipping</span>
                <span>{order.shipping > 0 ? `₹${order.shipping.toLocaleString("en-IN")}` : "Free"}</span>
              </div>
              <div className="flex justify-between font-cormorant text-xl text-dark pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`/api/orders/${order.orderNumber}/invoice?email=${encodeURIComponent(order.email)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary px-8 py-4 font-manrope text-sm font-medium tracking-wide text-white hover:bg-primary/90 transition-colors"
          >
            Download Invoice
          </a>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 border border-dark px-8 py-4 font-manrope text-sm font-medium tracking-wide text-dark hover:bg-dark hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
