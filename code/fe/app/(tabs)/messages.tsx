import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

// Mock Data matching the design
const MESSAGES_DATA = [
  {
    id: '1',
    name: 'Nhat Minh',
    message: 'New Message',
    time: '02:00PM',
    unreadCount: 1,
    isOnline: true, // Just for avatar decoration if needed
    avatar: null, // Use placeholder
  },
  {
    id: '2',
    name: 'Co Giao Thao',
    message: 'Thank you mam',
    time: '12:20PM',
    unreadCount: 0,
    isRead: true, // double checkmark
    avatar: null,
  },
  {
    id: '3',
    name: 'Co Giao Thao',
    message: 'Ok mam',
    time: '12:20PM',
    unreadCount: 0,
    isRead: true,
    avatar: null,
  },
  {
    id: '4',
    name: 'Co Giao Thao',
    message: 'Ok Sir',
    time: 'Yesterday',
    unreadCount: 0,
    isRead: true,
    avatar: null,
  },
];

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 px-6 pt-2">
        {/* Header */}
        <View className="flex-row items-center justify-center mb-6 relative">
             <TouchableOpacity 
                className="absolute left-0 p-2"
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-black font-poppins-bold text-lg">Messages</Text>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-2xl flex-row items-center px-4 py-3 mb-6">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput 
                className="flex-1 ml-3 font-poppins text-sm text-black"
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* Chat List */}
        <ScrollView showsVerticalScrollIndicator={false}>
            {MESSAGES_DATA.map((chat) => (
                <TouchableOpacity 
                    key={chat.id} 
                    className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-50"
                    onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chat.id, name: chat.name } })}
                >
                    {/* Avatar */}
                    <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-4">
                        <Ionicons name="person" size={24} color="gray" />
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-black font-poppins-bold text-sm">{chat.name}</Text>
                            <Text className="text-gray-400 font-poppins text-xs">{chat.time}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                {chat.isRead && !chat.unreadCount && (
                                    <Ionicons name="checkmark-done" size={16} color="#3B82F6" style={{ marginRight: 4 }} />
                                )}
                                <Text className={`font-poppins text-xs ${chat.unreadCount > 0 ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
                                    {chat.message}
                                </Text>
                            </View>
                            
                            {chat.unreadCount > 0 && (
                                <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
                                    <Text className="text-white font-poppins-bold text-[10px]">{chat.unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
