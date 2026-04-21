import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

export default function PaymentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-white">
      
      {/* Header */}
      <View 
        className="px-6 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity 
          onPress={() => router.replace('/student/payment')}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
        >
          <Ionicons name="close" size={20} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-lg">Kết quả</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 items-center justify-center px-10">
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }],
            alignItems: 'center' 
          }}
        >
          {/* Modern Success Illustration */}
          <View className="relative items-center justify-center mb-10">
            <View className="w-40 h-40 bg-green-50 rounded-full items-center justify-center">
              <View className="w-28 h-28 bg-green-100 rounded-full items-center justify-center">
                <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center shadow-lg shadow-green-200">
                  <Ionicons name="checkmark" size={48} color="white" />
                </View>
              </View>
            </View>
            
            {/* Floating particles (Decorative) */}
            <View className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full" />
            <View className="absolute bottom-4 -left-4 w-4 h-4 bg-purple-100 rounded-full" />
            <View className="absolute -bottom-2 -right-4 w-5 h-5 bg-yellow-100 rounded-full" />
          </View>

          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-2xl text-center mb-3">
            Thanh toán thành công!
          </Text>
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-center leading-relaxed">
            Học phí của bạn đã được ghi nhận vào hệ thống. Cảm ơn bạn đã hoàn thành đúng hạn.
          </Text>

          {/* Info Card */}
          <View className="w-full bg-[#F8FAFC] rounded-[32px] p-6 mt-10 border border-gray-100">
            <View className="flex-row justify-between mb-4">
               <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs">Thời gian</Text>
               <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#1E293B] text-xs">
                 {new Date().toLocaleString('vi-VN')}
               </Text>
            </View>
            <View className="flex-row justify-between">
               <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs">Mã giao dịch</Text>
               <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-blue-600 text-xs uppercase">
                 TRX-{Math.random().toString(36).substring(7).toUpperCase()}
               </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <View 
        className="px-6 pb-6 gap-4"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <TouchableOpacity className="bg-white border border-gray-100 py-4 rounded-[20px] flex-row items-center justify-center shadow-sm">
          <Ionicons name="cloud-download-outline" size={20} color="#64748B" className="mr-2" />
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#64748B] text-sm">TẢI HÓA ĐƠN PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-blue-600 py-5 rounded-[24px] items-center shadow-xl shadow-blue-200"
          onPress={() => router.replace('/student/payment')}
        >
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-sm tracking-widest uppercase">Hoàn tất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

