import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ExamData {
  id: string;
  subject: string;
  time: string;
  date: string;
  totalMark: number;
  passMark: number;
}

const examData: ExamData[] = [
  { id: '1', subject: 'Maths', time: '9 am - 12 am', date: '12.03.2024', totalMark: 100, passMark: 35 },
  { id: '2', subject: 'English', time: '9 am - 12 am', date: '13.03.2024', totalMark: 100, passMark: 35 },
  { id: '3', subject: 'Science', time: '9 am - 12 am', date: '14.03.2024', totalMark: 100, passMark: 35 },
  { id: '4', subject: 'Social Science', time: '9 am - 12 am', date: '16.03.2024', totalMark: 100, passMark: 35 },
  { id: '5', subject: 'Computer Science', time: '9 am - 12 am', date: '18.03.2024', totalMark: 100, passMark: 35 },
];

export default function ExamScheduleScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 relative">
          <TouchableOpacity 
              className="absolute left-6 z-10 p-2"
              onPress={() => router.back()}
          >
              <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
              <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Exam Schedule</Text>
          </View>
          <View className="w-10" /> 
      </View>

      <ScrollView className="flex-1 px-6 pt-4 pb-10" showsVerticalScrollIndicator={false}>
          {examData.map((item) => (
              <ExamCard key={item.id} data={item} />
          ))}
          <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}

function ExamCard({ data }: { data: ExamData }) {
    return (
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden flex-row">
            {/* Blue Accent Line */}
            <View className="w-1.5 bg-[#136ADA] h-full" />
            
            <View className="flex-1 p-5 pl-4">
                {/* Header Row: Subject and Date */}
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>{data.subject}</Text>
                    <Text className="text-red-500 text-sm" style={{ fontFamily: 'Poppins-Bold' }}>{data.date}</Text>
                </View>

                {/* Time */}
                <Text className="text-gray-400 text-xs mb-3" style={{ fontFamily: 'Poppins-Regular' }}>{data.time}</Text>

                {/* Divider */}
                <View className="h-[1px] bg-gray-200 w-full mb-3" />

                {/* Marks Row */}
                <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>
                        Total Mark : <Text className="text-black">{data.totalMark}</Text>
                    </Text>
                    <Text className="text-gray-600 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>
                        Pass Mark : <Text className="text-black">{data.passMark}</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
}
