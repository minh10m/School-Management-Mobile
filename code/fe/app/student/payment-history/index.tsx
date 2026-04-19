import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paymentService } from "../../../services/payment.service";
import { PaymentHistoryResponse } from "../../../types/payment";

export default function StudentPaymentHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<PaymentHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await paymentService.getMyPayments();
      setPayments(data);
    } catch (err) {
      console.error(err);
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

  const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + ' VNĐ';
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã đóng':
      case 'success':
      case 'paid':
        return { bg: 'bg-green-50', text: 'text-green-600', icon: 'checkmark-circle' };
      case 'chưa đóng':
      case 'pending':
        return { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'time' };
      case 'failed':
      case 'error':
        return { bg: 'bg-red-50', text: 'text-red-600', icon: 'close-circle' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', icon: 'help-circle' };
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Premium Header */}
      <View 
        className="bg-white px-6 pb-6 shadow-sm shadow-gray-200" 
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-lg">Lịch sử giao dịch</Text>
          <View className="w-10" />
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.paymentId}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 pr-2">
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-base mb-1" numberOfLines={2}>
                      {item.description || (item.type === 'Fee' ? 'Thanh toán học phí' : 'Thanh toán khóa học')}
                    </Text>
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-widest">
                      Mã: {item.orderCode}
                    </Text>
                  </View>
                  <View className={`${statusStyle.bg} px-3 py-1.5 rounded-2xl flex-row items-center gap-1 border border-white`}>
                    <Ionicons name={statusStyle.icon as any} size={12} color={statusStyle.text.replace('text-', '')} />
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10 }} className={statusStyle.text}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-end pt-4 border-t border-gray-50">
                  <View>
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase mb-1">Thời gian</Text>
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-[11px]">
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase mb-1">Số tiền</Text>
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#136ADA] text-lg">
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center px-10">
                Bạn chưa có giao dịch nào.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20" />}
        />
      )}
    </View>
  );
}
