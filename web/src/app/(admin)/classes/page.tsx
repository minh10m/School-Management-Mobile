"use client";

import { useState } from "react";
import { BookOpen, Search, Plus, Users, Calendar } from "lucide-react";

export default function ClassesPage() {
  const [classes] = useState([
    {
      id: "cls-1",
      name: "10A1",
      grade: "10th Grade",
      teacher: "David Miller",
      studentsCount: 32,
      schedule: "Mon, Wed, Fri",
      color: "blue"
    },
    {
      id: "cls-2",
      name: "10A2",
      grade: "10th Grade",
      teacher: "Sarah Connor",
      studentsCount: 28,
      schedule: "Tue, Thu",
      color: "green"
    },
    {
      id: "cls-3",
      name: "11B1",
      grade: "11th Grade",
      teacher: "James Wilson",
      studentsCount: 30,
      schedule: "Mon, Wed, Fri",
      color: "purple"
    },
    {
      id: "cls-4",
      name: "12C1",
      grade: "12th Grade",
      teacher: "Anna Taylor",
      studentsCount: 25,
      schedule: "Daily",
      color: "orange"
    }
  ]);

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20';
      case 'green': return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20';
      case 'purple': return 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20';
      case 'orange': return 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Classes & Subjects
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage academic classes, assign homeroom teachers, and view rosters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
            <Plus className="h-4 w-4" />
            New Class
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 transition-colors bg-white/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50 dark:divide-white/10">
            <thead className="bg-gray-50/50 dark:bg-white/5">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Class Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Grade / School Year
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Homeroom Teacher
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Students
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Schedule
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-white/10 bg-white dark:bg-transparent">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {cls.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${getColorClasses(cls.color)}`}>
                      {cls.grade}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {cls.teacher}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <div className="flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-200">
                      <Users className="h-4 w-4 text-gray-400" />
                      {cls.studentsCount}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {cls.schedule}
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
