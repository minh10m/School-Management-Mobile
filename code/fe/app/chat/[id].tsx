import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

// Mock Chat History Data
const CHAT_HISTORY = [
    {
        id: '1',
        text: 'Hi Mam, I will send my homework. Please review it and let me know if anything should be corrected',
        time: 'Yesterday, 9:41 AM',
        isSender: true,
        type: 'text',
    },
    {
        id: '2',
        text: 'Sure, send it over and I\'ll take a look',
        time: '',
        isSender: false,
        type: 'text',
        read: false, 
    },
    {
        id: '3',
        text: 'Ok, Mam',
        time: '',
        isSender: true,
        type: 'text',
    },
    {
        id: '4',
        image: 'https://via.placeholder.com/300x400', // Placeholder for homework image
        time: '',
        isSender: true,
        type: 'image',
    },
    {
        id: '5',
        text: 'Good Job Dinesh..!',
        time: '',
        isSender: false,
        type: 'text',
    },
    {
        id: '6',
        text: 'Thanks, Mam',
        time: '',
        isSender: true,
        type: 'text',
    },
];

export default function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
                <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>
            
            <View className="flex-row items-center">
                 <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                    {/* Placeholder Avatar - could be passed via params or fetched */}
                    <Image 
                         source={{ uri: 'https://via.placeholder.com/100' }} 
                         className="w-10 h-10 rounded-full"
                    />
                 </View>
                 <Text className="text-black font-poppins-bold text-base">{name || 'Chat'}</Text>
            </View>
        </View>

        <View className="flex-row items-center space-x-4 gap-4">
             <TouchableOpacity>
                <Ionicons name="call-outline" size={24} color="black" />
             </TouchableOpacity>
             <TouchableOpacity>
                <Ionicons name="videocam-outline" size={24} color="black" />
             </TouchableOpacity>
        </View>
      </View>

      {/* Chat Body */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
            <Text className="text-gray-400 font-poppins text-xs text-center mb-6">Yesterday, 9:41 AM</Text>

            {CHAT_HISTORY.map((msg) => (
                <View key={msg.id} className={`flex-row mb-4 ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
                    {/* Receiver Avatar */}
                    {!msg.isSender && (
                        <Image 
                             source={{ uri: 'https://via.placeholder.com/100' }} 
                             className="w-8 h-8 rounded-full mr-2 mt-1"
                        />
                    )}

                    {/* Message Bubble */}
                    <View 
                        className={`rounded-2xl p-3 max-w-[80%] ${
                            msg.isSender 
                            ? 'bg-blue-500 rounded-tr-none' 
                            : 'bg-[#F2F4F5] rounded-tl-none'
                        }`}
                    >
                        {msg.type === 'text' ? (
                            <Text className={`font-poppins text-sm ${msg.isSender ? 'text-white' : 'text-black'}`}>
                                {msg.text}
                            </Text>
                        ) : (
                             <View className="bg-white p-1 rounded-xl">
                                  {/* Placeholder for Image Message */}
                                  <View className="w-48 h-64 bg-gray-200 rounded-lg items-center justify-center">
                                       <Text className="text-gray-400 text-xs">Homework Image</Text>
                                  </View>
                             </View>
                        )}
                    </View>
                </View>
            ))}
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 py-3 border-t border-gray-100 bg-white pb-6">
             <View className="flex-row items-center bg-gray-50 rounded-full border border-gray-200 px-2 py-1">
                 <TextInput 
                    className="flex-1 p-3 font-poppins text-sm text-black h-12"
                    placeholder="Message..."
                    placeholderTextColor="#9CA3AF"
                    value={messageText}
                    onChangeText={setMessageText}
                 />
                 <View className="flex-row items-center space-x-3 gap-3 mr-2">
                     <TouchableOpacity>
                        <Ionicons name="mic-outline" size={24} color="#9CA3AF" />
                     </TouchableOpacity>
                     <TouchableOpacity>
                         <Ionicons name="happy-outline" size={24} color="#9CA3AF" />
                     </TouchableOpacity>
                     <TouchableOpacity>
                         <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                     </TouchableOpacity>
                 </View>
             </View>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
