import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import TimetableView from '../../../components/calendar/TimetableView';
import AttendanceView from '../../../components/calendar/AttendanceView';
import EventsView from '../../../components/calendar/EventsView';

const TABS = ['Attendance', 'Timetable', 'Events'];





export default function CalendarScreen() {
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(tab ? (Array.isArray(tab) ? tab[0] : tab) : 'Attendance');

  // Update active tab if param changes (e.g. navigation from home)
  if (tab && activeTab !== tab) {
     setActiveTab(Array.isArray(tab) ? tab[0] : tab);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
        
       <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* custom tab selector */}
            <View className="flex-row justify-between mb-6 mx-6 mt-4 bg-white rounded-xl">
                {TABS.map((tab) => (
                    <TouchableOpacity 
                        key={tab} 
                        onPress={() => setActiveTab(tab)}
                        className={`flex-1 py-3 items-center border-b-2 ${activeTab === tab ? 'border-blue-500' : 'border-transparent'}`}
                    >
                        <Text
                            className={`text-sm ${activeTab === tab ? 'text-blue-500' : 'text-gray-400'}`}
                            style={{ fontFamily: activeTab === tab ? 'Poppins-Bold' : 'Poppins-Regular' }}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'Attendance' ? (
                <AttendanceView />
            ) : activeTab === 'Timetable' ? (
                <TimetableView />
            ) : (
                <EventsView />
            )}

       </ScrollView>
    </SafeAreaView>
  );
}
