import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { teacherService } from '../../../../services/teacher.service';
import { TeacherResponse } from '../../../../types/teacher';

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics:   { bg: '#EFF6FF', text: '#136ADA' },
  Chemistry:     { bg: '#F0FDF4', text: '#22C55E' },
  Physics:       { bg: '#FFF7ED', text: '#F97316' },
  Literature:    { bg: '#FDF4FF', text: '#A855F7' },
  English:       { bg: '#F0FDFA', text: '#14B8A6' },
  History:       { bg: '#FEFCE8', text: '#EAB308' },
  'Physical Ed': { bg: '#FFF1F2', text: '#F43F5E' },
};

export default function OtherTeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TeacherResponse | null>(null);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const data = await teacherService.getTeacherById(id);
      setProfile(data);
    } catch (error) {
      Alert.alert('Error', 'Cannot load teacher information.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ label, value, icon }: any) => (
    <View className="mb-4 flex-row items-center bg-gray-50 p-3 rounded-xl">
      <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 shadow-sm border border-gray-100">
        <Ionicons name={icon} size={16} color="#136ADA" />
      </View>
      <View>
        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase mb-0.5">{label}</Text>
        <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{value || 'N/A'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  const firstSubject = profile?.subjectNames?.[0] || '';
  const subjectCol = firstSubject ? (SUBJECT_COLORS[firstSubject] || { bg: '#F3F4F6', text: '#6B7280' }) : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Teacher Information</Text>
      </View>

      <ScrollView className="flex-1 pt-5 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center mb-4">
            <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7', fontSize: 40 }}>
              {profile?.fullName?.charAt(0)}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl mb-1">{profile?.fullName}</Text>
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 mb-3">{profile?.email}</Text>
          {subjectCol && (
            <View style={{ backgroundColor: subjectCol.bg }} className="px-4 py-1.5 rounded-full">
              <Text style={{ fontFamily: 'Poppins-Bold', color: subjectCol.text, fontSize: 13 }}>{profile?.subjectNames?.join(', ')}</Text>
            </View>
          )}
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm mb-10 border border-gray-100">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-base mb-4">Contact Profile</Text>
          
          <InfoRow label="Phone Number" value={profile?.phoneNumber} icon="call-outline" />
          <InfoRow label="Birthday" value={profile?.birthday ? profile.birthday.split('T')[0] : null} icon="calendar-outline" />
          <InfoRow label="Address" value={profile?.address} icon="location-outline" />
          <InfoRow label="Work Email" value={profile?.email} icon="mail-outline" />
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
