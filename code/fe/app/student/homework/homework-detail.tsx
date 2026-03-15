import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const PROBLEMS = [
    {
        id: '1',
        problemId: 'Problem 1.1',
        question: 'Visualise 3.765 on the number line, using successive magnification',
        topic: 'Number system',
        deadline: 'Jan 9, 2023',
        completed: false
    },
    {
        id: '2',
        problemId: 'Problem 1.2', 
        question: 'Find three different irrational numbers between the rational numbers 5/7 and 9/11.',
        topic: 'Number system',
        deadline: 'Jan 9, 2023',
        completed: false
    }
];

export default function HomeworkDetailScreen() {
  const { subject } = useLocalSearchParams();
  const [problems, setProblems] = useState(PROBLEMS);

  const toggleProblem = (id: string) => {
    setProblems(prev => prev.map(p => 
        p.id === id ? { ...p, completed: !p.completed } : p
    ));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen 
        options={{
            headerShown: true,
            title: (subject as string) || 'Maths',
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

      <View className="flex-1 px-6 pt-4 justify-between pb-8">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {problems.map((item) => (
                <View key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-row">
                    {/* Blue Left Border */}
                    <View className="w-1.5 bg-bright-blue h-full" />
                    
                    <View className="flex-1 p-4">
                        <View className="flex-row justify-between items-start mb-2">
                             <Text className="text-black text-sm flex-1 mr-2 leading-6" style={{ fontFamily: 'Poppins-Medium' }}>
                                {item.question}
                             </Text>
                             <TouchableOpacity onPress={() => toggleProblem(item.id)}>
                                <Ionicons 
                                    name={item.completed ? "checkbox" : "square-outline"} 
                                    size={24} 
                                    color={item.completed ? "#136ADA" : "#E5E7EB"} 
                                />
                             </TouchableOpacity>
                        </View>
                        
                        <Text className="text-gray-400 text-xs mb-3" style={{ fontFamily: 'Poppins-Regular' }}>{item.topic}</Text>
                        
                        <View className="h-[1px] bg-gray-100 w-full mb-3" />

                        <View className="flex-row justify-between items-center">
                            <Text className="text-black text-xs" style={{ fontFamily: 'Poppins-Regular' }}>{item.problemId}</Text>
                            <Text className="text-black text-xs" style={{ fontFamily: 'Poppins-Regular' }}>Deadline : {item.deadline}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>

        <TouchableOpacity className="bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90">
             <Text className="text-white text-lg" style={{ fontFamily: 'Poppins-SemiBold' }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
