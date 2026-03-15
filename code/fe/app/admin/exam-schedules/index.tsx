import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const MOCK_EXAM_SCHEDULES = [
  { examScheduleId: '1', type: 'Midterm', term: 'HK1', schoolYear: '2025-2026', grade: 10 },
  { examScheduleId: '2', type: 'Final',   term: 'HK1', schoolYear: '2025-2026', grade: 10 },
  { examScheduleId: '3', type: 'Midterm', term: 'HK1', schoolYear: '2025-2026', grade: 11 },
  { examScheduleId: '4', type: 'Final',   term: 'HK1', schoolYear: '2025-2026', grade: 11 },
  { examScheduleId: '5', type: 'Midterm', term: 'HK2', schoolYear: '2025-2026', grade: 10 },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Midterm: { bg: '#FFF7ED', text: '#F97316' },
  Final:   { bg: '#FEF2F2', text: '#EF4444' },
};

const GRADE_TABS = ['All', '10', '11', '12'];

export default function AdminExamSchedulesScreen() {
  const [activeGrade, setActiveGrade] = useState('All');

  const filtered = MOCK_EXAM_SCHEDULES.filter(e =>
    activeGrade === 'All' || e.grade === parseInt(activeGrade)
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Exam Schedules</Text>
      </View>

      {/* Grade Tabs */}
      <View className="flex-row px-6 py-3 bg-white border-b border-gray-100 gap-2">
        {GRADE_TABS.map(g => (
          <TouchableOpacity key={g} onPress={() => setActiveGrade(g)}
            className={`px-4 py-1.5 rounded-full ${activeGrade === g ? 'bg-bright-blue' : 'bg-gray-100'}`}
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: activeGrade === g ? 'white' : '#6B7280' }}>
              {g === 'All' ? 'All' : `Grade ${g}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.examScheduleId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          const tc = TYPE_COLORS[item.type] ?? { bg: '#F3F4F6', text: '#6B7280' };
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 border border-gray-100"
              onPress={() => router.push(`/admin/exam-schedules/${item.examScheduleId}` as any)}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center">
                    <Ionicons name="document-text" size={20} color="#F97316" />
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm">{item.type} Exam</Text>
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{item.term} · {item.schoolYear}</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: tc.bg }} className="px-3 py-1 rounded-full">
                  <Text style={{ fontFamily: 'Poppins-SemiBold', color: tc.text, fontSize: 11 }}>{item.type}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="layers-outline" size={13} color="#9CA3AF" />
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Grade {item.grade}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
