import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const MOCK_SCHEDULES = [
  { scheduleId: '1', name: 'HK1 Schedule', className: '10A1', term: 'HK1', schoolYear: '2025-2026' },
  { scheduleId: '2', name: 'HK1 Schedule', className: '10A2', term: 'HK1', schoolYear: '2025-2026' },
  { scheduleId: '3', name: 'HK1 Schedule', className: '11A1', term: 'HK1', schoolYear: '2025-2026' },
  { scheduleId: '4', name: 'HK2 Schedule', className: '10A1', term: 'HK2', schoolYear: '2025-2026' },
  { scheduleId: '5', name: 'HK2 Schedule', className: '11A1', term: 'HK2', schoolYear: '2025-2026' },
];

const TERM_COLORS: Record<string, { bg: string; text: string }> = {
  HK1: { bg: '#EFF6FF', text: '#136ADA' },
  HK2: { bg: '#F0FDF4', text: '#22C55E' },
};

export default function AdminSchedulesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Schedule Management</Text>
      </View>

      <FlatList
        data={MOCK_SCHEDULES}
        keyExtractor={item => item.scheduleId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListHeaderComponent={
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs mb-1">{MOCK_SCHEDULES.length} schedules</Text>
        }
        renderItem={({ item }) => {
          const tc = TERM_COLORS[item.term] ?? { bg: '#F3F4F6', text: '#6B7280' };
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 border border-gray-100"
              onPress={() => router.push(`/admin/schedules/${item.scheduleId}` as any)}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-10 h-10 bg-teal-100 rounded-xl items-center justify-center">
                    <Ionicons name="calendar" size={20} color="#14B8A6" />
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm">{item.className}</Text>
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{item.name}</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: tc.bg }} className="px-3 py-1 rounded-full">
                  <Text style={{ fontFamily: 'Poppins-SemiBold', color: tc.text, fontSize: 11 }}>{item.term}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="school-outline" size={13} color="#9CA3AF" />
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{item.schoolYear}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
