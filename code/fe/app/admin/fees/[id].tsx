import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AdminPageWrapper } from '../../../components/ui/AdminPageWrapper';

const MOCK_FEE_DETAILS: Record<string, any> = {
  '1': {
    title: 'Học phí HK1', amount: 2500000, dueDate: '2025-09-30', className: '10A1',
    students: [
      { id: 's1', name: 'Le Van Minh',     status: 'paid',   amountDue: 2500000, paidAt: '2025-09-10' },
      { id: 's2', name: 'Nguyen Thi Lan',  status: 'paid',   amountDue: 2500000, paidAt: '2025-09-12' },
      { id: 's3', name: 'Tran Van An',     status: 'unpaid', amountDue: 2500000, paidAt: null },
      { id: 's4', name: 'Pham Thi Bich',   status: 'paid',   amountDue: 2000000, paidAt: '2025-09-05' },
      { id: 's5', name: 'Hoang Van Nam',   status: 'unpaid', amountDue: 2500000, paidAt: null },
      { id: 's6', name: 'Do Thi Huong',    status: 'paid',   amountDue: 2500000, paidAt: '2025-09-08' },
      { id: 's7', name: 'Vu Van Long',     status: 'unpaid', amountDue: 2500000, paidAt: null },
    ],
  },
};

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export default function AdminFeeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = MOCK_FEE_DETAILS[id ?? '1'] ?? MOCK_FEE_DETAILS['1'];

  const paidCount = data.students.filter((s: any) => s.status === 'paid').length;
  const pct = Math.round((paidCount / data.students.length) * 100);

  return (
    <AdminPageWrapper
      title={data.title}
    >

      {/* Summary card */}
      <View className="mx-4 mt-4 mb-2 bg-bright-blue rounded-2xl p-4">
        <View className="flex-row justify-between mb-3">
          <View>
            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs">Amount</Text>
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-xl">{fmt(data.amount)}</Text>
          </View>
          <View className="items-end">
            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs">Class</Text>
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white text-base">{data.className}</Text>
          </View>
        </View>
        <View className="mb-1 flex-row justify-between">
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/70 text-xs">{paidCount}/{data.students.length} students paid</Text>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-xs">{pct}%</Text>
        </View>
        <View className="h-2 bg-white/30 rounded-full overflow-hidden">
          <View className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
        </View>
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-white/60 text-xs mt-2">Due: {data.dueDate}</Text>
      </View>

      {/* Student list */}
      <FlatList
        data={data.students}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListHeaderComponent={
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-500 text-xs mb-1">STUDENTS</Text>
        }
        renderItem={({ item }: any) => (
          <View className="bg-white rounded-2xl px-4 py-3 border border-gray-100 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA', fontSize: 13 }}>{item.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{item.name}</Text>
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{fmt(item.amountDue)}</Text>
            </View>
            {item.status === 'paid' ? (
              <View className="bg-green-50 px-2 py-1 rounded-full flex-row items-center gap-1">
                <Ionicons name="checkmark-circle" size={13} color="#22C55E" />
                <Text style={{ fontFamily: 'Poppins-Medium', color: '#22C55E', fontSize: 11 }}>Paid</Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-red-50 px-2 py-1 rounded-full flex-row items-center gap-1"
                onPress={() => Alert.alert('Exempt Fee', `Reduce fee for ${item.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Update', onPress: () => {} }])}
              >
                <Ionicons name="time-outline" size={13} color="#EF4444" />
                <Text style={{ fontFamily: 'Poppins-Medium', color: '#EF4444', fontSize: 11 }}>Unpaid</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </AdminPageWrapper>
  );
}
