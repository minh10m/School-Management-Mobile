"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Lock, 
  Unlock, 
  Edit2, 
  KeyRound, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { UserListItem } from "@/features/users/types";
import AddUserModal from "@/features/users/components/AddUserModal";

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data since backend is not connected yet
  const users: UserListItem[] = [
    {
      userId: "u-001",
      username: "admin_lee",
      fullName: "Lee Minh",
      role: "Admin",
      createdAt: "2026-01-15T08:30:00Z",
      lockoutEnd: null,
    },
    {
      userId: "u-002",
      username: "teacher_anna",
      fullName: "Anna Taylor",
      role: "Teacher",
      createdAt: "2026-02-10T09:15:00Z",
      lockoutEnd: "2026-12-31T23:59:59Z", // Locked
    },
    {
      userId: "u-003",
      username: "student_john",
      fullName: "John Doe",
      role: "Student",
      createdAt: "2026-03-01T14:20:00Z",
      lockoutEnd: null,
    },
    {
      userId: "u-004",
      username: "teacher_mark",
      fullName: "Mark Spector",
      role: "Teacher",
      createdAt: "2026-03-05T11:45:00Z",
      lockoutEnd: null,
    },
    {
      userId: "u-005",
      username: "student_jane",
      fullName: "Jane Smith",
      role: "Student",
      createdAt: "2026-03-12T16:00:00Z",
      lockoutEnd: null,
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 ring-purple-600/20";
      case "Teacher":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 ring-blue-600/20";
      case "Student":
        return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 ring-green-600/20";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 ring-gray-600/20";
    }
  };

  const isLocked = (lockoutEnd: string | null) => {
    if (!lockoutEnd) return false;
    return new Date(lockoutEnd) > new Date();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Users Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A list of all users in your school system. You can add, edit, lock, or reset their passwords.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/10 transition-colors">
            <Filter className="h-4 w-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="border-b border-gray-200/50 dark:border-white/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-0 py-2 pl-10 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block rounded-xl border-0 py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-zinc-800 dark:text-white dark:ring-white/10"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50 dark:divide-white/10">
            <thead className="bg-gray-50/50 dark:bg-white/5">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  User
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Username
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Role
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Joined
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-white/10 bg-white dark:bg-transparent">
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center dark:from-indigo-900/50 dark:to-purple-900/50">
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          {user.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.username}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {isLocked(user.lockoutEnd) ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === user.userId ? null : user.userId)}
                        className="flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-300 transition-colors"
                      >
                        <span className="sr-only">Open options</span>
                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === user.userId && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-zinc-900 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-100">
                            <div className="py-1">
                              <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5">
                                <Edit2 className="mr-3 h-4 w-4 text-gray-400" />
                                Edit Info
                              </button>
                              <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5">
                                <KeyRound className="mr-3 h-4 w-4 text-gray-400" />
                                Reset Password
                              </button>
                              <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5">
                                <ShieldAlert className="mr-3 h-4 w-4 text-gray-400" />
                                Change Role
                              </button>
                              <hr className="my-1 border-gray-200 dark:border-white/10" />
                              {isLocked(user.lockoutEnd) ? (
                                <button className="flex w-full items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-white/5">
                                  <Unlock className="mr-3 h-4 w-4 text-green-500" />
                                  Unlock Account
                                </button>
                              ) : (
                                <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-white/5">
                                  <Lock className="mr-3 h-4 w-4 text-red-500" />
                                  Lock Account
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Dummy */}
        <div className="flex items-center justify-between border-t border-gray-200/50 dark:border-white/10 bg-white py-3 px-6 dark:bg-transparent">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-semibold">1</span> to <span className="font-semibold">{filteredUsers.length}</span> of <span className="font-semibold">{filteredUsers.length}</span> results
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end gap-2">
            <button className="relative inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/10 transition-colors" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="relative inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/10 transition-colors" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          console.log("Saving user:", data);
          setIsModalOpen(false);
          // TODO: Intergrate with POST /users
        }}
      />
    </div>
  );
}
