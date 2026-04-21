import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { feeDetailService } from '../../../services/fee.service';
import { FeeDetailResponse } from '../../../types/fee';
import { getErrorMessage } from '../../../utils/error';

export default function StudentFeesScreen() {
  const [fees, setFees] = useState<FeeDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const loadFees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await feeDetailService.getMyFees({
        schoolYear: 2026, // Matching the standard year used in other modules
        pageSize: 50
      });
      setFees(response.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFees();
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      
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
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-lg">Học phí & Lệ phí</Text>
          <View className="w-10" />
        </View>

        {/* Payment Stepper - Modern Version */}
        <View className="mt-8 flex-row items-center justify-center px-4">
          <StepItem active completed icon="list" label="Danh sách" />
          <View className="flex-1 h-[2px] bg-blue-100 mx-2" />
          <StepItem icon="card" label="Thanh toán" />
          <View className="flex-1 h-[2px] bg-gray-100 mx-2" />
          <StepItem icon="checkmark-circle" label="Hoàn tất" />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
      >
        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : fees.length === 0 ? (
          <EmptyState />
        ) : (
          fees.map((item) => <FeeCard key={item.id} data={item} />)
        )}
      </ScrollView>

      {/* Modern Information Banner */}
      <View 
        className="absolute bottom-6 left-6 right-6 bg-white p-5 rounded-[24px] shadow-xl shadow-blue-100 border border-blue-50"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs uppercase tracking-wider">Tổng cần đóng</Text>
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-xl">
              {fees.reduce((acc, curr) => curr.status !== 'Đã đóng' ? acc + curr.amountDue : acc, 0).toLocaleString()} VNĐ
            </Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-600 px-6 py-3 rounded-2xl"
            onPress={() => {
              const pendingFee = fees.find(f => f.status !== 'Đã đóng');
              if (pendingFee) {
                router.push({
                  pathname: '/student/payment/payment-detail',
                  params: { id: pendingFee.id }
                });
              }
            }}
          >
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-xs">THANH TOÁN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function StepItem({ active, completed, icon, label }: any) {
  return (
    <View className="items-center">
      <View className={`w-10 h-10 rounded-full items-center justify-center ${active || completed ? 'bg-blue-600' : 'bg-gray-100'} shadow-sm`}>
        <Ionicons name={icon as any} size={18} color={active || completed ? 'white' : '#94A3B8'} />
      </View>
      <Text 
        style={{ fontFamily: active ? 'Poppins-Bold' : 'Poppins-Medium', fontSize: 10 }} 
        className={`mt-2 ${active ? 'text-blue-600' : 'text-gray-400'}`}
      >
        {label}
      </Text>
    </View>
  );
}

function FeeCard({ data }: { data: FeeDetailResponse }) {
  const isPaid = data.status === 'Đã đóng';
  
  return (
    <TouchableOpacity 
      onPress={() => router.push({
        pathname: '/student/payment/payment-detail',
        params: { id: data.id }
      })}
      className="bg-white rounded-[28px] p-5 mb-4 shadow-sm shadow-gray-100 border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-base leading-tight">
            {data.reason}
          </Text>
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs mt-1">
            Năm học {data.schoolYear}
          </Text>
        </View>
        <View className={`px-4 py-1.5 rounded-full ${isPaid ? 'bg-green-50' : 'bg-red-50'}`}>
          <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10 }} className={isPaid ? 'text-green-600' : 'text-red-600'}>
            {isPaid ? 'ĐÃ ĐÓNG' : 'CHƯA ĐÓNG'}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center py-4 border-t border-gray-50">
        <View>
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-widest">Số tiền</Text>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-lg">
            {data.amountDue.toLocaleString()} <Text className="text-sm font-normal text-gray-400">VNĐ</Text>
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </View>

      {isPaid && data.paidAt && (
        <View className="bg-gray-50/80 rounded-2xl p-3 mt-1">
          <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11 }} className="text-gray-500">
            Thanh toán lúc: <Text className="text-gray-800">{new Date(data.paidAt).toLocaleDateString()}</Text>
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
        <Ionicons name="card-outline" size={32} color="#CBD5E1" />
      </View>
      <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-lg">Không có khoản phí nào</Text>
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-center mt-2 px-10">
        Hiện tại bạn không có khoản học phí hay lệ phí nào cần thanh toán.
      </Text>
    </View>
  );
}

