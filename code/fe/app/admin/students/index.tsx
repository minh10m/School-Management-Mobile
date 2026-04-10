import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../../services/student.service';
import { classYearService } from '../../../services/classYear.service';
import { StudentListItem } from '../../../types/student';
import { ClassYearResponse } from '../../../types/classYear';
import { SCHOOL_YEAR } from '../../../constants/config';

export default function AdminStudentsScreen() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();

  const loadInitialData = async () => {
    try {
      const cls = await classYearService.getClassYears({ schoolYear: SCHOOL_YEAR });
      setClasses(Array.isArray(cls) ? cls : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const selectedClass = classes.find(c => c.classYearId === selectedClassId);
      const res = await studentService.getStudents({
        search,
        className: selectedClass?.className,
        grade: selectedGrade,
        pageSize: 50
      });
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedClassId, selectedGrade, classes]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Student Management</Text>
        <TouchableOpacity onPress={() => router.push('/admin/students/promote')}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">Promote</Text>
        </TouchableOpacity>
        <View className="w-4" />
        <TouchableOpacity onPress={() => router.push('/admin/students/create' as any)}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">Create</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-gray-100 px-6 py-3 gap-3">
        {/* Search */}
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search students..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Class Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
           <TouchableOpacity
              onPress={() => setSelectedClassId(undefined)}
              className={`px-3 py-1.5 rounded-full ${!selectedClassId ? 'bg-bright-blue' : 'bg-gray-100'}`}
            >
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: !selectedClassId ? 'white' : '#6B7280' }}>
                All Classes
              </Text>
            </TouchableOpacity>
          {(classes || []).map(c => (
            <TouchableOpacity
              key={c.classYearId}
              onPress={() => setSelectedClassId(c.classYearId)}
              className={`px-3 py-1.5 rounded-full ${selectedClassId === c.classYearId ? 'bg-bright-blue' : 'bg-gray-100'}`}
            >
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: selectedClassId === c.classYearId ? 'white' : '#6B7280' }}>
                {c.className}
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
          data={students}
          keyExtractor={(item, index) => item.studentId || index.toString()}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center gap-3 shadow-sm"
              onPress={() => router.push(`/admin/students/${item.studentId}` as any)}
            >
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center">
                <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA' }}>{item.fullName.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{item.fullName}</Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <View className="bg-teal-50 px-2 py-0.5 rounded-full">
                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 10, color: '#0D9488' }}>Class {item.className}</Text>
                  </View>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px]">Grade {item.grade}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No students found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
