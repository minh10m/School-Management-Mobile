import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProfileScreen() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');

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
          {/* Role Toggle for Testing */}
          <TouchableOpacity 
              onPress={() => setRole(role === 'student' ? 'teacher' : 'student')}
              className="absolute right-6 z-10 p-2"
          >
              <Ionicons name="repeat-outline" size={24} color="#136ADA" />
          </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pb-10" showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex-row items-center">
              {/* Avatar with blue border */}
              <View className="w-24 h-24 rounded-full border-4 border-blue-500 items-center justify-center p-1 mr-6">
                 <Image 
                     source={{ uri: role === 'student' ? 'https://via.placeholder.com/150' : 'https://via.placeholder.com/150/136ADA/FFFFFF?text=Teacher' }} 
                     className="w-full h-full rounded-full"
                 />
              </View>

              <View className="flex-1">
                  <Text className="text-black text-lg mb-1" style={{ fontFamily: 'Poppins-Bold' }}>
                    {role === 'student' ? 'Name : Nhat Minh' : 'Teacher : Ms. Elena'}
                  </Text>
                  {role === 'student' ? (
                      <>
                          <Text className="text-gray-600 text-sm mb-1" style={{ fontFamily: 'Poppins-Regular' }}>Class : IX - A</Text>
                          <Text className="text-gray-600 text-sm" style={{ fontFamily: 'Poppins-Regular' }}>Roll no : 19</Text>
                      </>
                  ) : (
                      <>
                          <Text className="text-gray-600 text-sm mb-1" style={{ fontFamily: 'Poppins-Regular' }}>Subject : Mathematics</Text>
                          <TouchableOpacity 
                              onPress={() => router.push('/teacher/edit-profile')}
                              className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 self-start mt-2"
                          >
                              <Text className="text-blue-600 text-xs" style={{ fontFamily: 'Poppins-Medium' }}>Edit Profile</Text>
                          </TouchableOpacity>
                      </>
                  )}
              </View>
          </View>

          {/* Details Section */}
          <View className="space-y-6 gap-6 pb-10">
              {role === 'student' ? (
                  <>
                      <DetailField label="Date of birth" value="13 - 11 - 2008" />
                      <DetailField label="Father name" value="Nhat Minh" />
                      <DetailField label="Mother name" value="Mother" />
                      <DetailField label="Phone Number" value="093341" />
                      <DetailField label="Address" value="Messi's House" multiline />
                  </>
              ) : (
                  <>
                      <DetailField label="Email" value="elena.math@school.edu" />
                      <DetailField label="Phone" value="+84 987 654 321" />
                      <DetailField label="Birthday" value="15-05-1990" />
                      <DetailField label="Joined Date" value="2022-09-01" />
                  </>
              )}
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
