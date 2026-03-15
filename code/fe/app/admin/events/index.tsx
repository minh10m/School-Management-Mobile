import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const MOCK_EVENTS = [
  { eventId: '1', title: 'Sports Day 2025', body: 'Toàn trường tham gia đại hội thể thao tại sân vận động.', startTime: '2025-11-03T07:00:00', finishTime: '2025-11-03T17:00:00', schoolYear: '2025-2026', term: 'HK1' },
  { eventId: '2', title: 'Lễ khai giảng', body: 'Lễ khai giảng năm học mới 2025-2026.', startTime: '2025-09-05T07:30:00', finishTime: '2025-09-05T11:00:00', schoolYear: '2025-2026', term: 'HK1' },
  { eventId: '3', title: 'Hội diễn văn nghệ', body: 'Chào mừng ngày nhà giáo Việt Nam 20-11.', startTime: '2025-11-19T18:00:00', finishTime: '2025-11-19T21:30:00', schoolYear: '2025-2026', term: 'HK1' },
  { eventId: '4', title: 'Hội trại 26-3', body: 'Kỷ niệm ngày thành lập Đoàn TNCS Hồ Chí Minh.', startTime: '2026-03-24T06:00:00', finishTime: '2026-03-26T12:00:00', schoolYear: '2025-2026', term: 'HK2' },
];

export default function AdminEventsScreen() {
  const [activeTerm, setActiveTerm] = useState('All');

  const filtered = MOCK_EVENTS.filter(e => activeTerm === 'All' || e.term === activeTerm);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Events Management</Text>
        <TouchableOpacity onPress={() => router.push('/admin/events/create' as any)}>
          <Ionicons name="add-circle-outline" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      <View className="flex-row px-6 py-3 bg-white border-b border-gray-100 gap-2">
        {['All', 'HK1', 'HK2'].map(term => (
          <TouchableOpacity
            key={term} onPress={() => setActiveTerm(term)}
            className={`px-4 py-1.5 rounded-full ${activeTerm === term ? 'bg-bright-blue' : 'bg-gray-100'}`}
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: activeTerm === term ? 'white' : '#6B7280' }}>
              {term}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.eventId}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            onPress={() => router.push({ pathname: '/admin/events/create', params: { id: item.eventId } } as any)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">{item.title}</Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">
                    {formatDate(item.startTime)} {item.startTime.split('T')[0] !== item.finishTime.split('T')[0] ? ` - ${formatDate(item.finishTime)}` : ''}
                  </Text>
                </View>
              </View>
              <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#136ADA', fontSize: 10 }}>{item.term}</Text>
              </View>
            </View>

            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-sm mb-3" numberOfLines={2}>
              {item.body}
            </Text>

            <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={14} color="#136ADA" />
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-bright-blue text-xs">
                  {formatTime(item.startTime)} — {formatTime(item.finishTime)}
                </Text>
              </View>
              <Ionicons name="create-outline" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
