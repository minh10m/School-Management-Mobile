import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TeacherScheduleDetailItem } from '../../../types/schedule';
import { scheduleService } from '../../../services/schedule.service';

export default function TeacherSchedules() {
  const [schedules, setSchedules] = useState<TeacherScheduleDetailItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getMyTeachingSchedule({ Term: 1, SchoolYear: 2026 });
      setSchedules(data || []);
    } catch (error) {
      console.error('Failed to fetch teacher schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Group schedules by dayOfWeek
  const groupedSchedulesObj = schedules.reduce((acc, current) => {
    const dayName = current.dayOfWeekVietNamese || `Day ${current.dayOfWeek}`;
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    if (!acc[current.dayOfWeek]) {
      acc[current.dayOfWeek] = {
        name: capitalizedDay,
        items: []
      };
    }
    acc[current.dayOfWeek].items.push(current);
    return acc;
  }, {} as Record<number, { name: string, items: TeacherScheduleDetailItem[] }>);

  // Convert to array and sort by dayOfWeek
  const sortedDays = Object.keys(groupedSchedulesObj)
    .map(Number)
    .sort((a, b) => a - b)
    .map(dayKey => {
      const group = groupedSchedulesObj[dayKey];
      group.items.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      return group;
    });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">My Schedule</Text>
        <View className="w-6" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : schedules.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
             <Ionicons name="calendar-clear-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg text-center">
            No Schedule Found
          </Text>
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 mt-2 text-center">
            You don't have any teaching schedules currently assigned.
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          {sortedDays.map((group) => (
            <View key={group.name} className="mb-8">
              <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-bright-blue text-lg mb-4">
                {group.name}
              </Text>
              <View className="gap-3">
                {group.items.map((item) => (
                  <View key={item.scheduleDetailId} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-center">
                    <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mr-4">
                      <Ionicons name="time-outline" size={24} color="#6366F1" />
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">
                        {item.subjectName}
                      </Text>
                      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mt-0.5">
                        Class:  <Text className="text-indigo-600">{item.className}</Text>
                      </Text>
                    </View>
                    <View className="items-end bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-600 text-[11px]">
                        {item.timeRange ? item.timeRange.split(' - ')[0] : (item.startTime ? item.startTime.slice(0, 5) : "--")}
                      </Text>
                      <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-400 text-[9px] mt-0.5 text-center">
                        to 
                      </Text>
                      <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-600 text-[11px] mt-0.5">
                        {item.timeRange ? item.timeRange.split(' - ')[1] : (item.finishTime ? item.finishTime.slice(0, 5) : "--")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
