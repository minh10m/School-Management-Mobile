import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface FeeData {
  id: string;
  title: string;
  amount: string;
  status: 'pending' | 'completed';
  date: string;
}

const feeData: FeeData[] = [
  { id: '1', title: 'School Fee', amount: '18,800', status: 'pending', date: 'Due : 12.03.2024' },
  { id: '2', title: 'School Fee', amount: '18,800', status: 'completed', date: 'Due : 12.11.2023' },
  { id: '3', title: 'School Fee', amount: '18,800', status: 'completed', date: 'Due : 12.10.2023' },
];

export default function FeeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 relative">
          <TouchableOpacity 
              className="absolute left-6 z-10 p-2"
              onPress={() => router.back()}
          >
              <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
              <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Fee Payment</Text>
          </View>
          <View className="w-10" /> 
      </View>

      <View className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              
              {/* Stepper */}
              <View className="px-6 py-8 items-center justify-center">
                   <View className="flex-row items-center w-full justify-center px-10 relative">
                        {/* Dotted Line Background */}
                        <View className="flex-row justify-between w-full relative">
                            {/* Dotted Line Background */}
                            <View className="absolute w-full top-1/2 -z-10 border-t border-gray-400" style={{ borderStyle: 'dotted' }} />

                            {/* Step 1 - Active */}
                            <View className="items-center">
                                <View className="w-8 h-8 rounded-full border border-blue-500 items-center justify-center bg-white">
                                    <View className="w-4 h-4 rounded-full bg-blue-500" />
                                </View>
                            </View>

                             {/* Step 2 - Inactive */}
                             <View className="items-center">
                                <View className="w-8 h-8 rounded-full border border-gray-300 items-center justify-center bg-white">
                                    {/* Empty */}
                                </View>
                            </View>

                            {/* Step 3 - Inactive */}
                            <View className="items-center">
                                <View className="w-8 h-8 rounded-full border border-gray-300 items-center justify-center bg-white">
                                    {/* Empty */}
                                </View>
                            </View>
                        </View>
                   </View>
              </View>

              {/* Fee Cards */}
              <View className="px-6 pb-24">
                  {feeData.map((item) => (
                      <FeeCard key={item.id} data={item} />
                  ))}
              </View>
          </ScrollView>

          {/* Bottom Button */}
          <View className="absolute bottom-10 left-6 right-6">
              <TouchableOpacity 
                  className="bg-[#136ADA] py-4 rounded-xl items-center shadow-md shadow-blue-200"
                  onPress={() => router.push('/student/payment/payment-detail' as any)}
              >
                  <Text className="text-white text-base" style={{ fontFamily: 'Poppins-Bold' }}>Payment Details</Text>
              </TouchableOpacity>
          </View>
      </View>
    </SafeAreaView>
  );
}

function FeeCard({ data }: { data: FeeData }) {
    const isPending = data.status === 'pending';
    const amountColor = isPending ? 'text-red-500' : 'text-green-500';
    const statusText = isPending ? 'Payment pending' : 'Payment Completed';

    return (
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-5">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-black text-base" style={{ fontFamily: 'Poppins-Bold' }}>{data.title}</Text>
                <Text className={`${amountColor} text-base`} style={{ fontFamily: 'Poppins-Bold' }}>₹ {data.amount}</Text>
            </View>
            <View className="h-[1px] bg-gray-200 w-full mb-3" />
            <View className="flex-row justify-between items-center">
                <Text className="text-black text-xs" style={{ fontFamily: 'Poppins-Regular' }}>{statusText}</Text>
                <Text className="text-black text-xs" style={{ fontFamily: 'Poppins-Medium' }}>{data.date}</Text>
            </View>
        </View>
    );
}
