import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { classYearService } from '../../../services/classYear.service';
import { teacherService } from '../../../services/teacher.service';
import { TeacherListItem } from '../../../types/teacher';

export default function AdminCreateClassScreen() {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    className: '',
    grade: 10,
    schoolYear: '2026',
    homeRoomId: ''
  });

  const fetchTeachers = async () => {
    try {
      setFetching(true);
      const res = await teacherService.getTeachers({ pageSize: 100 });
      const tdata = Array.isArray(res) ? res : (res as any).items || [];
      setTeachers(tdata);
      if (tdata.length > 0) setForm(f => ({ ...f, homeRoomId: tdata[0].teacherId }));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async () => {
    if (!form.className || !form.schoolYear || !form.homeRoomId) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await classYearService.createClassYear(form);
      Alert.alert('Success', 'Class created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Creation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">Create Class</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-20">
          <View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1">Class Name *</Text>
            <TextInput
              placeholder="e.g. 10A1"
              value={form.className}
              onChangeText={(t) => setForm({...form, className: t})}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black"
              style={{ fontFamily: 'Poppins-Regular' }}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-2">Grade *</Text>
            <View className="flex-row gap-2">
              {[10, 11, 12].map(g => (
                <TouchableOpacity key={g} 
                  onPress={() => setForm({...form, grade: g})}
                  className={`flex-1 py-4 rounded-2xl border items-center ${form.grade === g ? 'bg-bright-blue border-bright-blue' : 'bg-white border-gray-200'}`}
                >
                  <Text style={{ fontFamily: 'Poppins-Bold', color: form.grade === g ? 'white' : '#6B7280' }}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1">School Year *</Text>
            <TextInput
              placeholder="e.g. 2026"
              value={form.schoolYear}
              onChangeText={(t) => setForm({...form, schoolYear: t})}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black"
              style={{ fontFamily: 'Poppins-Regular' }}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-2">Select Advisor Teacher *</Text>
            <View className="flex-row flex-wrap gap-2">
              {teachers.map(t => (
                <TouchableOpacity key={t.teacherId} 
                  onPress={() => setForm({...form, homeRoomId: t.teacherId})}
                  className={`px-4 py-2 rounded-xl border items-center shadow-sm ${form.homeRoomId === t.teacherId ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-100'}`}
                >
                   <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: form.homeRoomId === t.teacherId ? 'white' : '#6B7280' }}>
                      {t.fullName}
                   </Text>
                </TouchableOpacity>
              ))}
            </View>
            {teachers.length === 0 && <Text className="text-gray-400 text-xs italic">No teachers found</Text>}
          </View>

          <TouchableOpacity 
            className="bg-bright-blue rounded-3xl py-4 items-center mt-4 shadow-xl shadow-blue-200"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Create Class</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
