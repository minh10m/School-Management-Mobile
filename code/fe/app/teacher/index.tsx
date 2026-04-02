import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import SideMenu from '../../components/SideMenu';

const QUICK_ACTIONS = [
  { label: 'My Classes',  icon: 'school-outline',         color: 'bg-blue-100',   iconColor: '#136ADA', route: '/teacher/classes' },
  { label: 'Attendance',  icon: 'checkmark-circle-outline',color: 'bg-green-100', iconColor: '#22C55E', route: '/teacher/attendance' },
  { label: 'Schedule',    icon: 'calendar-outline',       color: 'bg-purple-100', iconColor: '#A855F7', route: '/teacher/schedules' },
  { label: 'Assignments', icon: 'document-text-outline',  color: 'bg-yellow-100', iconColor: '#EAB308', route: '/teacher/assignments' },
  { label: 'Submissions', icon: 'list-circle-outline',    color: 'bg-pink-100',   iconColor: '#F43F5E', route: '/teacher/submissions' },
  { label: 'Grades',      icon: 'ribbon-outline',         color: 'bg-teal-100',   iconColor: '#14B8A6', route: '/teacher/results' },
  { label: 'Courses',     icon: 'play-circle-outline',    color: 'bg-orange-100', iconColor: '#F97316', route: '/teacher/courses' },
  { label: 'Lessons',     icon: 'folder-open-outline',    color: 'bg-gray-100',   iconColor: '#6B7280', route: '/teacher/lessons' },
  { label: 'Students',    icon: 'people-outline',         color: 'bg-indigo-100', iconColor: '#6366F1', route: '/teacher/students' },
  { label: 'Teachers',    icon: 'id-card-outline',        color: 'bg-red-100',    iconColor: '#EF4444', route: '/teacher/community/teachers' },
];

export default function TeacherDashboard() {
  const { userInfo } = useAuthStore();
  const teacherName = userInfo?.fullName?.split(' ').at(-1) ?? 'Teacher';

  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);

  // Stats can be mocked or fetched similarly
  const stats = { classes: '4', students: '142', assignments: '12', courses: '3' };

  const STAT_CARDS = [
    { label: 'Classes', value: stats.classes, icon: 'school', color: '#136ADA', bg: 'bg-blue-50' },
    { label: 'Students', value: stats.students, icon: 'people', color: '#A855F7', bg: 'bg-purple-50' },
    { label: 'Assignments', value: stats.assignments, icon: 'document-text', color: '#14B8A6', bg: 'bg-teal-50' },
    { label: 'Courses', value: stats.courses, icon: 'play-circle', color: '#F97316', bg: 'bg-orange-50' },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-4 mb-6">
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="black" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Ionicons name="book" size={24} color="#136ADA" />
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-bright-blue text-xl">Teacher Portal</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/teacher/edit-profile')}>
          <Ionicons name="person-circle-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Welcome Greeting */}
        <View className="px-6 mt-6 mb-2">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-xl">
             Hi, Welcome, {teacherName} 👋
          </Text>
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">
            Teacher Dashboard for School Year 2025-2026
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mt-6 mb-5">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-500 text-xs mb-3 uppercase tracking-widest">Overview</Text>
          <View className="flex-row flex-wrap gap-3">
            {STAT_CARDS.map((s) => (
              <View key={s.label} className={`${s.bg} flex-1 min-w-[44%] rounded-3xl p-5`}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="w-8 h-8 rounded-full bg-white/60 items-center justify-center">
                    <Ionicons name={s.icon as any} size={18} color={s.color} />
                  </View>
                  {loading && !refreshing ? (
                    <ActivityIndicator size="small" color={s.color} />
                  ) : (
                    <Text style={{ fontFamily: 'Poppins-Bold', color: s.color }} className="text-2xl">{s.value}</Text>
                  )}
                </View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600/80 text-xs">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-5">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-500 text-xs mb-3 uppercase tracking-widest">Management</Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                className={`${action.color} w-[31%] py-6 rounded-2xl items-center justify-center gap-2`}
                onPress={() => router.push(action.route as any)}
              >
                <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                  <Ionicons name={action.icon as any} size={20} color={action.iconColor} />
                </View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-xs text-center">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Banner/Note */}
        <View className="mx-6 mb-10 p-5 bg-teal-500 rounded-3xl overflow-hidden shadow-lg shadow-teal-200">
           <View className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Quick Action</Text>
           <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/80 text-xs mt-1">Review missing assignment submissions across all your active courses.</Text>
           <TouchableOpacity className="bg-white/20 self-start px-4 py-1.5 rounded-full mt-4">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-[10px]">Review Now</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}
