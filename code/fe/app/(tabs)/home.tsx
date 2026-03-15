import { Image } from 'expo-image';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useState } from 'react';
import SideMenu from '@/components/SideMenu';

export default function HomeScreen() {
  const [isMenuVisible, setMenuVisible] = useState(false);
  
  const academicsData = [
    { id: '1', title: 'Bus Tracking', icon: 'location', color: 'bg-blue-100', iconColor: '#136ADA' },
    { id: '2', title: 'Exams', icon: 'calendar', color: 'bg-orange-100', iconColor: '#F97316' },
    { id: '3', title: 'Fee', icon: 'cash', color: 'bg-purple-100', iconColor: '#A855F7' },
    { id: '4', title: 'Home Work', icon: 'document-text', color: 'bg-teal-100', iconColor: '#14B8A6' },
    { id: '5', title: 'Results', icon: 'pie-chart', color: 'bg-yellow-100', iconColor: '#EAB308' },
    { id: '6', title: 'Timetable', icon: 'time', color: 'bg-blue-50', iconColor: '#3B82F6' },
    { id: '7', title: 'Attendance', icon: 'calendar', color: 'bg-red-50', iconColor: '#EF4444' },
  ];

  const homeworkData = [
    { id: '1', subject: 'Maths', daysLeft: '1 day left', task: 'Solve the Given Problems', progress: 50 },
    { id: '2', subject: 'Physics', daysLeft: '2 days left', task: 'Read Chapter 3', progress: 80 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-4 mb-6">
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={28} color="black" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
             {/* Logo Placeholder - Text for now */}
            <Ionicons name="book" size={24} color="#136ADA" />
            <Text className="text-bright-blue text-xl" style={{ fontFamily: 'Poppins-Bold' }}>School EDU</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/student/notifications' as any)}>
            <Ionicons name="notifications-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>

        {/* Greeting & Student Card */}
        <View className="px-6 mb-8">
            <Text className="text-black text-lg mb-4" style={{ fontFamily: 'Poppins-SemiBold' }}>Hi, Welcome,</Text>
            
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-start mb-4">
                    <View>
                        <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Nhật Minh</Text>
                        <View className="flex-row items-center mt-1 gap-3">
                             <View className="bg-blue-100 px-3 py-1 rounded-full">
                                <Text className="text-bright-blue text-xs" style={{ fontFamily: 'Poppins-Medium' }}>Class : 8 - A</Text>
                             </View>
                             <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>Roll No : 19</Text>
                        </View>
                    </View>
                     <View className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                        <Image source={require('../../assets/images/on-boarding-1.png')} style={{width: '100%', height: '100%'}} contentFit="cover" />
                     </View>
                </View>

                {/* Attendance Bar */}
                <View>
                    <View className="flex-row justify-between mb-2">
                         <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins-Medium' }}>Attendance</Text>
                         <Text className="text-bright-blue text-xs" style={{ fontFamily: 'Poppins-Bold' }}>53%</Text>
                    </View>
                    <View className="h-3 bg-gray-100 rounded-full w-full overflow-hidden">
                        <View className="h-full bg-bright-blue rounded-full" style={{ width: '53%' }} />
                    </View>
                </View>
            </View>
        </View>

        {/* Academics Grid */}
        <View className="px-6 mb-8">
            <Text className="text-black text-base mb-4" style={{ fontFamily: 'Poppins-Medium' }}>Academics</Text>
            <View className="flex-row flex-wrap justify-between gap-y-4">
                {academicsData.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        className={`${item.color} w-[31%] py-6 rounded-2xl items-center justify-center gap-2`}
                        onPress={() => {
                            if (item.title === 'Home Work') {
                                router.push('/student/homework' as any);
                            } else if (item.title === 'Exams') {
                                router.push('/student/exam-schedule' as any);
                            } else if (item.title === 'Fee') {
                                router.push('/student/payment' as any);
                            } else if (item.title === 'Results') {
                                router.push('/student/results' as any);
                            } else if (item.title === 'Timetable') {
                                router.push({ pathname: '/(tabs)/calendar', params: { tab: 'Timetable' } } as any);
                            } else if (item.title === 'Attendance') {
                                router.push({ pathname: '/(tabs)/calendar', params: { tab: 'Attendance' } } as any);
                            } else if (item.title === 'Bus Tracking') {
                                router.push('/student/bus-tracking' as any);
                            }
                        }}
                    >
                        <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                              <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                        </View>
                        <Text className="text-black text-xs text-center" style={{ fontFamily: 'Poppins-Medium' }}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* Homeworks */}
        <View className="mb-8">
             <View className="flex-row justify-between items-center px-6 mb-4">
                <Text className="text-black text-base" style={{ fontFamily: 'Poppins-Medium' }}>Homeworks</Text>
                <TouchableOpacity onPress={() => router.push('/homework' as any)}>
                    <Text className="text-bright-blue text-sm" style={{ fontFamily: 'Poppins-Medium' }}>View all</Text>
                </TouchableOpacity>
             </View>
             
             <FlatList 
                data={homeworkData}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                renderItem={({ item }) => (
                    <View className="bg-bright-blue w-72 p-5 rounded-3xl">
                        <View className="flex-row justify-between items-start mb-6">
                            <View>
                                <View className="flex-row items-center gap-2 mb-1">
                                    <View className="bg-white/20 p-2 rounded-lg">
                                         <Ionicons name="clipboard-outline" size={20} color="white" />
                                    </View>
                                    <Text className="text-white text-lg" style={{ fontFamily: 'Poppins-Bold' }}>{item.subject}</Text>
                                </View>
                                 <View className="flex-row items-center gap-1">
                                    <Ionicons name="time-outline" size={14} color="white" />
                                    <Text className="text-white/80 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>{item.daysLeft}</Text>
                                </View>
                            </View>
                            
                            {/* Circular Progress Placeholder */}
                            <View className="w-12 h-12 rounded-full border-4 border-white/30 items-center justify-center">
                                <Text className="text-white text-[10px]" style={{ fontFamily: 'Poppins-Bold' }}>{item.progress}%</Text>
                            </View>
                        </View>

                        <Text className="text-white text-base mb-4" style={{ fontFamily: 'Poppins-Medium' }}>{item.task}</Text>

                        <View className="items-end">
                            <TouchableOpacity className="bg-white px-4 py-2 rounded-lg">
                                <Text className="text-bright-blue text-xs" style={{ fontFamily: 'Poppins-SemiBold' }}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                keyExtractor={item => item.id}
             />
        </View>

        {/* Calendar / Event Updates Part (Simplified) */}
         <View className="px-6 pb-20">
            <Text className="text-black text-base mb-4" style={{ fontFamily: 'Poppins-Medium' }}>Event updates</Text>
            <View className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                 {/* Decorations/Placeholders for Sports Theme */}
                 {/* Right side decoration */}
                 <View className="absolute right-0 top-10 w-24 h-24 bg-bright-blue/10 rounded-full -mr-10" />
                 
                 <Text className="text-bright-blue text-sm mb-1" style={{ fontFamily: 'Poppins-Bold' }}>03, Nov, 2023 | Saturday</Text>
                 <Text className="text-bright-blue text-4xl mb-6" style={{ fontFamily: 'Poppins-Bold' }}>Sports</Text>
                 <Text className="text-bright-blue text-3xl ml-20" style={{ fontFamily: 'Poppins-Bold' }}>Day</Text>

                 {/* Icons to simulate the illustration */}
                 <View className="absolute right-4 bottom-4">
                      <Ionicons name="basketball-outline" size={60} color="#136ADA" />
                 </View>
                 <View className="absolute left-4 bottom-4">
                      <Ionicons name="baseball-outline" size={40} color="#136ADA" />
                 </View>
            </View>
         </View>

      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}
