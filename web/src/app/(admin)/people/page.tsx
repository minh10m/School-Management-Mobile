"use client";

import { useState } from "react";
import { GraduationCap, Search, Mail, Phone, BookOpen, Star } from "lucide-react";

export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");
  
  const people = {
    teachers: [
      { id: "t1", name: "David Miller", subject: "Physics", rating: 4.8, email: "david.m@school.edu", phone: "+1 234 567 8900", avatar: "D" },
      { id: "t2", name: "Sarah Connor", subject: "History", rating: 4.9, email: "sarah.c@school.edu", phone: "+1 234 567 8901", avatar: "S" },
      { id: "t3", name: "James Wilson", subject: "Mathematics", rating: 4.7, email: "james.w@school.edu", phone: "+1 234 567 8902", avatar: "J" },
    ],
    students: [
      { id: "s1", name: "Alice Johnson", class: "10A1", gpa: 3.8, email: "alice.j@student.edu", phone: "+1 987 654 3210", avatar: "A" },
      { id: "s2", name: "Bob Smith", class: "10A2", gpa: 3.5, email: "bob.s@student.edu", phone: "+1 987 654 3211", avatar: "B" },
      { id: "s3", name: "Charlie Brown", class: "11B1", gpa: 3.9, email: "charlie.b@student.edu", phone: "+1 987 654 3212", avatar: "C" },
    ]
  };

  const currentList = people[activeTab];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Students & Teachers
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Directory of all academic personnel and enrolled students.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search directory..."
            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 transition-colors bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("teachers")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === "teachers"
                ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Teachers Directory
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === "students"
                ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Students Directory
          </button>
        </nav>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 overflow-hidden mt-6">
        <div className="border-b border-gray-200/50 dark:border-white/10 px-6 py-4 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
                {activeTab === 'teachers' ? 'Teachers List' : 'Students List'}
            </h3>
            <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
                <span className="text-lg leading-none">+</span> Add {activeTab === 'teachers' ? 'Teacher' : 'Student'}
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50 dark:divide-white/10">
            <thead className="bg-gray-50/50 dark:bg-white/5">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Contact
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  {activeTab === 'teachers' ? 'Subject' : 'Class'}
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Rating/GPA
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-white/10 bg-white dark:bg-transparent">
               {currentList.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-sm font-bold text-indigo-700 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-300">
                         {person.avatar}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">{person.name}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5"/> {person.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5"/> {person.phone}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {'subject' in person ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                          <BookOpen className="h-3 w-3" /> {person.subject}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                           {person.class}
                        </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className="inline-flex items-center gap-1 font-medium text-yellow-600 dark:text-yellow-500">
                        <Star className="h-3.5 w-3.5" fill="currentColor" />
                        {'rating' in person ? person.rating : person.gpa}
                    </span>
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
