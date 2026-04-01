import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const STATS = [
  { label: 'Classes', value: '4', icon: 'school', color: '#136ADA', bg: 'bg-blue-50' },
  { label: 'Students', value: '142', icon: 'people', color: '#A855F7', bg: 'bg-purple-50' },
  { label: 'Assignments', value: '12', icon: 'document-text', color: '#14B8A6', bg: 'bg-teal-50' },
  { label: 'Courses', value: '3', icon: 'play-circle', color: '#F97316', bg: 'bg-orange-50' },
];

const QUICK_ACTIONS = [
  { label: 'My Classes',  icon: 'school-outline',         color: 'bg-blue-100',   iconColor: '#136ADA', route: '/teacher/classes' },
  { label: 'Attendance',  icon: 'checkmark-circle-outline',color: 'bg-green-100', iconColor: '#22C55E', route: '/teacher/attendance' },
  { label: 'Schedule',    icon: 'calendar-outline',       color: 'bg-purple-100', iconColor: '#A855F7', route: '/teacher/schedules' },
  { label: 'Assignments', icon: 'document-text-outline',  color: 'bg-yellow-100', iconColor: '#EAB308', route: '/teacher/assignments' },
  { label: 'Submissions', icon: 'list-circle-outline',    color: 'bg-pink-100',   iconColor: '#F43F5E', route: '/teacher/submissions' },
  { label: 'Grades',      icon: 'ribbon-outline',         color: 'bg-teal-100',   iconColor: '#14B8A6', route: '/teacher/results' },
  { label: 'Courses',     icon: 'play-circle-outline',    color: 'bg-orange-100', iconColor: '#F97316', route: '/teacher/courses' },
  { label: 'Lessons',     icon: 'folder-open-outline',    color: 'bg-gray-100',   iconColor: '#6B7280', route: '/teacher/lessons' },
];

const RECENT_ACTIVITY = [
  { id: '1', text: 'New submission from Nguyen Van A in Math Assignment 1', time: '10 mins ago', icon: 'document-attach-outline', color: '#14B8A6' },
  { id: '2', text: 'You marked attendance for 10A1', time: '2 hours ago', icon: 'checkmark-done-outline', color: '#22C55E' },
  { id: '3', text: 'Math lesson uploaded to "Toán nâng cao" course', time: 'Yesterday', icon: 'cloud-upload-outline', color: '#136ADA' },
  { id: '4', text: 'Exam schedule for 11th grade published', time: 'Yesterday', icon: 'calendar-outline', color: '#A855F7' },
];

export default function TeacherDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Ionicons name="desktop-outline" size={20} color="#136ADA" />
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-bright-blue text-lg">Teacher Portal</Text>
        </View>
        <TouchableOpacity className="p-1" onPress={() => router.push('/teacher/edit-profile')}>
          <Ionicons name="person-circle-outline" size={26} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Welcome Banner */}
        <View className="mx-6 mt-5 mb-5 bg-bright-blue rounded-3xl p-5 overflow-hidden">
          <View className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <View className="absolute right-16 bottom-0 w-20 h-20 bg-white/10 rounded-full mb-[-10]" />
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/80 text-sm">Welcome back,</Text>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-xl mb-1">Teacher</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs">School Year 2025-2026</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-5">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-base mb-3">Overview</Text>
          <View className="flex-row flex-wrap gap-3">
            {STATS.map((s) => (
              <View key={s.label} className={`${s.bg} flex-1 min-w-[44%] rounded-2xl p-4`}>
                <View className="flex-row items-center justify-between mb-2">
                  <Ionicons name={s.icon as any} size={22} color={s.color} />
                  <Text style={{ fontFamily: 'Poppins-Bold', color: s.color }} className="text-2xl">{s.value}</Text>
                </View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-5">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-base mb-3">Teaching Operations</Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                className={`${action.color} w-[23%] py-5 rounded-2xl items-center justify-center gap-2`}
                onPress={() => router.push(action.route as any)}
              >
                <View className="w-10 h-10 bg-white/60 rounded-full items-center justify-center">
                  <Ionicons name={action.icon as any} size={20} color={action.iconColor} />
                </View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-[10px] text-center">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-6 pb-10">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-base mb-3">Recent Activity</Text>
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {RECENT_ACTIVITY.map((item, index) => (
              <View
                key={item.id}
                className={`flex-row items-center px-4 py-3 gap-3 ${index < RECENT_ACTIVITY.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <View className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center">
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-xs">{item.text}</Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px] mt-0.5">{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
