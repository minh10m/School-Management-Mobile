import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  success: { color: '#22C55E', bg: '#F0FDF4', label: 'Success', icon: 'checkmark-circle' },
  pending: { color: '#F97316', bg: '#FFF7ED', label: 'Pending', icon: 'time' },
  failed:  { color: '#EF4444', bg: '#FEF2F2', label: 'Failed',  icon: 'close-circle' },
};

export default function AdminPaymentsScreen() {
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Transactions</Text>
      </View>

      <View className="px-6 py-3 bg-white">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-3 gap-2 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search by name or code..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 py-2 text-black text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View className="flex-row px-6 py-2 bg-white border-b border-gray-100 gap-2">
        {['All', 'success', 'pending', 'failed'].map(status => (
          <TouchableOpacity
            key={status} onPress={() => setActiveStatus(status)}
            className={`px-3 py-1.5 rounded-full ${activeStatus === status ? 'bg-bright-blue' : 'bg-gray-100'}`}
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: activeStatus === status ? 'white' : '#6B7280', textTransform: 'capitalize' }}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.paymentId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm">{item.userName}</Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px] mt-0.5">{item.orderCode} · {item.type.toUpperCase()}</Text>
                </View>
                <View style={{ backgroundColor: cfg.bg }} className="px-2 py-1 rounded-full flex-row items-center gap-1">
                  <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
                  <Text style={{ fontFamily: 'Poppins-Medium', color: cfg.color, fontSize: 10 }}>{cfg.label}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-end border-t border-gray-50 pt-3">
                 <View>
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px]">Date</Text>
                    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-[11px]">{formatDate(item.createdAt)}</Text>
                 </View>
                 <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA' }} className="text-base">{fmt(item.amount)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Ionicons name="card-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No transactions found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
