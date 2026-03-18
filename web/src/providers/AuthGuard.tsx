"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, isLoading, loadAuthFromStorage } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    if (!accessToken && !pathname.startsWith("/login")) {
      router.replace("/login");
    } else if (accessToken && pathname.startsWith("/login")) {
      router.replace("/");
    }
  }, [accessToken, isLoading, router, pathname, isMounted]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Prevent rendering children if unauthenticated and trying to access protected route
  if (!accessToken && !pathname.startsWith("/login")) {
    return null;
  }

  return <>{children}</>;
}
