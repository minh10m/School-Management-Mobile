"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/services/auth.service";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login({ username, password });
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        // Assume it might be an axios error object shaped like we expect
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(
          axiosErr.response?.data?.message || "Invalid credentials. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-zinc-950 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center p-6 text-center">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="px-8 pb-10 pt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Admin Area Login
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Enter your credentials to manage the school system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 p-3 rounded-xl text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 transition-all"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign in to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} EduManage. All rights reserved.
        </p>
      </div>
    </div>
  );
}
