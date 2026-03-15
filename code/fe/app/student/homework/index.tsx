import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TASKS = [
    {
        id: '1',
        subject: 'Maths',
        timeLeft: '1 day left',
        task: 'Solve the Given Problems',
        progress: 50,
        color: '#136ADA', // Blue
        bgColor: 'bg-white',
    },
    {
        id: '2',
        subject: 'English',
        timeLeft: '1 day left',
        task: 'Book Back Revision',
        progress: 75,
        color: '#136ADA',
        bgColor: 'bg-white',
    },
    {
        id: '3',
        subject: 'Science',
        timeLeft: '1 day left',
        task: '5 Mark Questions',
        progress: 25,
        color: '#136ADA',
        bgColor: 'bg-white',
    },
];

export default function HomeworkScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const flatListRef = useRef<FlatList>(null);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: days }, (_, i) => {
        const date = new Date(year, month, i + 1);
        return {
            date: date,
            day: i + 1,
            dow: date.toLocaleDateString('en-US', { weekday: 'short' }),
        };
    });
  }, [currentDate]);

  const changeMonth = (increment: number) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + increment);
        return newDate;
    });
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  useEffect(() => {
      // Scroll to selected date if in current month
      if (currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear()) {
          const index = selectedDate.getDate() - 1;
          // Simple timeout to ensure layout is ready or just try slightly later
          setTimeout(() => {
             flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
          }, 100);
      }
  }, [currentDate, selectedDate]);


  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen 
        options={{
            headerShown: true,
            title: 'Homework',
            headerTitleAlign: 'center',
            headerTitleStyle: {
                fontFamily: 'Poppins-Bold',
                fontSize: 18,
            },
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()} className="text-black">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            ),
            headerShadowVisible: false,
            headerStyle: { backgroundColor: 'white' },
        }}
    />
      <StatusBar hidden />

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        
        {/* Month Selector */}
        <View className="flex-row items-center justify-between bg-white mb-6">
            <TouchableOpacity className="p-2" onPress={() => changeMonth(-1)}>
                 <Ionicons name="chevron-back" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-black text-base" style={{ fontFamily: 'Poppins-Bold' }}>
                {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Text>
            <TouchableOpacity className="p-2" onPress={() => changeMonth(1)}>
                 <Ionicons name="chevron-forward" size={20} color="black" />
            </TouchableOpacity>
        </View>

        {/* Days Strip */}
        <View className="mb-8">
             <FlatList
                ref={flatListRef}
                data={daysInMonth}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.date.toISOString()}
                contentContainerStyle={{ gap: 10 }}
                onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                }}
                renderItem={({ item }) => {
                    const selected = isSelected(item.date);
                    return (
                        <TouchableOpacity 
                            onPress={() => setSelectedDate(item.date)}
                            className={`items-center justify-center w-14 h-20 rounded-2xl ${selected ? 'bg-bright-blue' : 'bg-white border border-gray-100'}`}
                        >
                            <Text
                                className={`text-base mb-1 ${selected ? 'text-white' : 'text-black'}`}
                                style={{ fontFamily: 'Poppins-Medium' }}
                            >
                                {item.day}
                            </Text>
                            <Text
                                className={`text-xs ${selected ? 'text-white' : 'text-gray-400'}`}
                                style={{ fontFamily: 'Poppins-Regular' }}
                            >
                                {item.dow}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>

        {/* Tasks List */}
        <View className="gap-4 pb-10">
            {TASKS.map((item) => (
                <View key={item.id} className="bg-white border border-gray-200 p-5 rounded-2xl">
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-row gap-4">
                            <View className="w-12 h-12 bg-gray-800 rounded-xl items-center justify-center">
                                <Ionicons name="clipboard-outline" size={24} color="white" />
                            </View>
                            <View>
                                <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>{item.subject}</Text>
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="time-outline" size={14} color="gray" />
                                    <Text className="text-gray-400 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>{item.timeLeft}</Text>
                                </View>
                            </View>
                        </View>

                         {/* Simple Circular Progress with Border Trick */}
                         <View className="items-center justify-center w-16 h-16 rounded-full border-4 border-gray-100 relative">
                             {/* Arc simulation (partial border) is hard with just tailwind utility, so we use a simple full circle heavily bordered */}
                             {/* Ideally use SVG. For now, just a border and text */}
                             <View 
                                className="absolute w-full h-full rounded-full border-4 border-bright-blue" 
                                style={{ 
                                    borderLeftColor: item.progress < 50 ? 'transparent' : '#136ADA',
                                    borderBottomColor: item.progress < 75 ? 'transparent' : '#136ADA', 
                                    borderRightColor: 'transparent', // Simplified visual
                                    transform: [{ rotate: '45deg' }]
                                }} 
                             />
                             <Text className="text-black text-xs" style={{ fontFamily: 'Poppins-Bold' }}>{item.progress}%</Text>
                         </View>
                    </View>

                    <Text className="text-gray-500 text-base mb-6" style={{ fontFamily: 'Poppins-Regular' }}>
                        {item.task}
                    </Text>

                    <View className="items-end">
                        <TouchableOpacity 
                            className="bg-bright-blue px-6 py-3 rounded-lg"
                            onPress={() => router.push({ pathname: '/student/homework/homework-detail', params: { subject: item.subject } } as any)}
                        >
                            <Text className="text-white text-sm" style={{ fontFamily: 'Poppins-SemiBold' }}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
