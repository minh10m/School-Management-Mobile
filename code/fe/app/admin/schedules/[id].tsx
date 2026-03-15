import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const MOCK_DETAILS: Record<string, any> = {
  '1': {
    name: 'HK1 Schedule', className: '10A1', term: 'HK1', schoolYear: '2025-2026',
    timetable: {
      Monday: [
        { subject: 'Mathematics', teacher: 'Tran Thi Mai', start: '07:00', end: '08:30' },
        { subject: 'Physics', teacher: 'Do Van Duc', start: '09:00', end: '10:30' },
      ],
      Tuesday: [
        { subject: 'Literature', teacher: 'Nguyen Thi Hoa', start: '07:00', end: '08:30' },
        { subject: 'English', teacher: 'Le Van Nam', start: '09:00', end: '10:30' },
      ],
      Wednesday: [
        { subject: 'Chemistry', teacher: 'Pham Thi Lan', start: '07:00', end: '08:30' },
      ],
      Thursday: [
        { subject: 'History', teacher: 'Vo Thi Bich', start: '07:00', end: '08:30' },
        { subject: 'Mathematics', teacher: 'Tran Thi Mai', start: '09:00', end: '10:30' },
      ],
      Friday: [
        { subject: 'Physical Education', teacher: 'Phan Van Hung', start: '07:00', end: '09:00' },
      ],
    },
  },
};

const SUBJECT_COLORS = ['bg-purple-100', 'bg-blue-100', 'bg-teal-100', 'bg-orange-100', 'bg-yellow-100', 'bg-pink-100'];

export default function AdminScheduleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = MOCK_DETAILS[id ?? '1'] ?? MOCK_DETAILS['1'];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">{data.className}</Text>
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{data.term} · {data.schoolYear}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {DAYS.map((day, di) => {
          const sessions = data.timetable[day] ?? [];
          return (
            <View key={day} className="mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-2 h-2 rounded-full bg-bright-blue" />
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{day}</Text>
                {sessions.length === 0 && (
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-300 text-xs">— no sessions</Text>
                )}
              </View>
              {sessions.map((s: any, si: number) => (
                <View key={si} className={`${SUBJECT_COLORS[(di * 2 + si) % SUBJECT_COLORS.length]} rounded-2xl p-3 mb-2 ml-4`}>
                  <View className="flex-row items-center justify-between">
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm">{s.subject}</Text>
                    <View className="bg-white/60 px-2 py-0.5 rounded-full">
                      <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 10 }} className="text-gray-600">{s.start} - {s.end}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="person-outline" size={12} color="#6B7280" />
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-xs">{s.teacher}</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
