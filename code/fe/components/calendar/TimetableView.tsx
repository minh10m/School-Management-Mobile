import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const TIMETABLE_DATA = [
    { time: '9.00Am', endTime: '9.50Am', subject: 'Mathematics', teacher: 'By Renuka Sivakumar', bg: 'bg-purple-100' },
    { time: '10.00Am', endTime: '10.50Am', subject: 'English', teacher: 'By Nandini Ravikumar', bg: 'bg-cyan-100' },
    { time: '10.50Am', endTime: '11.05Am', title: 'Morning Break', isBreak: true, bg: 'bg-yellow-100' },
    { time: '11.05Am', endTime: '11.50Am', subject: 'Science', teacher: 'By Vinothi Ravichandran', bg: 'bg-blue-100' },
    { time: '12.00Pm', endTime: '12.50Pm', subject: 'Social Science', teacher: 'By Sushil kumar', bg: 'bg-red-100' },
    { time: '1.00Pm', endTime: '1.40Pm', title: 'Lunch Break', isBreak: true, bg: 'bg-yellow-100' },
];

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableView() {
    const [selectedDay, setSelectedDay] = useState('Wednesday'); 
    const [isDaySelectorOpen, setDaySelectorOpen] = useState(false);

    return (
        <View className="px-6">
            {/* Select Day Dropdown */}
            <TouchableOpacity 
                className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 flex-row justify-between items-center z-50 shadow-sm"
                onPress={() => setDaySelectorOpen(!isDaySelectorOpen)}
            >
                <Text className="text-black font-poppins-bold text-sm">{selectedDay}</Text>
                <Ionicons name={isDaySelectorOpen ? "chevron-up" : "chevron-down"} size={20} color="black" />
            </TouchableOpacity>

            {/* Dropdown Options */}
            {isDaySelectorOpen && (
                <View className="bg-white border border-gray-100 rounded-2xl p-2 mb-6 -mt-4 shadow-sm">
                    {WEEK_DAYS.map((day) => (
                        <TouchableOpacity 
                            key={day} 
                            className={`p-3 rounded-xl ${selectedDay === day ? 'bg-bright-blue/10' : ''}`}
                            onPress={() => {
                                setSelectedDay(day);
                                setDaySelectorOpen(false);
                            }}
                        >
                            <Text className={`font-poppins-medium text-sm ${selectedDay === day ? 'text-bright-blue' : 'text-gray-600'}`}>
                                {day}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Timetable Header */}
            <View className="flex-row mb-4">
                <Text className="text-gray-500 font-poppins-medium text-xs w-20 text-center">Time</Text>
                <Text className="text-gray-500 font-poppins-medium text-xs flex-1 ml-4">Class</Text>
            </View>

            {/* Timetable List */}
            <View className="pb-10">
                {TIMETABLE_DATA.map((item, index) => (
                    <View key={index} className="flex-row mb-6">
                        {/* Time Column */}
                        <View className="w-20 items-end pr-2 pt-2">
                            <Text className="text-black font-poppins-bold text-sm">{item.time}</Text>
                            <Text className="text-gray-400 font-poppins text-[10px]">{item.endTime}</Text>
                        </View>

                        {/* Timeline Graphic */}
                        <View className="items-center relative mr-4">
                            {/* Vertical Line */}
                            <View className="h-full w-[2px] bg-blue-100 absolute top-0" />
                            {/* Dot */}
                            <View className="w-3 h-3 rounded-full bg-bright-blue mt-3" />
                        </View>

                        {/* Card */}
                        <View className="flex-1">
                            {item.isBreak ? (
                                <View className={`${item.bg} rounded-2xl p-4 justify-center`}>
                                    <Text className="text-black font-poppins-bold text-sm text-center">{item.title}</Text>
                                </View>
                            ) : (
                                <View className={`${item.bg} rounded-2xl p-4 flex-row items-center`}>
                                    <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center mr-3">
                                        {/* Placeholder for Avatar */}
                                        <Ionicons name="person" size={20} color="gray" />
                                    </View>
                                    <View>
                                        <Text className="text-black font-poppins-bold text-sm">{item.subject}</Text>
                                        <Text className="text-gray-500 font-poppins text-xs">{item.teacher}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
