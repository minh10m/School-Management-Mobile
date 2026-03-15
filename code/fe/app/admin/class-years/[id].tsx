import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

const MOCK_CLASSES: Record<string, any> = {
  '1': {
    classYearId: '1', className: '10A1', grade: 10, schoolYear: '2025-2026',
    homeRoomTeacher: 'Tran Thi Mai', studentCount: 35,
    students: [
      { id: 's1', fullName: 'Le Van Minh', birthday: '2006-03-15' },
      { id: 's2', fullName: 'Nguyen Thi Lan', birthday: '2006-07-22' },
      { id: 's3', fullName: 'Tran Van An', birthday: '2006-11-08' },
      { id: 's4', fullName: 'Pham Thi Bich', birthday: '2006-01-30' },
      { id: 's5', fullName: 'Hoang Van Nam', birthday: '2007-05-14' },
    ],
  },
  '2': {
    classYearId: '2', className: '10A2', grade: 10, schoolYear: '2025-2026',
    homeRoomTeacher: 'Pham Thi Lan', studentCount: 33,
    students: [
      { id: 's6', fullName: 'Dao Thi Huong', birthday: '2006-09-12' },
      { id: 's7', fullName: 'Vu Van Long', birthday: '2006-04-18' },
    ],
  },
};

const TABS = ['Students', 'Info'];

export default function AdminClassYearDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cls = MOCK_CLASSES[id ?? '1'];
  const [activeTab, setActiveTab] = useState('Students');

  if (!cls) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Class not found</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">{cls.className}</Text>
        <View className="bg-blue-50 px-3 py-1 rounded-full">
          <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#136ADA', fontSize: 12 }}>Grade {cls.grade}</Text>
        </View>
      </View>

      {/* Class Summary Card */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100 flex-row">
        <View className="flex-1">
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">School Year</Text>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{cls.schoolYear}</Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Homeroom</Text>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{cls.homeRoomTeacher}</Text>
        </View>
        <View>
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Students</Text>
          <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA' }} className="text-lg">{cls.studentCount}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        {TABS.map(t => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)}
            className={`flex-1 py-3 items-center ${activeTab === t ? 'bg-bright-blue' : ''}`}
          >
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 13, color: activeTab === t ? 'white' : '#9CA3AF' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Students' ? (
        <FlatList
          data={cls.students}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }: any) => (
            <View className="bg-white rounded-2xl px-4 py-3 border border-gray-100 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-teal-100 items-center justify-center">
                <Text style={{ fontFamily: 'Poppins-Bold', color: '#14B8A6', fontSize: 14 }}>{item.fullName.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{item.fullName}</Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Born: {item.birthday}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </View>
          )}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {[
            { label: 'Class Name', value: cls.className, icon: 'school-outline' },
            { label: 'Grade', value: `Grade ${cls.grade}`, icon: 'layers-outline' },
            { label: 'School Year', value: cls.schoolYear, icon: 'calendar-outline' },
            { label: 'Homeroom Teacher', value: cls.homeRoomTeacher, icon: 'person-outline' },
            { label: 'Total Students', value: `${cls.studentCount} students`, icon: 'people-outline' },
          ].map(row => (
            <View key={row.label} className="flex-row items-center gap-3 bg-white rounded-xl px-4 py-3 mb-2 border border-gray-100">
              <Ionicons name={row.icon as any} size={18} color="#9CA3AF" />
              <View>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{row.label}</Text>
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{row.value}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
