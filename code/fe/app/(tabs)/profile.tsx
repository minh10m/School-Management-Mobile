import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
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
              <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Profile</Text>
          </View>
          {/* Empty view to balance the header */}
          <View className="w-10" /> 
      </View>

      <ScrollView className="flex-1 px-6 pb-10" showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex-row items-center">
              {/* Avatar with blue border */}
              <View className="w-24 h-24 rounded-full border-4 border-blue-500 items-center justify-center p-1 mr-6">
                 <Image 
                     source={{ uri: 'https://via.placeholder.com/150' }} 
                     className="w-full h-full rounded-full"
                 />
              </View>

              <View>
                  <Text className="text-black text-lg mb-1" style={{ fontFamily: 'Poppins-Bold' }}>Name : Nhat Minh</Text>
                  <Text className="text-gray-600 text-sm mb-1" style={{ fontFamily: 'Poppins-Regular' }}>Class : IX - A</Text>
                  <Text className="text-gray-600 text-sm" style={{ fontFamily: 'Poppins-Regular' }}>Roll no : 19</Text>
              </View>
          </View>

          {/* Details Section */}
          <View className="space-y-6 gap-6 pb-10">
              
              <DetailField label="Date of birth" value="13 - 11 - 2008" />
              <DetailField label="Father name" value="Nhat Minh" />
              <DetailField label="Mother name" value="Mother" />
              <DetailField label="Phone Number" value="093341" />
              <DetailField label="Address" value="Messi's House" multiline />

          </View>
      </ScrollView>
    </SafeAreaView>
  );
}


function DetailField({ label, value, multiline = false }: { label: string, value: string, multiline?: boolean }) {
    return (
        <View className="relative border border-gray-300 rounded-xl p-4 pt-5">
            <View className="absolute -top-3 left-4 bg-white px-1">
                <Text className="text-gray-400 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>{label}</Text>
            </View>
            <Text
                className={`text-black text-sm ${multiline ? 'leading-5' : ''}`}
                style={{ fontFamily: 'Poppins-Medium' }}
            >
                {value}
            </Text>
        </View>
    );
}
