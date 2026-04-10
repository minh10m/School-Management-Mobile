import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { subjectService } from '../../../services/subject.service';

export default function AdminCreateSubjectScreen() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subjectName: '',
    maxPeriod: 0
  });

  const handleSubmit = async () => {
    if (!form.subjectName || form.maxPeriod <= 0) {
      Alert.alert('Missing Info', 'Please provide a valid Subject Name and Max Periods per week (>0).');
      return;
    }

    try {
      setLoading(true);
      await subjectService.createSubject(form);
      Alert.alert('Success', 'Subject created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">Create New Subject</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        <View className="gap-8 pb-20">
           <View className="items-center mb-4">
              <View className="w-20 h-20 bg-blue-50 items-center justify-center rounded-3xl">
                 <Ionicons name="book-outline" size={40} color="#136ADA" />
              </View>
           </View>

           <View>
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">Subject Name *</Text>
              <TextInput
                placeholder="e.g. Mathematics"
                value={form.subjectName}
                onChangeText={(t) => setForm({...form, subjectName: t})}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black text-base"
                style={{ fontFamily: 'Poppins-Regular' }}
                placeholderTextColor="#9CA3AF"
              />
           </View>

           <View>
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">Max Periods per Week *</Text>
              <TextInput
                placeholder="e.g. 5"
                value={form.maxPeriod.toString()}
                onChangeText={(t) => setForm({...form, maxPeriod: parseInt(t) || 0})}
                keyboardType="numeric"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black text-base"
                style={{ fontFamily: 'Poppins-Regular' }}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px] mt-1 ml-1">
                 Total number of school hours for this subject in a student's weekly schedule.
              </Text>
           </View>

           <TouchableOpacity 
             className="bg-bright-blue rounded-3xl py-4 items-center mt-10 shadow-xl shadow-blue-200"
             onPress={handleSubmit}
             disabled={loading}
           >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Register Subject</Text>
              )}
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
