"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, BookOpen, Users } from "lucide-react";

export default function SchedulesPage() {
  const [currentWeek] = useState("March 20th - March 26th, 2026");

  const scheduleItems = [
    {
      id: "ev-1",
      title: "Advanced Calculus 101",
      type: "class",
      time: "08:00 AM - 09:30 AM",
      date: "Mon, Mar 20",
      location: "Room 301, Building A",
      teacher: "David Miller",
      color: "blue"
    },
    {
      id: "ev-2",
      title: "Midterm Physics Exam",
      type: "exam",
      time: "10:00 AM - 11:30 AM",
      date: "Tue, Mar 21",
      location: "Main Hall",
      teacher: "Sarah Connor",
      color: "red"
    },
    {
      id: "ev-3",
      title: "Staff Meeting",
      type: "event",
      time: "02:00 PM - 03:00 PM",
      date: "Wed, Mar 22",
      location: "Conference Room B",
      teacher: "All Teachers",
      color: "purple"
    },
    {
      id: "ev-4",
      title: "IELTS Speaking Mastery",
      type: "class",
      time: "04:00 PM - 06:00 PM",
      date: "Thu, Mar 23",
      location: "Room 105, Language Lab",
      teacher: "Anna Taylor",
      color: "green"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'class': return <BookOpen className="h-4 w-4" />;
      case 'exam': return <Clock className="h-4 w-4 text-red-500" />;
      case 'event': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'blue': return 'border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-400';
      case 'red': return 'border-l-4 border-red-500 bg-red-50/50 dark:bg-red-500/10 dark:border-red-400';
      case 'purple': return 'border-l-4 border-purple-500 bg-purple-50/50 dark:bg-purple-500/10 dark:border-purple-400';
      case 'green': return 'border-l-4 border-green-500 bg-green-50/50 dark:bg-green-500/10 dark:border-green-400';
      default: return 'border-l-4 border-gray-500 bg-gray-50/50 dark:bg-gray-500/10 dark:border-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Schedules & Events
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View upcoming classes, exams, and school events.
          </p>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-4 py-2 font-medium text-sm text-gray-900 dark:text-white rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5">
            {currentWeek}
          </div>
          <button className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Agenda View */}
      <div className="rounded-2xl border border-gray-200/50 bg-white shadow-sm dark:border-white/10 dark:bg-black/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
           <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming This Week</h3>
           <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
             <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Class</span>
             <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Exam</span>
             <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Event</span>
           </div>
        </div>
        
        <div className="divide-y divide-gray-200/50 dark:divide-white/10">
          {scheduleItems.map((item) => (
            <div key={item.id} className="p-6 transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
              <div className="flex flex-col sm:flex-row gap-6">
                
                {/* Date/Time Column */}
                <div className="sm:w-48 shrink-0 flex flex-col gap-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.date}
                  </span>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {item.time}
                  </span>
                </div>

                {/* Event Details Card */}
                <div className={`flex-1 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${getColorClasses(item.color)} transition-all hover:shadow-md`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`inline-flex items-center justify-center rounded-md p-1 bg-white/60 dark:bg-black/20 shadow-sm`}>
                         {getTypeIcon(item.type)}
                       </span>
                       <h4 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {item.teacher}
                      </span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex sm:flex-col gap-2 h-full justify-center">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-zinc-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
