"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  Plus
} from "lucide-react";

export default function RolesPage() {
  const [roles] = useState([
    {
      id: "r-01",
      name: "Admin",
      description: "Full access to all system features including configuration.",
      usersCount: 2,
      permissions: { users: true, courses: true, schedules: true, financials: true }
    },
    {
      id: "r-02",
      name: "Teacher",
      description: "Can manage their own classes, students, and submit courses.",
      usersCount: 45,
      permissions: { users: false, courses: true, schedules: true, financials: false }
    },
    {
      id: "r-03",
      name: "Student",
      description: "Can view their schedules, enroll in courses, and see grades.",
      usersCount: 1250,
      permissions: { users: false, courses: false, schedules: true, financials: false }
    }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Roles & Permissions
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define system roles and configure access levels for users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50 dark:divide-white/10">
            <thead className="bg-gray-50/50 dark:bg-white/5">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Role Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Description
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Users
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Permissions
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-white/10 bg-white dark:bg-transparent">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                        <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {role.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {role.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10">
                      {role.usersCount}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permissions).map(([key, value]) => value && (
                        <span key={key} className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20 capitalize">
                           {key}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
