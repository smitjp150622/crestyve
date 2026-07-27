"use client";

import { useEffect, useState } from "react";
import { Package, MessageSquare, ShoppingBag, IndianRupee, Loader2 } from "lucide-react";

interface Stats {
  totalProducts: number;
  productsThisMonth: number;
  totalInquiries: number;
  inquiriesThisWeek: number;
  unreadMessages: number;
  totalOrders: number;
  ordersThisMonth: number;
  revenuePaise: number;
  recentMessages: {
    id: string;
    name: string;
    subject: string;
    read: boolean;
    createdAt: string;
  }[];
  recentInquiries: {
    id: string;
    customerName: string;
    status: string;
    createdAt: string;
  }[];
}

function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B1C3F]" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      change: `+${stats?.productsThisMonth ?? 0} this month`,
    },
    {
      label: "Inquiries",
      value: stats?.totalInquiries ?? 0,
      icon: MessageSquare,
      change: `+${stats?.inquiriesThisWeek ?? 0} this week`,
    },
    {
      label: "Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      change: `+${stats?.ordersThisMonth ?? 0} this month`,
    },
    {
      label: "Revenue (Paid)",
      value: formatInr(stats?.revenuePaise ?? 0),
      icon: IndianRupee,
      change: "All-time",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-cormorant text-3xl text-gray-900 mb-2">Dashboard</h2>
        <p className="font-inter text-sm text-gray-500">
          Overview of your website performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="font-cormorant text-3xl font-medium text-gray-900">
                {stat.value}
              </p>
              <p className="font-manrope text-xs text-gray-500 mt-1">{stat.label}</p>
              <p className="font-inter text-xs text-green-600 mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-manrope text-sm font-medium text-gray-900">
              Recent Messages
              {stats && stats.unreadMessages > 0 && (
                <span className="ml-2 text-[11px] text-[#8B1C3F] bg-[#8B1C3F]/10 px-2 py-0.5 rounded-full">
                  {stats.unreadMessages} unread
                </span>
              )}
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {!stats || stats.recentMessages.length === 0 ? (
              <p className="px-6 py-8 text-center font-inter text-sm text-gray-400">
                No messages yet
              </p>
            ) : (
              stats.recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {!msg.read && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                    <div className={!msg.read ? "" : "ml-5"}>
                      <p className="font-manrope text-sm font-medium text-gray-900">
                        {msg.name}
                      </p>
                      <p className="font-inter text-xs text-gray-500 truncate max-w-[220px]">
                        {msg.subject}
                      </p>
                    </div>
                  </div>
                  <span className="font-inter text-xs text-gray-400">
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-manrope text-sm font-medium text-gray-900">
              Recent Inquiries
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {!stats || stats.recentInquiries.length === 0 ? (
              <p className="px-6 py-8 text-center font-inter text-sm text-gray-400">
                No inquiries yet
              </p>
            ) : (
              stats.recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <p className="font-manrope text-sm font-medium text-gray-900">
                    {inq.customerName}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-manrope text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#8B1C3F]/10 text-[#8B1C3F]">
                      {inq.status.replace("_", " ")}
                    </span>
                    <span className="font-inter text-xs text-gray-400">
                      {timeAgo(inq.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
