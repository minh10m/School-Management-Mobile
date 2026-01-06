import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { registerForPushNotificationsAsync } from '../utils/notifications';

export default function SignupScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // 1. Create User in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Display Name
      await updateProfile(user, {
        displayName: name
      });

      // 3. Register for Push Notifications
      const token = await registerForPushNotificationsAsync();

      // 4. Save User to Firestore (for Search)
      await setDoc(doc(database, 'users', email.toLowerCase()), { // Use email as ID for easy finding, or UID
        uid: user.uid,
        name: name,
        email: email.toLowerCase(),
        avatar: 'https://via.placeholder.com/150', // Default avatar
        createdAt: new Date(),
        pushToken: token || null
      });

      alert("Account created successfully!");
      router.replace('/home' as Href);
    } catch (error: any) {
      console.error(error);
      alert("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
            
            {/* Header Text */}
            <View className="mb-10 mt-10">
                <Text className="text-bright-blue font-poppins-bold text-3xl mb-2">Sign up</Text>
                <Text className="text-gray-500 font-poppins text-base">Create an account to get started</Text>
            </View>

            {/* Inputs */}
            <View className="space-y-4 w-full mb-8">
                <View>
                    <Text className="text-black font-poppins-medium text-sm mb-2 ml-1">Name</Text>
                    <TextInput 
                        placeholder="John Doe"
                        placeholderTextColor="#9CA3AF"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 font-poppins text-base"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View>
                    <Text className="text-black font-poppins-medium text-sm mb-2 ml-1">Email Address</Text>
                    <TextInput 
                        placeholder="name@email.com"
                        placeholderTextColor="#9CA3AF"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 font-poppins text-base"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                
                <View>
                    <Text className="text-black font-poppins-medium text-sm mb-2 ml-1">Password</Text>
                    <View className="relative justify-center">
                        <TextInput 
                            placeholder="Create a password"
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
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity 
                className={`bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90 mb-6 ${loading ? 'opacity-70' : ''}`}
                onPress={handleSignup}
                disabled={loading}
            >
                <Text className="text-white font-poppins-semibold text-lg">
                    {loading ? 'Creating Account...' : 'Sign up'}
                </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mb-10">
                <Text className="text-gray-500 font-poppins text-base">Already have an account? </Text>
                <Link href="/login" asChild>
                    <TouchableOpacity>
                        <Text className="text-bright-blue font-poppins-semibold text-base">Log in</Text>
                    </TouchableOpacity>
                </Link>
            </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
