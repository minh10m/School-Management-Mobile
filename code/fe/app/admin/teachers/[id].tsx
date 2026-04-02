import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { teacherService } from '../../../services/teacher.service';
import { TeacherResponse } from '../../../types/teacher';

export default function AdminTeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [teacher, setTeacher] = useState<TeacherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthday: '',
  });

  const fetchTeacher = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await teacherService.getTeacherById(id);
      setTeacher(res);
      setForm({
        fullName: res.fullName || '',
        email: res.email || '',
        phoneNumber: res.phoneNumber || '',
        address: res.address || '',
        birthday: res.birthday ? res.birthday.split('T')[0] : '',
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not fetch teacher details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const updated = await teacherService.updateTeacher(id, {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        birthday: form.birthday || undefined,
      });
      setTeacher(updated);
      setIsEditing(false);
      Alert.alert('Success', 'Teacher details updated successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Update failed.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  if (!teacher) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Teacher not found</Text>
    </SafeAreaView>
  );

  const InfoRow = ({ label, value, icon }: any) => (
    <View className="flex-row items-center p-4 border-b border-gray-50 bg-white">
      <View className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#9CA3AF" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px] uppercase tracking-wider">{label}</Text>
        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm">{value || 'N/A'}</Text>
      </View>
    </View>
  );

  const EditField = ({ label, value, onChangeText, keyboardType = 'default' }: any) => (
    <View className="mb-4">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType as any}
        className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-black text-sm"
        style={{ fontFamily: 'Poppins-Regular' }}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Teacher Detail</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">
             {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white items-center py-8 border-b border-gray-100">
           <View className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center mb-4 border-4 border-white shadow-sm">
              <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7', fontSize: 36 }}>{teacher.fullName.charAt(0)}</Text>
           </View>
           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl">{teacher.fullName}</Text>
           <View className="bg-purple-100 px-4 py-1.5 rounded-full mt-2 border border-purple-200">
              <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#9333EA' }}>
                {teacher.subjectNames?.join(", ") || "No Subject"}
              </Text>
           </View>
        </View>

        {isEditing ? (
          <View className="p-6">
            <EditField label="Full Name" value={form.fullName} onChangeText={(t: string) => setForm({...form, fullName: t})} />
            <EditField label="Email" value={form.email} onChangeText={(t: string) => setForm({...form, email: t})} keyboardType="email-address" />
            <EditField label="Phone" value={form.phoneNumber} onChangeText={(t: string) => setForm({...form, phoneNumber: t})} keyboardType="phone-pad" />
            <EditField label="Address" value={form.address} onChangeText={(t: string) => setForm({...form, address: t})} />
            <EditField label="Birthday (YYYY-MM-DD)" value={form.birthday} onChangeText={(t: string) => setForm({...form, birthday: t})} placeholder="1980-05-15" />

            <TouchableOpacity 
              className="bg-bright-blue rounded-3xl py-4 items-center mt-4 shadow-md shadow-blue-200"
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="white" /> : (
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-4">
             <InfoRow label="Email" value={teacher.email} icon="mail-outline" />
             <InfoRow label="Phone" value={teacher.phoneNumber} icon="call-outline" />
             <InfoRow label="Address" value={teacher.address} icon="location-outline" />
             <InfoRow label="Birthday" value={teacher.birthday ? new Date(teacher.birthday).toLocaleDateString('en-GB') : 'N/A'} icon="calendar-outline" />
             <InfoRow label="User ID" value={teacher.userId} icon="finger-print-outline" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
