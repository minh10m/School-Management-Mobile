import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const GRADES = ['10', '11', '12'];
const TEACHERS = ['Tran Thi Mai', 'Pham Thi Lan', 'Do Van Duc', 'Nguyen Thi Hoa'];

export default function AdminCreateClassYearScreen() {
  const [form, setForm] = useState({ className: '', grade: '10', schoolYear: '2025-2026', homeRoomTeacher: '' });
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">Create Class</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-5" showsVerticalScrollIndicator={false}>
        {/* Class Name */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-1">Class Name *</Text>
          <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-sm">e.g. 10A1</Text>
          </View>
        </View>

        {/* Grade */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">Grade *</Text>
          <View className="flex-row gap-3">
            {GRADES.map(g => (
              <TouchableOpacity key={g} onPress={() => set('grade', g)}
                className={`flex-1 py-3 rounded-xl border items-center ${form.grade === g ? 'bg-bright-blue border-bright-blue' : 'bg-white border-gray-200'}`}
              >
                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14, color: form.grade === g ? 'white' : '#374151' }}>Grade {g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* School Year */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">School Year *</Text>
          {['2024-2025', '2025-2026', '2026-2027'].map(sy => (
            <TouchableOpacity key={sy} onPress={() => set('schoolYear', sy)}
              className={`flex-row items-center justify-between px-4 py-3 mb-2 rounded-xl border ${form.schoolYear === sy ? 'bg-blue-50 border-bright-blue' : 'bg-white border-gray-200'}`}
            >
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 13, color: form.schoolYear === sy ? '#136ADA' : '#374151' }}>{sy}</Text>
              {form.schoolYear === sy && <Ionicons name="checkmark-circle" size={18} color="#136ADA" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Homeroom Teacher */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">Homeroom Teacher *</Text>
          {TEACHERS.map(t => (
            <TouchableOpacity key={t} onPress={() => set('homeRoomTeacher', t)}
              className={`flex-row items-center justify-between px-4 py-3 mb-2 rounded-xl border ${form.homeRoomTeacher === t ? 'bg-blue-50 border-bright-blue' : 'bg-white border-gray-200'}`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
                  <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7', fontSize: 12 }}>{t.charAt(0)}</Text>
                </View>
                <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 13, color: form.homeRoomTeacher === t ? '#136ADA' : '#374151' }}>{t}</Text>
              </View>
              {form.homeRoomTeacher === t && <Ionicons name="checkmark-circle" size={18} color="#136ADA" />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-bright-blue rounded-2xl py-4 items-center mb-10"
          onPress={() => Alert.alert('Thành công', 'Lớp học đã được tạo thành công!', [{ text: 'OK', onPress: () => router.back() }])}
        >
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Create Class</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
