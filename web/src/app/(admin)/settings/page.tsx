"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Settings, 
  Lock, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Bell,
  Eye,
  EyeOff,
  User
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("vi");
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings, security preferences, and UI customization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sidebar Tabs (UI Mock) */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 text-left">
            <User className="h-4 w-4" /> Account Info
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 text-left">
            <Lock className="h-4 w-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 text-left">
            <Bell className="h-4 w-4" /> Notifications
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Appearance Section */}
          <section className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sun className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appearance & Language</h3>
            </div>

            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Display Theme</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
                </div>
                <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <button 
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "light" ? 'bg-white shadow-sm text-indigo-600 dark:bg-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <Sun className="h-3.5 w-3.5" /> Light
                  </button>
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "dark" ? 'bg-white shadow-sm text-indigo-600 dark:bg-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <Moon className="h-3.5 w-3.5" /> Dark
                  </button>
                  <button 
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === "system" ? 'bg-white shadow-sm text-indigo-600 dark:bg-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> System
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">System Language</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select your preferred language</p>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-xl border-gray-200 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 dark:bg-white/5 dark:border-white/10 dark:text-white bg-white py-2 pl-3 pr-10 shadow-sm"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English (US)</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </section>

          {/* Change Password Section */}
          <section className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Password & Security</h3>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword.current ? "text" : "password"}
                    className="block w-full rounded-xl border-0 py-2.5 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 text-sm"
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword.new ? "text" : "password"}
                    className="block w-full rounded-xl border-0 py-2.5 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 text-sm"
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword.confirm ? "text" : "password"}
                    className="block w-full rounded-xl border-0 py-2.5 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 text-sm"
                    placeholder="Confirm new password"
                  />
                  <button 
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="button"
                  className="w-full flex justify-center py-2.5 px-4 rounded-xl border border-transparent shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </section>

          {/* Warning Section */}
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 p-4 border border-red-200 dark:border-red-500/20">
             <div className="flex gap-3">
               <Lock className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
               <div>
                 <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Security Note</h4>
                 <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                   Changing your password will log you out from all other active sessions for your safety. Make sure you use a strong, unique password.
                 </p>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
