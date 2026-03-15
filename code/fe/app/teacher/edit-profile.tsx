import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const MOCK_ME = {
  teacherId: 'T-001',
  fullName: 'Tran Thi Mai',
  email: 'mai@school.edu',
  phone: '0901111111',
  birthday: '1985-05-20',
  subjects: ['Mathematics'],
};

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics:   { bg: '#EFF6FF', text: '#136ADA' },
  Chemistry:     { bg: '#F0FDF4', text: '#22C55E' },
  Physics:       { bg: '#FFF7ED', text: '#F97316' },
  Literature:    { bg: '#FDF4FF', text: '#A855F7' },
  English:       { bg: '#F0FDFA', text: '#14B8A6' },
  History:       { bg: '#FEFCE8', text: '#EAB308' },
  'Physical Ed': { bg: '#FFF1F2', text: '#F43F5E' },
};

export default function TeacherEditProfileScreen() {
  const [form, setForm] = useState({
    fullName: MOCK_ME.fullName,
    email:    MOCK_ME.email,
    phone:    MOCK_ME.phone,
    birthday: MOCK_ME.birthday,
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.fullName || !form.email) {
      Alert.alert('Lỗi', 'Vui lòng điền họ tên và email.');
      return;
    }
    Alert.alert('Thành công', 'Thông tin của bạn đã được cập nhật!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const Field = ({ label, value, onChangeText, placeholder, icon }: any) => (
    <View className="mb-4">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5">{label}</Text>
      <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 gap-2">
        <Ionicons name={icon} size={16} color="#9CA3AF" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 py-3 text-black text-sm"
          style={{ fontFamily: 'Poppins-Regular' }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Edit My Profile</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-5" showsVerticalScrollIndicator={false}>

        {/* Avatar area */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center mb-2">
            <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7', fontSize: 30 }}>
              {form.fullName.charAt(0)}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-base">{form.fullName}</Text>
          <View className="flex-row flex-wrap justify-center gap-2 mt-2">
            {MOCK_ME.subjects.map(sub => {
              const col = SUBJECT_COLORS[sub] ?? { bg: '#F3F4F6', text: '#6B7280' };
              return (
                <View key={sub} style={{ backgroundColor: col.bg }} className="px-3 py-1 rounded-full">
                  <Text style={{ fontFamily: 'Poppins-Medium', color: col.text, fontSize: 12 }}>{sub}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Note */}
        <View className="bg-blue-50 rounded-xl px-4 py-3 mb-5 flex-row gap-2">
          <Ionicons name="information-circle-outline" size={18} color="#136ADA" />
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-bright-blue text-xs flex-1">
            Bạn chỉ có thể thay đổi họ tên, email, số điện thoại và ngày sinh. Môn học do Admin quản lý.
          </Text>
        </View>

        <Field label="Full Name *"  value={form.fullName} onChangeText={(v: string) => set('fullName', v)} placeholder="Họ tên đầy đủ" icon="person-outline" />
        <Field label="Email *"      value={form.email}    onChangeText={(v: string) => set('email', v)}    placeholder="email@school.edu"  icon="mail-outline" />
        <Field label="Phone"        value={form.phone}    onChangeText={(v: string) => set('phone', v)}    placeholder="09xxxxxxxx"         icon="call-outline" />
        <Field label="Birthday"     value={form.birthday} onChangeText={(v: string) => set('birthday', v)} placeholder="YYYY-MM-DD"         icon="calendar-outline" />

        <TouchableOpacity
          className="bg-bright-blue rounded-2xl py-4 items-center mt-2 mb-10"
          onPress={handleSave}
        >
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
