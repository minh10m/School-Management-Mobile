import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp, where, doc, setDoc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { auth, database } from '../../config/firebase';
import { sendPushNotification } from '../../utils/notifications';

export default function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [uploading, setUploading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useLayoutEffect(() => {
    // ... (existing code)
    const collectionRef = collection(database, 'chats', id as string, 'messages');
    const q = query(collectionRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(
            snapshot.docs.map(doc => ({
                _id: doc.id,
                createdAt: doc.data().createdAt?.toDate(),
                text: doc.data().text,
                user: doc.data().user,
                image: doc.data().image,
                type: doc.data().type || 'text',
                isSender: doc.data().user._id === auth.currentUser?.email
            }))
        );
    });

    return unsubscribe;
  }, [id]);

  const handleSendMessage = async (base64Image: string | null = null, type: 'text' | 'image' = 'text') => {
    if ((type === 'text' && !messageText.trim()) || (type === 'image' && !base64Image)) return;

    const textToSave = type === 'text' ? messageText : 'Sent an image';
    if (type === 'text') setMessageText(''); 

    try {
        await addDoc(collection(database, 'chats', id as string, 'messages'), {
            text: textToSave,
            createdAt: serverTimestamp(),
            user: {
                _id: auth.currentUser?.email,
                name: auth.currentUser?.displayName || 'User',
                avatar: 'https://via.placeholder.com/100'
            },
            type: type,
            image: base64Image
        });

        // Parse participants to find recipient
        const participants = (id as string).includes('_') ? (id as string).split('_') : [auth.currentUser?.email];
        const recipientEmail = participants.find(email => email !== auth.currentUser?.email);

        await setDoc(doc(database, 'chats', id as string), {
             lastMessage: textToSave,
             lastMessageTime: serverTimestamp(),
             users: participants 
        }, { merge: true });

        // Send Push Notification
        if (recipientEmail) {
            const userDoc = await getDoc(doc(database, 'users', recipientEmail));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData?.pushToken) {
                    await sendPushNotification(
                        userData.pushToken,
                        auth.currentUser?.displayName || 'New Message',
                        textToSave
                    );
                }
            }
        }

    } catch (error) {
        console.error("Error sending message: ", error);
        alert("Failed to send message");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [4, 3],
      quality: 0.2, // Compress to avoid Firestore limit
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      await handleSendMessage(base64Img, 'image');
    }
  };

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
        <ScrollView 
            ref={scrollViewRef}
            className="flex-1 px-4 py-4" 
            contentContainerStyle={{ paddingBottom: 20 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
            {messages.length === 0 ? (
                 <Text className="text-gray-400 font-poppins text-xs text-center mt-10">
                    No messages yet. Say hello!
                 </Text>
            ) : (
                messages.map((msg) => (
                    <View key={msg._id} className={`flex-row mb-4 ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
                        {/* Receiver Avatar */}
                        {!msg.isSender && (
                            <Image 
                                 source={{ uri: msg.user.avatar }} 
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
                                      {msg.image ? (
                                        <Image 
                                            source={{ uri: msg.image }} 
                                            style={{ width: 200, height: 200, borderRadius: 8 }}
                                            resizeMode="cover"
                                        />
                                      ) : (
                                        <ActivityIndicator />
                                      )}
                                 </View>
                            )}
                            <Text className={`font-poppins text-[10px] mt-1 text-right ${msg.isSender ? 'text-white/70' : 'text-gray-400'}`}>
                                {msg.createdAt ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                            </Text>
                        </View>
                    </View>
                ))
            )}
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
                    {uploading ? (
                         <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                        messageText.length > 0 ? (
                            <TouchableOpacity onPress={() => handleSendMessage()}>
                                <Ionicons name="send" size={24} color="#3B82F6" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={pickImage}>
                                <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        )
                    )}
                 </View>
             </View>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
