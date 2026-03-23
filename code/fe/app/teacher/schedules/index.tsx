import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TeacherSchedules() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-lg">Schedule</Text>
        <View className="w-6" />
      </View>
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-4 text-center">
          Teaching schedule feature coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}
