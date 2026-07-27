import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { orders } from "@/lib/repositories/orders";
import { settings } from "@/lib/repositories/settings";
import { InvoicePrintButton } from "./InvoicePrintButton";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const order = await orders.findById(id);
  if (!order) notFound();

  const siteSettings = await settings.get();
  const address = order.shippingAddress as {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white">
      <div className="print:hidden mb-6 flex justify-end">
        <InvoicePrintButton />
      </div>

      <div className="border border-gray-200 p-10">
        <div className="flex items-start justify-between mb-10 pb-6 border-b border-gray-200">
          <div>
            <h1 className="font-cormorant text-3xl text-gray-900">CRESTYVE</h1>
            <p className="font-inter text-xs text-gray-500 mt-1">{siteSettings.email}</p>
            {siteSettings.studioAddress && (
              <p className="font-inter text-xs text-gray-500">{siteSettings.studioAddress}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="font-manrope text-lg font-medium text-gray-900">INVOICE</h2>
            <p className="font-inter text-xs text-gray-500 mt-1">{order.orderNumber}</p>
            <p className="font-inter text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="font-manrope text-[11px] uppercase tracking-wider text-gray-500 mb-2">
              Billed To
            </h3>
            <p className="font-inter text-sm text-gray-900">{order.customerName}</p>
            <p className="font-inter text-sm text-gray-600">{order.email}</p>
            <p className="font-inter text-sm text-gray-600">{order.phone}</p>
          </div>
          <div>
            <h3 className="font-manrope text-[11px] uppercase tracking-wider text-gray-500 mb-2">
              Ship To
            </h3>
            <p className="font-inter text-sm text-gray-600 leading-relaxed">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.state} {address.pincode}
              <br />
              {address.country}
            </p>
          </div>
        </div>

        <table className="w-full mb-10">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 font-manrope text-[11px] uppercase tracking-wider text-gray-500">
                Item
              </th>
              <th className="text-center py-2 font-manrope text-[11px] uppercase tracking-wider text-gray-500">
                Qty
              </th>
              <th className="text-right py-2 font-manrope text-[11px] uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="text-right py-2 font-manrope text-[11px] uppercase tracking-wider text-gray-500">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 font-inter text-sm text-gray-900">
                  {item.name}
                  {item.size ? ` (Size ${item.size})` : ""}
                </td>
                <td className="py-3 text-center font-inter text-sm text-gray-600">{item.qty}</td>
                <td className="py-3 text-right font-inter text-sm text-gray-600">
                  ₹{item.price.toLocaleString("en-IN")}
                </td>
                <td className="py-3 text-right font-inter text-sm text-gray-900">
                  ₹{(item.price * item.qty).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between font-inter text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between font-inter text-sm text-gray-600">
                <span>Discount</span>
                <span>-₹{order.discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-inter text-sm text-gray-600">
              <span>Shipping</span>
              <span>{order.shipping > 0 ? `₹${order.shipping.toLocaleString("en-IN")}` : "Free"}</span>
            </div>
            <div className="flex justify-between font-manrope text-base font-medium text-gray-900 pt-2 border-t border-gray-300">
              <span>Total</span>
              <span>₹{order.total.toLocaleString("en-IN")}</span>
            </div>
            <p className="font-inter text-[11px] text-gray-400 pt-1">
              Payment Status: {order.paymentStatus}
              {order.razorpayPaymentId ? ` · Ref: ${order.razorpayPaymentId}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
