import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDocs, limit, startAt, endAt } from 'firebase/firestore';
import { auth, database } from '../../config/firebase';

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // 1. Fetch My Chats
  useEffect(() => {
    if (!auth.currentUser?.email) return;

    const collectionRef = collection(database, 'chats');
    const q = query(
        collectionRef, 
        where('users', 'array-contains', auth.currentUser.email),
        orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setChats(snapshot.docs.map(doc => {
            const data = doc.data();
            // Try to find the other user's email
            const otherUserEmail = data.users?.find((u: string) => u !== auth.currentUser?.email) || 'Unknown';
            
            return {
                id: doc.id,
                ...data,
                name: otherUserEmail, // Display email for now, ideally fetch User details
                otherUserEmail: otherUserEmail,
                avatar: 'https://via.placeholder.com/100',
                time: data.lastMessageTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
                unreadCount: 0,
                message: data.lastMessage
            };
        }));
        setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 2. Search Users
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        return;
    }

    setSearching(true);
    const searchUsers = async () => {
        try {
            const usersRef = collection(database, 'users');
            // Simple prefix search by email
            const q = query(
                usersRef, 
                orderBy('email'), 
                startAt(searchQuery.toLowerCase()), 
                endAt(searchQuery.toLowerCase() + '\uf8ff'),
                limit(10)
            );
            
            const snapshot = await getDocs(q);
            setSearchResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    const timeoutId = setTimeout(searchUsers, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserSelect = (user: any) => {
    // Check if chat already exists (simplified logic for now)
    // In production, you might query firestore to check if a chat doc exists with these 2 users
    // For now, we will use a deterministic ID strategy: sort(email1, email2).join('_')
    // This ensures 1-on-1 chat uniqueness
    
    if (!auth.currentUser?.email) return;

    const emails = [auth.currentUser.email, user.email].sort();
    const chatId = emails.join('_');

    router.push({ pathname: '/chat/[id]', params: { id: chatId, name: user.name || user.email } });
    setSearchQuery(''); // Clear search
  };

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
                placeholder="Search user by email..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none" // Email search
            />
            {searchQuery.length > 0 && (
                 <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>

        {/* List Content */}
        {searchQuery.length > 0 ? (
            // Search Results View
            searching ? (
                <ActivityIndicator color="#3B82F6" />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="text-gray-500 font-poppins-bold mb-2">Found Users</Text>
                    {searchResults.length === 0 ? (
                        <Text className="text-gray-400 font-poppins text-center mt-4">No users found</Text>
                    ) : (
                        searchResults.map((user) => (
                            <TouchableOpacity 
                                key={user.id} 
                                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-50"
                                onPress={() => handleUserSelect(user)}
                            >
                                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                                    <Ionicons name="person-add" size={20} color="#3B82F6" />
                                </View>
                                <View>
                                    <Text className="text-black font-poppins-bold text-sm">{user.name}</Text>
                                    <Text className="text-gray-400 font-poppins text-xs">{user.email}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )
        ) : (
            // Chat List View
            loading ? (
                <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {chats.length === 0 ? (
                        <Text className="text-gray-400 font-poppins text-center mt-10">No messages yet</Text>
                    ) : (
                        chats.map((chat) => (
                            <TouchableOpacity 
                                key={chat.id} 
                                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-50"
                                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chat.id, name: chat.name } })}
                            >
                                {/* Avatar */}
                                <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-4">
                                    <Image 
                                        source={{ uri: chat.avatar }} 
                                        className="w-12 h-12 rounded-full"
                                    />
                                </View>
        
                                {/* Content */}
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-black font-poppins-bold text-sm">{chat.name}</Text>
                                        <Text className="text-gray-400 font-poppins text-xs">{chat.time}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-row items-center flex-1 pr-4">
                                            <Text 
                                                className={`font-poppins text-xs text-gray-400`} 
                                                numberOfLines={1}
                                            >
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
                        ))
                    )}
                </ScrollView>
            )
        )}

      </View>
    </SafeAreaView>
  );
}
