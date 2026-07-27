"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Image,
  MessageSquare,
  Trophy,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ShoppingBag,
  Tag,
  Receipt,
} from "lucide-react";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/inquiries", label: "Inquiries", icon: ShoppingBag },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/admin/awards", label: "Awards", icon: Trophy },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <Link href="/admin/dashboard" className="font-cormorant text-xl font-semibold">
            CRESTYVE
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-manrope text-[13px] transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {session?.user && (
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-manrope text-[12px] font-medium text-white/80">
                  {session.user.name || "Admin"}
                </p>
                <p className="font-inter text-[11px] text-white/40">
                  {session.user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-4 py-3 w-full text-white/40 hover:text-white font-manrope text-[13px] transition-colors rounded-lg hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-manrope text-[13px] font-medium text-gray-800">
            Admin Panel
          </h1>
          <div className="ml-auto">
            <Link
              href="/"
              target="_blank"
              className="font-inter text-[12px] text-muted hover:text-dark transition-colors"
            >
              View Site →
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
