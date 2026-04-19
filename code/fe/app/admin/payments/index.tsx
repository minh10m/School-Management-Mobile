import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../../../services/payment.service';
import { PaymentHistoryResponse } from '../../../types/payment';

const STATUS_CONFIG: any = {
  'Đã đóng': { color: '#16A34A', bg: '#F0FDF4', label: 'Thành công', icon: 'checkmark-circle' },
  'Chưa đóng': { color: '#D97706', bg: '#FFFBEB', label: 'Chưa thanh toán', icon: 'time' },
  'success': { color: '#16A34A', bg: '#F0FDF4', label: 'Thành công', icon: 'checkmark-circle' },
  'pending': { color: '#D97706', bg: '#FFFBEB', label: 'Chưa thanh toán', icon: 'time' },
  'failed':  { color: '#DC2626', bg: '#FEF2F2', label: 'Thất bại',  icon: 'close-circle' },
};

export default function AdminPaymentsScreen() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  
  const [payments, setPayments] = useState<PaymentHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      // Giả sử API hỗ trợ GET /api/payments cho role Admin
      const data = await paymentService.getAllPayments({ pageNumber: 1, pageSize: 100 });
      setPayments(data || []);
    } catch (err) {
      console.error(err);
      // Fallback cho tới khi BE hỗ trợ API này
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const filtered = payments.filter((p: any) => {
    const matchStatus = activeStatus === 'All' || p.status === activeStatus;
    const matchSearch = p.userName?.toLowerCase().includes(search.toLowerCase()) || p.orderCode?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatCurrency = (n: number) => n?.toLocaleString('vi-VN') + ' VNĐ';
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
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
      <View className="bg-white border-b border-gray-50/50 pb-2">
        <FlatList
          horizontal
          data={['All', 'success', 'pending', 'failed']}
          renderItem={({ item: status }) => (
            <TouchableOpacity
              key={status} 
              onPress={() => setActiveStatus(status)}
              className={`px-6 py-2.5 rounded-2xl border ${activeStatus === status ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'} ml-2`}
              style={{ marginLeft: status === 'All' ? 24 : 8 }}
            >
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 11, color: activeStatus === status ? '#1D4ED8' : '#94A3B8' }}>
                {status === 'All' ? 'TẤT CẢ' : status === 'success' ? 'THÀNH CÔNG' : status === 'pending' ? 'ĐANG XỬ LÝ' : 'THẤT BẠI'}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.paymentId}
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D4ED8" />
          }
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['pending'];
            return (
              <View className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                <View className="flex-row justify-between items-start mb-5">
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18 }} className="text-[#1E293B] mb-1.5 leading-tight">{item.userName}</Text>
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <View className="bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10, color: '#94A3B8' }}>{item.orderCode}</Text>
                      </View>
                      <View className="bg-indigo-50/50 px-2.5 py-1 rounded-xl border border-indigo-100/50">
                        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10, color: '#6366F1' }}>{item.type?.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1.5 rounded-2xl flex-row items-center gap-1.5 border border-gray-100/10">
                    <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
                    <Text style={{ fontFamily: 'Poppins-Bold', color: cfg.color, fontSize: 10 }}>{cfg.label.toUpperCase()}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-5 border-t border-gray-50/50">
                   <View>
                      <View className="flex-row items-center gap-1.5">
                         <Ionicons name="time-outline" size={14} color="#94A3B8" />
                         <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: '#64748B' }}>{formatDate(item.createdAt)}</Text>
                      </View>
                   </View>
                   <View className="bg-blue-50/50 px-4 py-2 rounded-[20px] border border-blue-100/50">
                      <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA', fontSize: 18 }}>{formatCurrency(item.amount)}</Text>
                   </View>
                </View>
              </View>
            );
          }}
        ListEmptyComponent={
          <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-100 mx-6">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="card-outline" size={32} color="#CBD5E1" />
            </View>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-lg">Không có giao dịch nào</Text>
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-2 text-center px-10 leading-5">
              Chưa tìm thấy lịch sử thanh toán phù hợp với tiêu chí lọc.
            </Text>
          </View>
        }
        ListFooterComponent={<View className="h-20 bg-white" />}
      />
      )}
    </AdminPageWrapper>
  );
}

