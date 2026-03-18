"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  ShieldAlert,
  BookMarked,
  CreditCard,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Roles", href: "/roles", icon: ShieldAlert },
  { name: "Students & Teachers", href: "/people", icon: GraduationCap },
  { name: "Classes", href: "/classes", icon: BookOpen },
  { name: "Schedules", href: "/schedules", icon: Calendar },
  { name: "Courses Approval", href: "/courses-approval", icon: BookMarked },
  { name: "Fees", href: "/fees", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-72 flex-col border-r border-gray-200/40 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/60 shadow-sm transition-all duration-300">
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            EduManage
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 gap-2 flex flex-col">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-50/80 text-indigo-700 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-colors duration-200 ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      {/* Bottom Profile / Quick Info area */}
      <div className="mt-auto border-t border-gray-200/40 dark:border-white/10 p-4">
        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:from-indigo-950/30 dark:to-purple-950/30">
          <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">System Status</h4>
          <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300/80">All services running smoothly.</p>
        </div>
      </div>
    </div>
  );
}
