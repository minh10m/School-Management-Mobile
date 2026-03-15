import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const MOCK_EXAM_DETAILS: Record<string, any> = {
  '1': {
    type: 'Midterm', term: 'HK1', schoolYear: '2025-2026', grade: 10,
    details: [
      { subject: 'Mathematics',  teacher: 'Tran Thi Mai', date: '2025-10-15', startTime: '07:30', finishTime: '09:00', roomName: 'P.101' },
      { subject: 'Physics',      teacher: 'Do Van Duc',   date: '2025-10-16', startTime: '07:30', finishTime: '09:00', roomName: 'P.102' },
      { subject: 'Chemistry',    teacher: 'Pham Thi Lan', date: '2025-10-17', startTime: '07:30', finishTime: '09:00', roomName: 'P.103' },
      { subject: 'Literature',   teacher: 'Nguyen Thi Hoa', date: '2025-10-18', startTime: '07:30', finishTime: '09:00', roomName: 'P.104' },
      { subject: 'English',      teacher: 'Le Van Nam',   date: '2025-10-20', startTime: '07:30', finishTime: '09:00', roomName: 'P.101' },
    ],
  },
};

export default function AdminExamScheduleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = MOCK_EXAM_DETAILS[id ?? '1'] ?? MOCK_EXAM_DETAILS['1'];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">{data.type} Exam · Grade {data.grade}</Text>
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{data.term} · {data.schoolYear}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {data.details.map((item: any, index: number) => (
          <View key={index} className="bg-white rounded-2xl p-4 border border-gray-100 mb-3">
            <View className="flex-row justify-between items-start mb-2">
              <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">{item.subject}</Text>
              <View className="bg-blue-50 px-3 py-1 rounded-full">
                <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#136ADA', fontSize: 11 }}>{item.roomName}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-xs">{item.date}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-xs">{item.startTime} – {item.finishTime}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="person-outline" size={13} color="#9CA3AF" />
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-xs">{item.teacher}</Text>
            </View>
          </View>
        ))}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
