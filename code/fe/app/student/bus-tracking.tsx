import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function BusTrackingScreen() {
  return (
    <View className="flex-1 bg-white relative">
      <Stack.Screen options={{ headerShown: false }} />
      

      <View className="h-[60%] bg-blue-50 relative overflow-hidden">
          {/* Decorative Map Pattern (Grid) */}
          <View className="absolute inset-0 opacity-10">
               <View className="absolute top-10 left-0 right-0 h-[1px] bg-gray-400" />
               <View className="absolute top-40 left-0 right-0 h-[1px] bg-gray-400" />
               <View className="absolute top-80 left-0 right-0 h-[1px] bg-gray-400" />
               <View className="absolute left-20 top-0 bottom-0 w-[1px] bg-gray-400" />
               <View className="absolute left-60 top-0 bottom-0 w-[1px] bg-gray-400" />
          </View>
          
          {/* Header (Floating) */}
          <View className="absolute top-12 left-6 right-6 z-10 flex-row justify-between items-center">
             <TouchableOpacity 
                  className="bg-white p-2 rounded-full shadow-sm"
                  onPress={() => router.back()}
              >
                  <Ionicons name="arrow-back" size={24} color="black" />
             </TouchableOpacity>
             <View className="bg-white px-4 py-2 rounded-full shadow-sm">
                  <Text className="text-black text-sm" style={{ fontFamily: 'Poppins-Bold' }}>Bus Tracking</Text>
             </View>
             <View className="w-10" /> 
          </View>

          {/* Map Content Placeholders */}
           {/* Bus Marker */}
           <View className="absolute top-1/2 left-1/2 -ml-5 -mt-5">
               <View className="bg-[#136ADA] w-12 h-12 rounded-full items-center justify-center border-4 border-white shadow-lg shadow-blue-300">
                    <Ionicons name="bus" size={20} color="white" />
               </View>
               <View className="bg-white px-2 py-1 rounded-md absolute -top-8 -left-4 shadow-sm">
                    <Text className="text-xs text-[#136ADA]" style={{ fontFamily: 'Poppins-Bold' }}>TN 01 AB 1234</Text>
               </View>
           </View>

           {/* Route Path (Visual) */}
           <View className="absolute top-1/2 left-1/2 w-40 h-[1px] bg-[#136ADA] -z-10 border-dashed border-2 border-[#136ADA]/50 origin-left -rotate-45" />

      </View>



      <View className="absolute bottom-0 w-full h-[45%] bg-white rounded-t-[32px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pt-8 px-8 pb-10">
          
          {/* Drag Handle */}
          <View className="absolute top-3 left-1/2 -ml-6 w-12 h-1 bg-gray-300 rounded-full" />

          {/* Bus & Driver Info */}
          <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center gap-4">
                  {/* Driver Avatar */}
                  <View className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                     <Image source={{ uri: 'https://via.placeholder.com/100' }} className="w-full h-full" />
                  </View>
                  <View>
                      <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Mr. Ramachandran</Text>
                      <View className="flex-row items-center gap-1">
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>4.8 (Driver)</Text>
                      </View>
                  </View>
              </View>
              
              {/* Call Button */}
              <TouchableOpacity className="w-12 h-12 bg-green-500 rounded-full items-center justify-center shadow-md shadow-green-200">
                  <Ionicons name="call" size={22} color="white" />
              </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-100 mb-6" />

          {/* Timeline / Route */}
          <View className="space-y-6">
              {/* Stop 1 */}
              <View className="flex-row items-start gap-4">
                  <View className="items-center">
                       <View className="w-4 h-4 rounded-full bg-gray-300" />
                       <View className="w-[2px] h-8 bg-gray-300 my-1" />
                  </View>
                  <View>
                      <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins-Regular' }}>School Campus</Text>
                      <Text className="text-gray-300 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>Started at 3:10 PM</Text>
                  </View>
              </View>
               
               {/* Stop 2 (Current) */}
               <View className="flex-row items-start gap-4 -mt-2">
                  <View className="items-center">
                       <View className="w-4 h-4 rounded-full border-4 border-[#136ADA] bg-white" />
                       <View className="w-[2px] h-8 bg-gray-300 my-1" />
                  </View>
                  <View>
                      <Text className="text-black text-base" style={{ fontFamily: 'Poppins-Bold' }}>Nethaji Street</Text>
                      <Text className="text-[#136ADA] text-xs" style={{ fontFamily: 'Poppins-Medium' }}>Arriving in 5 mins</Text>
                  </View>
              </View>

              {/* Stop 3 */}
              <View className="flex-row items-start gap-4 -mt-2">
                  <View className="items-center">
                       <View className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
                  </View>
                  <View>
                      <Text className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins-Regular' }}>Home</Text>
                  </View>
              </View>
          </View>

      </View>
    </View>
  );
}
