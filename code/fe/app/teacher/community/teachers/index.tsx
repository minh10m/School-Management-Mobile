import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { teacherService } from '../../../../services/teacher.service';
import { TeacherListItem } from '../../../../types/teacher';

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics:   { bg: '#EFF6FF', text: '#136ADA' },
  Chemistry:     { bg: '#F0FDF4', text: '#22C55E' },
  Physics:       { bg: '#FFF7ED', text: '#F97316' },
  Literature:    { bg: '#FDF4FF', text: '#A855F7' },
  English:       { bg: '#F0FDFA', text: '#14B8A6' },
  History:       { bg: '#FEFCE8', text: '#EAB308' },
  'Physical Ed': { bg: '#FFF1F2', text: '#F43F5E' },
};

export default function TeacherListScreen() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getTeachers({
        search: search || undefined,
      });
      setTeachers(response.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderTeacher = ({ item }: { item: TeacherListItem }) => {
    const firstSubject = item.subjectNames?.[0] || '';
    const col = SUBJECT_COLORS[firstSubject] || { bg: '#F3F4F6', text: '#6B7280' };
    
    return (
      <TouchableOpacity
        onPress={() => router.push(`/teacher/community/teachers/${item.teacherId}`)}
        className="bg-white p-4 rounded-2xl mb-3 flex-row items-center border border-gray-100 shadow-sm"
      >
        <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mr-4">
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-purple-600 text-lg">
            {item.fullName.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-base">{item.fullName}</Text>
          <View style={{ backgroundColor: col.bg }} className="px-2 py-0.5 rounded-full self-start">
            <Text style={{ fontFamily: 'Poppins-Medium', color: col.text, fontSize: 10 }}>{item.subjectNames?.join(', ') || 'No Subject'}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl flex-1">Other Teachers</Text>
        </View>

        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search teachers..."
            className="flex-1 ml-2 text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchTeachers}
          />
        </View>
      </View>

      <View className="flex-1 px-6 pt-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#136ADA" />
          </View>
        ) : (
          <FlatList
            data={teachers}
            renderItem={renderTeacher}
            keyExtractor={(item) => item.teacherId}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center pt-10">
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">No teachers found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
