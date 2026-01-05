import { Image } from 'expo-image';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef } from 'react';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Bus Tracking',
    subtitle: "Track Your Child's Bus in Real Time",
    image: require('../assets/images/on-boarding-1.png'), // Placeholder
  },
  {
    id: '2',
    title: 'Daily Attendance',
    subtitle: 'Stay on Top of Assignments: Daily Homework Updates',
    image: require('../assets/images/on-boarding-2.png'), // Using same placeholder for now
  },
  {
    id: '3',
    title: 'Exam Schedule',
    subtitle: 'Stay Updated with Exam Dates and Times',
    image: require('../assets/images/on-boarding-3.png'), // Using same placeholder for now
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 justify-between py-4">
        {/* Header - Skip Button */}
        <View className="flex-row justify-end pt-4 px-6">
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-bright-blue font-poppins-medium text-base">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content Slider */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_DATA}
          renderItem={({ item }) => (
            <View style={{ width }} className="items-center justify-center px-6">
              {/* Illustration Placeholder */}
              <View className="w-full h-80 rounded-3xl items-center justify-center mb-10 overflow-hidden">
                <Image
                  source={item.image}
                  style={{ width: 400, height: 400 }}
                  contentFit="contain"
                />
              </View>

              {/* Title */}
              <Text className="text-bright-blue font-poppins-bold text-3xl text-center mb-2 uppercase">
                {item.title}
              </Text>

              {/* Subtitle */}
              <Text className="text-gray-500 font-poppins text-base text-center px-4">
                {item.subtitle}
              </Text>
            </View>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
        />

        {/* Footer */}
        <View className="items-center mb-8 px-6">
          {/* Pagination Dots */}
          <View className="flex-row space-x-2 mb-8 gap-2">
            {ONBOARDING_DATA.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  currentIndex === index ? 'w-8 bg-bright-blue' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </View>
          <TouchableOpacity 
            className="bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90"
            onPress={handleNext}
          >
            <Text className="text-white font-poppins-semibold text-lg">
                {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
