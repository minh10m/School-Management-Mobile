import { Image } from 'expo-image';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <View className="flex-1 px-6 justify-center">
        
        {/* Illustration */}
        <View className="items-center mb-5">
            <Image 
                source={require('../assets/images/login.png')} 
                style={{ width: 300, height: 300 }}
                contentFit="contain"
            />
        </View>

        {/* Welcome Text */}
        <Text className="text-bright-blue font-poppins text-lg text-center mb-8">
            Hello, Login to continue using our app
        </Text>

        {/* Inputs */}
        <View className="space-y-4 w-full">
            <View>
                <TextInput 
                    placeholder="Email id or Phone number"
                    placeholderTextColor="#9CA3AF"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-poppins text-base"
                />
            </View>
            
            <View className="relative justify-center">
                <TextInput 
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!passwordVisible}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-poppins text-base pr-12"
                />
                <TouchableOpacity 
                    className="absolute right-4"
                    onPress={() => setPasswordVisible(!passwordVisible)}
                >
                    <Ionicons 
                        name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                        size={24} 
                        color="#9CA3AF" 
                    />
                </TouchableOpacity>
            </View>
        </View>

        {/* Forget Password */}
        <View className="w-full items-end mt-2 mb-8">
            <TouchableOpacity>
                <Text className="text-bright-blue font-poppins text-sm">Forget password?</Text>
            </TouchableOpacity>
        </View>

        {/* Log In Button */}
        <TouchableOpacity 
            className="bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90 mb-4"
            onPress={() => router.replace('/home' as Href)}
        >
            <Text className="text-white font-poppins-semibold text-lg">Log in</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-4">
            <Text className="text-gray-500 font-poppins text-base">Don’t have an account ? </Text>
            <Link href="/signup" asChild>
                <TouchableOpacity>
                    <Text className="text-bright-blue font-poppins-semibold text-base">Sign up</Text>
                </TouchableOpacity>
            </Link>
        </View>

      </View>
    </SafeAreaView>
  );
}
