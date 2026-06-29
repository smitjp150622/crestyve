"use client";

import { Package, Users, Eye, MessageSquare } from "lucide-react";

const stats = [
  { label: "Total Products", value: "24", icon: Package, change: "+3 this month" },
  { label: "Enquiries", value: "156", icon: MessageSquare, change: "+12 this week" },
  { label: "Page Views", value: "8.2K", icon: Eye, change: "+18% from last month" },
  { label: "WhatsApp Clicks", value: "342", icon: Users, change: "+24% from last month" },
];

const recentMessages = [
  { name: "Rahul K.", subject: "Custom jacket inquiry", time: "2 hours ago", read: false },
  { name: "Priya M.", subject: "Collaboration request", time: "5 hours ago", read: false },
  { name: "Ankit S.", subject: "Size availability", time: "1 day ago", read: true },
  { name: "Sneha P.", subject: "Commission pricing", time: "2 days ago", read: true },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-cormorant text-3xl text-gray-900 mb-2">Dashboard</h2>
        <p className="font-inter text-sm text-gray-500">
          Overview of your website performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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

      {/* Recent Messages */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-manrope text-sm font-medium text-gray-900">
            Recent Messages
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {recentMessages.map((msg, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                {!msg.read && (
                  <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
                <div className={!msg.read ? "" : "ml-5"}>
                  <p className="font-manrope text-sm font-medium text-gray-900">
                    {msg.name}
                  </p>
                  <p className="font-inter text-xs text-gray-500">{msg.subject}</p>
                </div>
              </div>
              <span className="font-inter text-xs text-gray-400">{msg.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
