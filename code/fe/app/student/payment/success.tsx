import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentSuccessScreen() {
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
              <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Kết quả thanh toán</Text>
          </View>
          <View className="w-10" /> 
      </View>

      <View className="flex-1 items-center">
          
          {/* Stepper */}
          <View className="px-6 py-6 items-center justify-center w-full">
               <View className="flex-row items-center w-full justify-center px-10 relative">
                    <View className="flex-row justify-between w-full relative">
                        {/* Dotted Line Background */}
                        <View className="absolute w-full top-1/2 -z-10 border-t border-blue-500" style={{ borderStyle: 'dotted' }} />

                        {/* Step 1 - Completed */}
                        <View className="items-center">
                            <View className="w-8 h-8 rounded-full border border-blue-500 items-center justify-center bg-white">
                                <View className="w-4 h-4 rounded-full bg-blue-500" />
                            </View>
                        </View>

                         {/* Step 2 - Completed */}
                         <View className="items-center">
                            <View className="w-8 h-8 rounded-full border border-blue-500 items-center justify-center bg-white">
                                 <View className="w-4 h-4 rounded-full bg-blue-500" />
                            </View>
                        </View>

                        {/* Step 3 - Active/Completed */}
                        <View className="items-center">
                            <View className="w-9 h-9 rounded-full border border-[#136ADA] items-center justify-center bg-white">
                                <View className="w-4 h-4 rounded-full bg-[#136ADA]" />
                            </View>
                        </View>
                    </View>
               </View>
          </View>

          {/* Illustration/Image */}
            <View className="w-64 h-64 my-10 items-center justify-center">
                {/* 
                  Using Ionicons as a placeholder if no image is available. 
                  Ideally, this should be the card illustration from the design.
                */}
                <Image 
                    source={require('../../../assets/images/on-boarding-1.png')} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                />
            </View>

          {/* Success Message */}
          <View className="items-center mb-10 px-6">
              <Text className="text-black text-xl mb-2 text-center" style={{ fontFamily: 'Poppins-Bold' }}>Thanh toán thành công</Text>
              <Text className="text-gray-500 text-sm text-center" style={{ fontFamily: 'Poppins-Regular' }}>Học phí đã được thanh toán thành công</Text>
          </View>

      </View>

      {/* Bottom Buttons */}
      <View className="px-6 pb-10 gap-4">
            <TouchableOpacity className="border border-gray-200 py-4 rounded-xl items-center flex-row justify-center gap-2">
                 <Ionicons name="download-outline" size={20} color="gray" />
                 <Text className="text-gray-600 text-base" style={{ fontFamily: 'Poppins-Medium' }}>Tải hóa đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className="bg-[#136ADA] py-4 rounded-xl items-center"
                onPress={() => router.push('/(tabs)/home' as any)}
            >
                <Text className="text-white text-base" style={{ fontFamily: 'Poppins-Bold' }}>Trang chủ</Text>
            </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
