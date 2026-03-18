"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { userInfo } = useAuthStore();

  const stats = [
    { name: "Total Students", stat: "1,204", icon: GraduationCap, change: "+4.75%", changeType: "positive" },
    { name: "Total Teachers", stat: "86", icon: Users, change: "+1.2%", changeType: "positive" },
    { name: "Active Classes", stat: "42", icon: BookOpen, change: "0%", changeType: "neutral" },
    { name: "Attendance Rate", stat: "96.5%", icon: TrendingUp, change: "+2.1%", changeType: "positive" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Welcome back, {userInfo?.fullName || "Admin"}! 👋
        </h2>
        <p className="mt-3 text-lg leading-6 text-gray-500 dark:text-gray-400">
          Here is an overview of your school&apos;s current status and operations.
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl bg-white px-4 pb-12 pt-5 shadow-sm ring-1 ring-gray-200/50 hover:shadow-md transition-shadow dark:bg-black/40 dark:ring-white/10 sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-xl bg-indigo-500/10 p-3 dark:bg-indigo-500/20">
                <item.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {item.stat}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === "positive" ? "text-green-600 dark:text-green-400" : "text-gray-500"
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      {/* Quick Action Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
        <div className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 p-6">
          <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
            Recent Alerts
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-3 dark:bg-yellow-500/10">
              <div className="h-2 w-2 mt-2 rounded-full bg-yellow-400"></div>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">System maintenance scheduled</p>
                <p className="text-xs mt-1 text-yellow-700/70 dark:text-yellow-300/70">Tonight from 2 AM to 4 AM.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-500/10">
              <div className="h-2 w-2 mt-2 rounded-full bg-indigo-400"></div>
              <div>
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">New student registrations</p>
                <p className="text-xs mt-1 text-indigo-700/70 dark:text-indigo-300/70">12 new students enrolled today.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-200/50 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Setup Next Steps</h3>
            <p className="text-indigo-100 text-sm mb-6 max-w-sm">
              Your admin dashboard has been successfully initialized. Start by adding new users or importing class records.
            </p>
            <button className="bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-indigo-50 transition-colors shadow-sm">
              Manage Users
            </button>
          </div>
          <GraduationCap className="absolute -bottom-6 -right-6 w-48 h-48 text-white/10" />
        </div>
      </div>
    </div>
  );
}
