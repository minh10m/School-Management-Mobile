import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { AdminLayout } from "../../../components/ui/AdminLayout";

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
    <AdminLayout 
      title="Quản lý Học phí"
      rightComponent={
        <TouchableOpacity
          onPress={() => {}}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-xs">Tạo mới</Text>
        </TouchableOpacity>
      }
      searchProps={{
        value: "",
        onChangeText: () => {},
        placeholder: "Tìm kiếm khoản phí...",
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={MOCK_FEES}
        keyExtractor={item => item.feeId}
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const pct = Math.round((item.paidCount / item.totalCount) * 100);
          const overdue = new Date(item.dueDate) < new Date();
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm"
              onPress={() => router.push(`/admin/fees/${item.feeId}` as any)}
            >
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-black mb-1">{item.title}</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                      <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA', fontSize: 10 }}>LỚP {item.className}</Text>
                    </View>
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px]">{item.schoolYear}</Text>
                  </View>
                </View>
                <View className="bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-100">
                  <Text style={{ fontFamily: 'Poppins-Bold', color: '#6366F1', fontSize: 14 }}>{fmt(item.amount)}</Text>
                </View>
              </View>

              {/* Progress Bar Section */}
              <View className="bg-gray-50/50 p-4 rounded-2xl mb-4 border border-gray-100/50">
                <View className="flex-row justify-between mb-2 items-center">
                  <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[11px]">
                    Tiến độ: <Text className="text-black font-bold">{item.paidCount}/{item.totalCount}</Text>
                  </Text>
                  <Text style={{ fontFamily: 'Poppins-Bold', color: pct === 100 ? '#16A34A' : '#136ADA', fontSize: 12 }}>{pct}%</Text>
                </View>
                <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-[#136ADA]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <View className={`${overdue ? 'bg-red-50' : 'bg-gray-50'} px-2.5 py-1 rounded-lg flex-row items-center gap-1`}>
                    <Ionicons name="calendar-outline" size={12} color={overdue ? '#EF4444' : '#9CA3AF'} />
                    <Text style={{ fontFamily: 'Poppins-Bold', color: overdue ? '#EF4444' : '#9CA3AF', fontSize: 10 }}>
                      HẠN: {item.dueDate}{overdue ? ' · QUÁ HẠN' : ''}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11 }} className="text-[#136ADA]">Chi tiết</Text>
                  <Ionicons name="chevron-forward" size={14} color="#136ADA" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={<View className="h-20 bg-white" />}
      />
    </AdminLayout>
  );
}
