import { View, Text, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";

export default function PaymentSuccess() {
  const { courseName, courseId } = useLocalSearchParams<{ courseName: string; courseId: string }>();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 px-8 justify-center items-center">
        {/* Success Icon Container */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }],
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 10
          }}
          className="w-32 h-32 bg-emerald-50 rounded-full items-center justify-center mb-8"
        >
          <View className="w-24 h-24 bg-emerald-500 rounded-full items-center justify-center shadow-lg shadow-emerald-500/50">
            <Ionicons name="checkmark" size={60} color="white" />
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
          className="items-center w-full"
        >
          <Text 
            style={{ fontFamily: "Poppins-Bold" }} 
            className="text-3xl text-[#1E293B] mb-3 text-center"
          >
            Thanh toán thành công!
          </Text>
          <Text 
            style={{ fontFamily: "Poppins-Medium" }} 
            className="text-gray-400 text-center mb-10 leading-relaxed text-sm px-4"
          >
            Chúc mừng! Bạn đã sở hữu thành công khóa học{"\n"}
            <Text className="text-emerald-600 font-extrabold">"{courseName || "Khóa học"}"</Text>
          </Text>

          {/* Details Card */}
          <View className="w-full bg-slate-50 p-6 rounded-[32px] mb-12 border border-slate-100">
            <View className="flex-row items-center justify-between mb-5">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-slate-400 text-[10px] uppercase tracking-widest">Trạng thái</Text>
              <View className="bg-emerald-500 px-4 py-1.5 rounded-full">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-[9px] uppercase tracking-tighter">Hoàn tất</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-slate-400 text-[10px] uppercase tracking-widest">Hình thức</Text>
              <View className="flex-row items-center">
                <Ionicons name="qr-code-outline" size={12} color="#1E293B" className="mr-1.5" />
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-[11px] uppercase tracking-tight">Chuyển khoản VietQR</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="w-full gap-y-4">
            <TouchableOpacity
              onPress={() => router.replace(`/student/courses/lessons?courseId=${courseId}` as any)}
              activeOpacity={0.8}
              className="bg-emerald-500 w-full py-5 rounded-[24px] flex-row items-center justify-center"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 6
              }}
            >
              <Ionicons name="play-circle" size={24} color="white" />
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-base ml-3 tracking-wide">VÀO HỌC NGAY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/home")}
              activeOpacity={0.6}
              className="w-full py-4 items-center bg-gray-50 border border-gray-100 rounded-[24px]"
            >
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-500 text-sm">Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
