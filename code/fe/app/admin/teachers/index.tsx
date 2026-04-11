import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { teacherService } from '../../../services/teacher.service';
import { subjectService } from '../../../services/subject.service';
import { TeacherListItem } from '../../../types/teacher';
import { SubjectResponse } from '../../../types/subject';

export default function AdminTeachersScreen() {
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | undefined>();

  const loadInitialData = async () => {
    try {
      const subRes = await subjectService.getSubjects();
      setSubjects(Array.isArray(subRes) ? subRes : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teacherService.getTeachers({
        search: search || undefined,
        subjectName: selectedSubjectName,
        pageSize: 50,
        sortBy: 'fullName',
        sortOrder: 'asc'
      });
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSubjectName]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Teacher Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-gray-100 px-6 py-3 gap-3">
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search teachers..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setSelectedSubjectName(undefined)}
            className={`px-3 py-1.5 rounded-full ${!selectedSubjectName ? 'bg-bright-blue' : 'bg-gray-100'}`}
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: !selectedSubjectName ? 'white' : '#6B7280' }}>
              All Subjects
            </Text>
          </TouchableOpacity>
          {(subjects || []).map(s => (
            <TouchableOpacity
              key={s.subjectId}
              onPress={() => setSelectedSubjectName(s.subjectName)}
              className={`px-3 py-1.5 rounded-full ${selectedSubjectName === s.subjectName ? 'bg-bright-blue' : 'bg-gray-100'}`}
            >
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: selectedSubjectName === s.subjectName ? 'white' : '#6B7280' }}>
                {s.subjectName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item, index) => item.teacherId || index.toString()}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center gap-3 shadow-sm"
              onPress={() => router.push(`/admin/teachers/${item.teacherId}` as any)}
            >
              <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center">
                <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7' }}>{item.fullName.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{item.fullName}</Text>
                <View className="bg-purple-50 self-start px-2 py-0.5 rounded-full mt-1">
                   <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 10, color: '#A855F7' }}>{item.subjectNames?.join(", ") || "No Subject"}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No teachers found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
