"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download
} from "lucide-react";

interface Invoice {
  id: string;
  studentName: string;
  studentId: string;
  type: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-2024-001",
    studentName: "Nguyễn Văn A",
    studentId: "STU001",
    type: "Tuition Fee - Q1",
    amount: 5000000,
    dueDate: "2024-03-20",
    status: "Paid",
  },
  {
    id: "INV-2024-002",
    studentName: "Trần Thị B",
    studentId: "STU002",
    type: "Library Fee",
    amount: 200000,
    dueDate: "2024-03-25",
    status: "Pending",
  },
  {
    id: "INV-2024-003",
    studentName: "Lê Văn C",
    studentId: "STU003",
    type: "Registration Fee",
    amount: 1000000,
    dueDate: "2024-02-15",
    status: "Overdue",
  },
  {
    id: "INV-2024-004",
    studentName: "Phạm Minh D",
    studentId: "STU004",
    type: "Tuition Fee - Q1",
    amount: 5000000,
    dueDate: "2024-03-20",
    status: "Paid",
  },
  {
    id: "INV-2024-005",
    studentName: "Hoàng Anh E",
    studentId: "STU005",
    type: "Extracurricular",
    amount: 450000,
    dueDate: "2024-03-30",
    status: "Pending",
  },
];

export default function FeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20";
      case "Overdue":
        return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid": return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "Pending": return <Clock className="h-3.5 w-3.5" />;
      case "Overdue": return <AlertCircle className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Fees Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor invoices, tuition stays, and financial records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/10 transition-all">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all">
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collected</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">10,500,000₫</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Amount</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">650,000₫</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Invoices</p>
          <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">1,000,000₫</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="rounded-xl border-gray-300 bg-white py-2 pl-3 pr-10 text-sm font-medium text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-white transition-all focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Invoice ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Student</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Due Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {mockInvoices.map((invoice) => (
                <tr 
                  key={invoice.id} 
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{invoice.studentName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.studentId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {invoice.type}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                    {invoice.amount.toLocaleString()}₫
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyle(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
