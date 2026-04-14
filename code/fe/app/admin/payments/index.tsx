import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState } from 'react';

const MOCK_PAYMENTS = [
  { paymentId: '1', userName: 'Le Van Minh', amount: 2500000, type: 'fee', status: 'success', createdAt: '2025-09-10T08:30:00', orderCode: 'FEE2025-101' },
  { paymentId: '2', userName: 'Tran Thi Mai', amount: 500000, type: 'course', status: 'success', createdAt: '2025-09-12T14:20:00', orderCode: 'CRS-001-992' },
  { paymentId: '3', userName: 'Nguyen Van Admin', amount: 450000, type: 'course', status: 'pending', createdAt: '2025-09-15T09:15:00', orderCode: 'CRS-002-331' },
  { paymentId: '4', userName: 'Le Van Minh', amount: 600000, type: 'course', status: 'failed', createdAt: '2025-09-16T10:05:00', orderCode: 'CRS-003-882' },
  { paymentId: '5', userName: 'Hoang Van Nam', amount: 2500000, type: 'fee', status: 'success', createdAt: '2025-09-17T11:45:00', orderCode: 'FEE2025-102' },
  { paymentId: '6', userName: 'Le Van Minh', amount: 200000, type: 'fee', status: 'success', createdAt: '2025-09-18T16:20:00', orderCode: 'FEE2025-103' },
];

const STATUS_CONFIG: any = {
  success: { color: '#22C55E', bg: '#F0FDF4', label: 'Thành công', icon: 'checkmark-circle' },
  pending: { color: '#F97316', bg: '#FFF7ED', label: 'Đang xử lý', icon: 'time' },
  failed:  { color: '#EF4444', bg: '#FEF2F2', label: 'Thất bại',  icon: 'close-circle' },
};

export default function AdminPaymentsScreen() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_PAYMENTS.filter(p => {
    const matchStatus = activeStatus === 'All' || p.status === activeStatus;
    const matchSearch = p.userName.toLowerCase().includes(search.toLowerCase()) || p.orderCode.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminPageWrapper
      title="Lịch sử Giao dịch"
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm tên hoặc mã giao dịch...",
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {/* Filter Status Section */}
      <View className="bg-white border-b border-gray-50 pb-2">
        <FlatList
          horizontal
          data={['All', 'success', 'pending', 'failed']}
          renderItem={({ item: status }) => (
            <TouchableOpacity
              key={status} 
              onPress={() => setActiveStatus(status)}
              className={`px-5 py-2.5 rounded-2xl border ${activeStatus === status ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'} ml-2`}
              style={{ marginLeft: status === 'All' ? 24 : 8 }}
            >
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 11, color: activeStatus === status ? '#1D4ED8' : '#9CA3AF' }}>
                {status === 'All' ? 'TẤT CẢ' : status === 'success' ? 'THÀNH CÔNG' : status === 'pending' ? 'ĐANG XỬ LÝ' : 'THẤT BẠI'}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.paymentId}
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <View className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16 }} className="text-black mb-1">{item.userName}</Text>
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <View className="bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10, color: '#9CA3AF' }}>{item.orderCode}</Text>
                    </View>
                    <View className="bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10, color: '#6366F1' }}>{item.type.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1.5 rounded-2xl flex-row items-center gap-1.5 border border-gray-100/20">
                  <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
                  <Text style={{ fontFamily: 'Poppins-Bold', color: cfg.color, fontSize: 10 }}>{cfg.label.toUpperCase()}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-end border-t border-gray-50 pt-4">
                 <View>
                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 10 }} className="text-gray-400 mb-1">Thời gian</Text>
                    <View className="flex-row items-center gap-1.5">
                       <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                       <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 11 }} className="text-gray-600">{formatDate(item.createdAt)}</Text>
                    </View>
                 </View>
                 <View className="bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100/50">
                    <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA', fontSize: 18 }}>{fmt(item.amount)}</Text>
                 </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
            <Ionicons name="card-outline" size={64} color="#D1D5DB" />
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-4 text-center px-10">
              Không tìm thấy giao dịch nào.{"\n"}Hãy thử điều chỉnh bộ lọc.
            </Text>
          </View>
        }
        ListFooterComponent={<View className="h-20 bg-white" />}
      />
    </AdminPageWrapper>
  );
}
