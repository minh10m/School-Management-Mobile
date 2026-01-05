import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CALENDAR_DATA = [
    { day: null }, { day: null }, { day: null }, 
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5, status: 'absent' },
    { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 },
    { day: 13 }, { day: 14 }, { day: 15, status: 'absent' }, { day: 16 }, { day: 17, status: 'leave' }, { day: 18 }, { day: 19 },
    { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 },
    { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 },
];

export default function AttendanceView() {
    return (
        <View className="px-6 pb-10">
            {/* Calendar Container */}
            <View className="bg-[#EAEAEA] rounded-3xl p-4 mb-6">
                {/* Calendar Header */}
                <View className="flex-row justify-between items-center mb-4 bg-white rounded-xl py-2 px-3">
                    <Ionicons name="chevron-back" size={20} color="black" />
                    <Text className="text-black font-poppins-bold text-sm">Jan 2023</Text>
                    <Ionicons name="chevron-forward" size={20} color="black" />
                </View>

                {/* Days Header */}
                <View className="flex-row justify-between mb-4 px-2">
                    {DAYS_OF_WEEK.map((day, index) => (
                        <Text key={index} className="text-black font-poppins text-xs w-[13%] text-center">{day}</Text>
                    ))}
                </View>

                {/* Calendar Grid */}
                <View className="flex-row flex-wrap px-2">
                    {CALENDAR_DATA.map((item, index) => (
                        <View key={index} className="w-[14.28%] aspect-square items-center justify-center mb-2">
                            {item.day && (
                                <View className={`w-8 h-8 items-center justify-center rounded-full ${
                                    // Status Styles
                                    item.status === 'leave' ? 'bg-blue-500' : 
                                    item.status === 'absent' ? 'bg-transparent border border-red-500' : 
                                    // Selected day style (static for now as per mockup '17' is blue)
                                    item.day === 17 ? 'bg-blue-500' : 'bg-transparent'
                                }`}>
                                    <Text className={`font-poppins-medium text-sm ${
                                        item.status === 'leave' || item.day === 17 ? 'text-white' : 
                                        item.status === 'absent' ? 'text-black' : 'text-black'
                                    }`}>
                                        {item.day}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Legend */}
            <View className="flex-row justify-center space-x-8 mb-6 gap-5">
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                    <Text className="text-black font-poppins-medium text-xs">Absent</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                    <Text className="text-black font-poppins-medium text-xs">Festival Leave</Text>
                </View>
            </View>

            {/* Today Attendance Card */}
            <View className="bg-blue-500 rounded-2xl p-4 flex-row items-center mb-6 shadow-md">
                <View className="w-12 h-12 bg-green-500 rounded-xl items-center justify-center mr-4">
                    <Text className="text-white font-poppins-bold text-lg">P</Text>
                </View>
                <View>
                    <Text className="text-white font-poppins-bold text-base">Today Attendance</Text>
                    <Text className="text-blue-100 font-poppins text-xs">17th Jan 2024</Text>
                </View>
            </View>

            {/* Circular Chart Placeholder (Visual Approximation) */}
            <View className="items-center justify-center">
                    <View className="w-32 h-32 rounded-full border-[8px] border-blue-100 items-center justify-center relative">
                    {/* Blue segment approximation using another border */}
                    <View className="absolute w-32 h-32 rounded-full border-[8px] border-l-blue-500 border-t-blue-500 border-r-transparent border-b-transparent transform -rotate-45 opacity-100" />
                    
                    <View className="items-center">
                        <Text className="text-black font-poppins-bold text-2xl">24%</Text>
                        <Text className="text-gray-400 font-poppins text-xs">Absent</Text>
                    </View>
                    </View>
            </View>
        </View>
    );
}
