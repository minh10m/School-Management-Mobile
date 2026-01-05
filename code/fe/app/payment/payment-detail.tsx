import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentDetailScreen() {
  const feeDetails = [
    { label: 'Course Fees', amount: '15,000' },
    { label: 'School Bus', amount: '2,000' },
    { label: 'Sport Fees', amount: '1,000' },
    { label: 'ID card amount', amount: '300' },
    { label: 'Computer Lab Fees', amount: '500' },
  ];

  const totalAmount = '18,800';

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
              <Text className="text-black font-poppins-bold text-lg">Payment Review</Text>
          </View>
          <View className="w-10" /> 
      </View>

      <View className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              
              {/* Stepper */}
              <View className="px-6 py-6 items-center justify-center">
                   <View className="flex-row items-center w-full justify-center px-10 relative">
                        <View className="flex-row justify-between w-full relative">
                            {/* Dotted Line Background */}
                            <View className="absolute w-full top-1/2 -z-10 border-t border-gray-400" style={{ borderStyle: 'dotted' }} />

                            {/* Step 1 - Completed */}
                            <View className="items-center">
                                <View className="w-8 h-8 rounded-full border border-blue-500 items-center justify-center bg-white">
                                    <View className="w-4 h-4 rounded-full bg-blue-500" />
                                </View>
                            </View>

                             {/* Step 2 - Active (with visual ring) */}
                             <View className="items-center">
                                <View className="w-9 h-9 rounded-full border border-[#136ADA] items-center justify-center bg-white">
                                     <View className="w-4 h-4 rounded-full bg-[#136ADA]" />
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

              {/* Your Pending Payment */}
              <View className="items-center mb-10">
                  <Text className="text-black font-poppins-medium text-base mb-2">Your Pending Payment</Text>
                  <Text className="text-[#136ADA] font-poppins-bold text-3xl">₹ {totalAmount}</Text>
              </View>

              {/* Fee Details List */}
              <View className="px-6">
                  <Text className="text-black font-poppins-bold text-lg mb-6">Fees Details</Text>
                  
                  <View className="space-y-5 gap-5">
                      {feeDetails.map((item, index) => (
                          <View key={index} className="flex-row justify-between items-center">
                               <Text className="text-black font-poppins text-base text-gray-700">{item.label}</Text>
                               <View className="flex-row items-center">
                                  <Text className="text-black font-poppins-bold text-base mr-1">₹</Text>
                                  <Text className="text-black font-poppins text-base text-gray-600">{item.amount}</Text>
                               </View>
                          </View>
                      ))}

                      {/* Total Separator */}
                      <View className="h-[1px] bg-gray-200 my-2" />

                      {/* Total Fees */}
                      <View className="flex-row justify-between items-center">
                           <Text className="text-black font-poppins-bold text-lg">Total Fees</Text>
                           <Text className="text-[#136ADA] font-poppins-bold text-lg">₹ {totalAmount}</Text>
                      </View>
                  </View>
              </View>

          </ScrollView>

          {/* Bottom Button */}
          <View className="absolute bottom-10 left-6 right-6">
              <TouchableOpacity 
                  className="bg-[#136ADA] py-4 rounded-xl items-center shadow-md shadow-blue-200"
                  onPress={() => router.push('/payment/success' as any)}
              >
                  <Text className="text-white font-poppins-bold text-base">Pay Now</Text>
              </TouchableOpacity>
          </View>
      </View>
    </SafeAreaView>
  );
}
