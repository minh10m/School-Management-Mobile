import { Image } from 'expo-image';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { registerForPushNotificationsAsync } from '../utils/notifications';

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Register for Push Notifications
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await setDoc(doc(database, 'users', email.toLowerCase()), {
            pushToken: token
        }, { merge: true });
      }

      router.replace('/home' as Href);
    } catch (error: any) {
      console.error(error);
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>
            
            <View className="relative justify-center">
                <TextInput 
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!passwordVisible}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-poppins text-base pr-12"
                    value={password}
                    onChangeText={setPassword}
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
            className={`bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90 mb-4 ${loading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={loading}
        >
            <Text className="text-white font-poppins-semibold text-lg">
                {loading ? 'Logging in...' : 'Log in'}
            </Text>
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
