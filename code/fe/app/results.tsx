import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResultsScreen() {
  const resultData = [
    { id: '1', subject: 'English', mark: 95, icon: 'book-outline' },
    { id: '2', subject: 'Maths', mark: 96, icon: 'calculator-outline' },
    { id: '3', subject: 'Science', mark: 94, icon: 'flask-outline' },
    { id: '4', subject: 'Social', mark: 97, icon: 'globe-outline' },
    { id: '5', subject: 'Tamil', mark: 95, icon: 'text-outline' },
  ];

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
              <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Result</Text>
          </View>
          <View className="w-10" /> 
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Dropdown Placeholder */}
          <View className="px-6 mb-6">
              <View className="bg-white rounded-xl border border-gray-100 p-4 flex-row justify-between items-center shadow-sm">
                  <Text className="text-black text-sm" style={{ fontFamily: 'Poppins-Medium' }}>Quaterly Exam</Text>
                  <Ionicons name="chevron-down" size={20} color="black" />
              </View>
          </View>

          {/* Progress & Info Section */}
          <View className="flex-row items-center justify-center gap-6 mb-8 px-6">
              {/* Circular Progress Placeholder */}
              <View className="w-24 h-24 rounded-full border-8 border-[#136ADA] items-center justify-center relative">
                  {/* Faded track imitation (partial) - simplistic approach */}
                  <View className="absolute w-24 h-24 rounded-full border-8 border-[#136ADA]/10 top-[-8] left-[-8]" />
                  <View className="items-center">
                      <Text className="text-black text-xl" style={{ fontFamily: 'Poppins-Bold' }}>95%</Text>
                      <Text className="text-gray-400 text-[10px]" style={{ fontFamily: 'Poppins-Regular' }}>Overall %</Text>
                  </View>
              </View>

              <View>
                  <Text className="text-black text-base mb-1" style={{ fontFamily: 'Poppins-Bold' }}>Name : Dinesh Kumar</Text>
                  <Text className="text-black text-base" style={{ fontFamily: 'Poppins-Bold' }}>Grade : A</Text>
              </View>
          </View>

          {/* Marks List Card */}
          <View className="mx-6 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-10">
              <View className="space-y-6 gap-6">
                   {resultData.map((item) => (
                       <ResultItem key={item.id} data={item} />
                   ))}
              </View>
              
              {/* Separator */}
              <View className="h-[1px] bg-gray-100 my-6" />

              {/* Total Score Bubble */}
              <View className="items-center flex-row justify-between">
                   <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Total</Text>
                   <View className="w-20 h-20 bg-[#136ADA] rounded-full items-center justify-center shadow-lg shadow-blue-200">
                      <Text className="text-white text-xl" style={{ fontFamily: 'Poppins-Bold' }}>477</Text>
                   </View>
              </View>
          </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function ResultItem({ data }: { data: any }) {
    return (
        <View className="flex-row items-center">
            {/* Icon */}
            <View className="w-10 h-10 items-center justify-center mr-4">
                 <Ionicons name={data.icon} size={28} color="black" />
            </View>
            
            {/* Subject Name and Dotted Line */}
            <View className="flex-1 flex-row items-center gap-2">
                 <Text className="text-black text-base w-20" style={{ fontFamily: 'Poppins-Medium' }}>{data.subject}</Text>
                 {/* Dotted Line */}
                 <View className="flex-1 h-[1px] border-t border-gray-300 border-dashed" style={{ borderStyle: 'dotted' }} />
            </View>

            {/* Mark */}
            <View className="w-10 h-10 bg-[#136ADA] rounded-full items-center justify-center ml-4">
                 <Text className="text-white text-sm" style={{ fontFamily: 'Poppins-Bold' }}>{data.mark}</Text>
            </View>
        </View>
    );
}
