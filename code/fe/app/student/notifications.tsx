import { View, Text, SectionList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

const NOTIFICATIONS = [
  {
    title: 'Hôm nay',
    data: [
      {
        id: '1',
        title: 'Maths Teacher',
        message: 'Lorem ipsum dolor sit amet, consectetur',
        time: '15 phút',
        unread: true,
        avatar: require('../../assets/images/on-boarding-1.png'),
      },
      {
        id: '2',
        title: 'Science Teacher',
        message: 'Lorem ipsum dolor sit amet, consectetur',
        time: '2 giờ trước',
        unread: true,
        avatar: require('../../assets/images/on-boarding-2.png'),
      },
    ],
  },
  {
    title: 'Hôm qua',
    data: [
      {
        id: '3',
        title: 'English Teacher',
        message: 'Lorem ipsum dolor sit amet, consectetur',
        time: '09/03',
        unread: false,
        avatar: require('../../assets/images/on-boarding-3.png'),
      },
      {
        id: '4',
        title: 'Maths Teacher',
        message: 'Lorem ipsum dolor sit amet, consectetur',
        time: '08/03',
        unread: false,
        avatar: require('../../assets/images/on-boarding-1.png'),
      },
      {
        id: '5',
        title: 'Social Teacher',
        message: 'Lorem ipsum dolor sit amet, consectetur',
        time: '05/03',
        unread: false,
        avatar: require('../../assets/images/on-boarding-2.png'),
      },
      {
        id: '6',
        title: 'English Teacher',
        message: 'Lorem ipsum dolor sit amet, consectetur',
        time: '03/03',
        unread: false,
        avatar: require('../../assets/images/on-boarding-3.png'),
      },
      {
        id: '7',
        title: 'Social Teacher',
        message: 'Lorem ipsum dolor sit amet, consectetur',
        time: '27/02',
        unread: false,
        avatar: require('../../assets/images/on-boarding-2.png'),
      },
    ],
  },
];

export default function NotificationScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen 
        options={{
            headerShown: true,
            title: 'Thông báo',
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
      
      <SectionList
        sections={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center px-6 py-4">
             {/* Unread Dot - Placeholder logic */}
             <View className="w-4 items-center justify-center mr-2">
                {item.unread && (
                    <View className="w-2.5 h-2.5 bg-bright-blue rounded-full" />
                )}
             </View>

            {/* Avatar */}
            <View className="w-14 h-14 rounded-full overflow-hidden mr-4 bg-gray-100">
                <Image 
                    source={item.avatar} 
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                />
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="flex-row justify-between items-start">
                    <Text className="text-black text-base" style={{ fontFamily: 'Poppins-Bold' }}>{item.title}</Text>
                    <Text className="text-gray-400 text-xs" style={{ fontFamily: 'Poppins-Regular' }}>{item.time}</Text>
                </View>
                <Text className="text-gray-400 text-sm pr-4 mt-1" style={{ fontFamily: 'Poppins-Regular' }} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className="px-6 py-2 bg-white mt-4">
            <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Medium' }}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
