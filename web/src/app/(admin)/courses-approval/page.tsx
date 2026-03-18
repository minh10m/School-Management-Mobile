"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  BookOpen, 
  Search,
  BookMarked
} from "lucide-react";

// Assuming we will have a type like this from API
interface CourseItem {
  courseId: string;
  courseName: string;
  price: number;
  teacherName: string;
  subjectName: string;
  status: "pending" | "approved" | "rejected";
  description: string;
  createdAt: string;
}

export default function CoursesApprovalPage() {
  const [courses, setCourses] = useState<CourseItem[]>([
    {
      courseId: "c-001",
      courseName: "Advanced Calculus 101",
      price: 250000,
      teacherName: "Mr. Lee Minh",
      subjectName: "Mathematics",
      status: "pending",
      description: "An in-depth look into calculus for high school seniors preparing for university.",
      createdAt: "2026-03-10T08:30:00Z"
    },
    {
      courseId: "c-002",
      courseName: "IELTS Speaking Mastery",
      price: 500000,
      teacherName: "Ms. Anna Taylor",
      subjectName: "English",
      status: "pending",
      description: "Focuses on part 1, 2, and 3 of the IELTS speaking test with real mock exams.",
      createdAt: "2026-03-14T15:20:00Z"
    },
    {
      courseId: "c-003",
      courseName: "Basic Python Programming",
      price: 150000,
      teacherName: "Mr. Mark Spector",
      subjectName: "Computer Science",
      status: "pending",
      description: "Introduction to programming concepts using Python for beginners.",
      createdAt: "2026-03-16T10:00:00Z"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = (id: string) => {
    // In real app: call API PATCH /courses/{id}/status { status: "approved" }
    setCourses(courses.filter(c => c.courseId !== id));
  };

  const handleReject = (id: string) => {
    // In real app: call API PATCH /courses/{id}/status { status: "rejected" }
    setCourses(courses.filter(c => c.courseId !== id));
  };

  const filteredCourses = courses.filter((c) => 
    c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Courses Approval
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and approve new courses submitted by teachers before they go live to students.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500 transition-colors bg-white"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="rounded-2xl border border-gray-200 border-dashed bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-black/20">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 opacity-80" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">All Caught Up!</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no pending courses waiting for your approval right now.
          </p>
        </div>
      )}

      {/* Grid of Pending Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div 
            key={course.courseId} 
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-gray-300 dark:bg-zinc-900 dark:ring-white/10 dark:hover:ring-white/20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20">
                  <Clock className="h-3 w-3" /> Pending Review
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white flex items-center leading-none">
                  {course.price.toLocaleString("vi-VN")} 
                  <span className="text-xs text-gray-500 font-normal ml-1">VND</span>
                </span>
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                {course.courseName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                {course.description}
              </p>
              
              <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-white/5 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{course.teacherName.charAt(0)}</span>
                  </div>
                  <span className="font-medium">{course.teacherName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.subjectName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Submitted: {new Date(course.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="grid grid-cols-2 gap-1 bg-gray-50 p-2 dark:bg-white/5">
              <button 
                onClick={() => handleReject(course.courseId)}
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-white hover:text-red-700 hover:shadow-sm dark:text-red-400 dark:hover:bg-red-500/10 transition-all"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button 
                onClick={() => handleApprove(course.courseId)}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
            </div>
            
            {/* View Details Overlay trigger - Optional feature */}
            <button className="absolute top-6 right-6 p-2 rounded-full bg-white/80 dark:bg-black/50 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
