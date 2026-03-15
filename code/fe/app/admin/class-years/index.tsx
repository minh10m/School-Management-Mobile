import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const MOCK_CLASSES = [
  { classYearId: '1', className: '10A1', grade: 10, schoolYear: '2025-2026', homeRoomTeacher: 'Tran Thi Mai', studentCount: 35 },
  { classYearId: '2', className: '10A2', grade: 10, schoolYear: '2025-2026', homeRoomTeacher: 'Pham Thi Lan', studentCount: 33 },
  { classYearId: '3', className: '10B1', grade: 10, schoolYear: '2025-2026', homeRoomTeacher: 'Do Van Duc', studentCount: 34 },
  { classYearId: '4', className: '11A1', grade: 11, schoolYear: '2025-2026', homeRoomTeacher: 'Nguyen Thi Hoa', studentCount: 36 },
  { classYearId: '5', className: '11A2', grade: 11, schoolYear: '2025-2026', homeRoomTeacher: 'Le Van Nam', studentCount: 32 },
  { classYearId: '6', className: '12A1', grade: 12, schoolYear: '2025-2026', homeRoomTeacher: 'Vo Thi Bich', studentCount: 30 },
  { classYearId: '7', className: '12A2', grade: 12, schoolYear: '2025-2026', homeRoomTeacher: 'Phan Van Hung', studentCount: 28 },
];

const GRADE_TABS = ['All', '10', '11', '12'];

export default function AdminClassYearsScreen() {
  const [activeGrade, setActiveGrade] = useState('All');

  const filtered = MOCK_CLASSES.filter(c =>
    activeGrade === 'All' || c.grade === parseInt(activeGrade)
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Class Management</Text>
        <TouchableOpacity onPress={() => router.push('/admin/class-years/create' as any)}>
          <Ionicons name="add-circle-outline" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {/* School Year Tag */}
      <View className="px-6 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-sm">School Year: 2025-2026</Text>
        </View>
      </View>

      {/* Grade Tabs */}
      <View className="flex-row px-6 py-3 bg-white border-b border-gray-100 gap-2">
        {GRADE_TABS.map(g => (
          <TouchableOpacity
            key={g} onPress={() => setActiveGrade(g)}
            className={`px-4 py-1.5 rounded-full ${activeGrade === g ? 'bg-bright-blue' : 'bg-gray-100'}`}
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: activeGrade === g ? 'white' : '#6B7280' }}>
              {g === 'All' ? 'All' : `Grade ${g}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View className="px-6 py-2 bg-gray-50">
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{filtered.length} classes found</Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.classYearId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 border border-gray-100"
            onPress={() => router.push(`/admin/class-years/${item.classYearId}` as any)}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                  <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA', fontSize: 14 }}>{item.grade}</Text>
                </View>
                <View>
                  <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">{item.className}</Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{item.schoolYear}</Text>
                </View>
              </View>
              <View className="bg-blue-50 px-3 py-1 rounded-full">
                <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#136ADA', fontSize: 12 }}>{item.studentCount} students</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="person-outline" size={13} color="#9CA3AF" />
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Homeroom: {item.homeRoomTeacher}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
