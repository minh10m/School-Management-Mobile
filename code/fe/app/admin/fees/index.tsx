import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from 'react';
import { feeService } from "../../../services/fee.service";
import { FeeResponse } from "../../../types/fee";
import { SCHOOL_YEAR } from "../../../constants/config";

export default function AdminFeesScreen() {
  const router = useRouter();
  const [fees, setFees] = useState<FeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchFees = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await feeService.getFees({
        schoolYear: parseInt(SCHOOL_YEAR, 10),
        pageNumber: 1,
        pageSize: 100,
      });
      setFees(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFees();
  };

  const filtered = fees.filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    f.className.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + ' VNĐ';

  return (
    <AdminPageWrapper 
      title="Quản lý Học phí"
      rightComponent={
        <TouchableOpacity
          onPress={() => {}}
          className="bg-blue-600 px-5 py-2.5 rounded-2xl shadow-sm shadow-blue-100"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-xs uppercase tracking-widest">Tạo mới</Text>
        </TouchableOpacity>
      }
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm khoản phí...",
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />
          }
          renderItem={({ item }) => {
            const overdue = new Date(item.dueDate) < new Date();
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm"
                onPress={() => router.push(`/admin/fees/${item.id}` as any)}
              >
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18 }} className="text-[#1E293B] mb-1.5 leading-tight">
                      {item.title}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                        <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA', fontSize: 10 }}>
                          LỚP {item.className}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] tracking-wide">
                        NIÊN KHÓA {item.schoolYear}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-indigo-50/50 px-3 py-2 rounded-2xl border border-indigo-100">
                    <Text style={{ fontFamily: 'Poppins-Bold', color: '#6366F1', fontSize: 15 }}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-4 border-t border-gray-50/50">
                  <View className="flex-row items-center gap-1.5">
                    <View className={`${overdue ? 'bg-red-50' : 'bg-gray-50'} px-3 py-1.5 rounded-xl flex-row items-center gap-2`}>
                      <Ionicons name="calendar-outline" size={12} color={overdue ? '#EF4444' : '#64748B'} />
                      <Text style={{ fontFamily: 'Poppins-Bold', color: overdue ? '#EF4444' : '#64748B', fontSize: 10 }}>
                        {overdue ? 'QUÁ HẠN' : 'HẠN NỘP'}: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11 }} className="text-[#136ADA] uppercase tracking-wider">Học sinh</Text>
                    <Ionicons name="chevron-forward" size={14} color="#136ADA" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-100 mx-6">
              <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="card-outline" size={32} color="#CBD5E1" />
              </View>
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-lg">Không có khoản phí nào</Text>
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-2 text-center px-10 leading-5">
                Chưa có dữ liệu học phí cho năm học này.{"\n"}Nhấn "Tạo mới" để bắt đầu.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminPageWrapper>
  );
}

