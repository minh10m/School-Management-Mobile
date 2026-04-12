import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const MOCK_FEES = [
  { feeId: '1', title: 'Học phí HK1', amount: 2500000, dueDate: '2025-09-30', className: '10A1', schoolYear: '2025-2026', paidCount: 28, totalCount: 35 },
  { feeId: '2', title: 'Học phí HK1', amount: 2500000, dueDate: '2025-09-30', className: '10A2', schoolYear: '2025-2026', paidCount: 30, totalCount: 33 },
  { feeId: '3', title: 'Quỹ lớp',     amount: 200000,  dueDate: '2025-09-15', className: '10A1', schoolYear: '2025-2026', paidCount: 35, totalCount: 35 },
  { feeId: '4', title: 'Học phí HK2', amount: 2500000, dueDate: '2026-02-28', className: '11A1', schoolYear: '2025-2026', paidCount: 10, totalCount: 36 },
  { feeId: '5', title: 'Phí cơ sở vật chất', amount: 500000, dueDate: '2025-10-15', className: '12A1', schoolYear: '2025-2026', paidCount: 18, totalCount: 30 },
];

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export default function AdminFeesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Quản lý Học phí</Text>
      </View>

      <FlatList
        data={MOCK_FEES}
        keyExtractor={item => item.feeId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          const pct = Math.round((item.paidCount / item.totalCount) * 100);
          const overdue = new Date(item.dueDate) < new Date();
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 border border-gray-100"
              onPress={() => router.push(`/admin/fees/${item.feeId}` as any)}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm mb-0.5">{item.title}</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                      <Text style={{ fontFamily: 'Poppins-Medium', color: '#136ADA', fontSize: 10 }}>{item.className}</Text>
                    </View>
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{item.schoolYear}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA' }} className="text-base">{fmt(item.amount)}</Text>
              </View>

              {/* Progress Bar */}
              <View className="mb-2">
                <View className="flex-row justify-between mb-1">
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">
                    {item.paidCount}/{item.totalCount} đã đóng
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-SemiBold', color: pct === 100 ? '#22C55E' : '#136ADA', fontSize: 11 }}>{pct}%</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${pct === 100 ? 'bg-green-400' : 'bg-bright-blue'}`}
                    style={{ width: `${pct}%` }}
                  />
                </View>
              </View>

              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={12} color={overdue ? '#EF4444' : '#9CA3AF'} />
                <Text style={{ fontFamily: 'Poppins-Regular', color: overdue ? '#EF4444' : '#9CA3AF', fontSize: 11 }}>
                  Hạn: {item.dueDate}{overdue ? ' · QUÁ HẠN' : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
