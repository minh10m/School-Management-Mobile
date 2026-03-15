import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const ROLES = ['Student', 'Teacher', 'Admin'];
const GRADES = ['10A1', '10A2', '11A1', '11B1', '12A1'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Literature', 'English', 'History'];

export default function AdminCreateUserScreen() {
  const [form, setForm] = useState({
    username: '', password: '', email: '', phone: '',
    fullName: '', address: '', birthday: '',
    role: 'Student', classYearId: '', subjectId: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.username || !form.password || !form.fullName || !form.email) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    Alert.alert('Thành công', `Đã tạo tài khoản cho ${form.fullName}`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const Field = ({ label, value, onChangeText, placeholder, secureTextEntry = false }: any) => (
    <View className="mb-4">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9CA3AF"
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black text-sm"
        style={{ fontFamily: 'Poppins-Regular' }}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">Create User</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <Field label="Username *" value={form.username} onChangeText={(v: string) => set('username', v)} placeholder="username" />
        <Field label="Password *" value={form.password} onChangeText={(v: string) => set('password', v)} placeholder="••••••••" secureTextEntry />
        <Field label="Full Name *" value={form.fullName} onChangeText={(v: string) => set('fullName', v)} placeholder="Nguyen Van A" />
        <Field label="Email *" value={form.email} onChangeText={(v: string) => set('email', v)} placeholder="user@school.edu" />
        <Field label="Phone" value={form.phone} onChangeText={(v: string) => set('phone', v)} placeholder="09xxxxxxxx" />
        <Field label="Address" value={form.address} onChangeText={(v: string) => set('address', v)} placeholder="123 Đường ABC..." />
        <Field label="Birthday (YYYY-MM-DD)" value={form.birthday} onChangeText={(v: string) => set('birthday', v)} placeholder="2000-01-15" />

        {/* Role Picker */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">Role *</Text>
          <View className="flex-row gap-2">
            {ROLES.map(r => (
              <TouchableOpacity
                key={r} onPress={() => set('role', r)}
                className={`flex-1 py-2.5 rounded-xl border items-center ${form.role === r ? 'bg-bright-blue border-bright-blue' : 'bg-white border-gray-200'}`}
              >
                <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: form.role === r ? 'white' : '#6B7280' }}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Class (Student only) */}
        {form.role === 'Student' && (
          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">Class *</Text>
            <View className="flex-row flex-wrap gap-2">
              {GRADES.map(g => (
                <TouchableOpacity key={g} onPress={() => set('classYearId', g)}
                  className={`px-4 py-2 rounded-xl border ${form.classYearId === g ? 'bg-bright-blue border-bright-blue' : 'bg-white border-gray-200'}`}
                >
                  <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: form.classYearId === g ? 'white' : '#6B7280' }}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Subject (Teacher only) */}
        {form.role === 'Teacher' && (
          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">Subject *</Text>
            <View className="flex-row flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <TouchableOpacity key={s} onPress={() => set('subjectId', s)}
                  className={`px-4 py-2 rounded-xl border ${form.subjectId === s ? 'bg-bright-blue border-bright-blue' : 'bg-white border-gray-200'}`}
                >
                  <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: form.subjectId === s ? 'white' : '#6B7280' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          className="bg-bright-blue rounded-2xl py-4 items-center mt-4 mb-10"
          onPress={handleSubmit}
        >
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
