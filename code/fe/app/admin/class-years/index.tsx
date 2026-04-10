import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { classYearService } from '../../../services/classYear.service';
import { teacherService } from '../../../services/teacher.service';
import { ClassYearResponse } from '../../../types/classYear';
import { TeacherListItem } from '../../../types/teacher';
import { SCHOOL_YEAR } from '../../../constants/config';

export default function AdminClassYearsScreen() {
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [grade, setGrade] = useState<number | undefined>();
  const [schoolYear, setSchoolYear] = useState(SCHOOL_YEAR);
  const [yearInput, setYearInput] = useState(SCHOOL_YEAR);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const [res, teaRes] = await Promise.all([
        classYearService.getClassYears({ schoolYear, grade }),
        teacherService.getTeachers({ pageSize: 100 })
      ]);
      // Handle both { items: [] } and direct array [] responses
      const data = Array.isArray(res) ? res : (res as any).items || [];
      const tdata = Array.isArray(teaRes) ? teaRes : (teaRes as any).items || [];
      setClasses(data);
      setTeachers(tdata);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [schoolYear, grade]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleYearSearch = () => {
    setSchoolYear(yearInput);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  const GRADES = [10, 11, 12];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Class Management</Text>
        <TouchableOpacity onPress={() => router.push('/admin/class-years/promote')}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">Promote</Text>
        </TouchableOpacity>
        <View className="w-4" />
        <TouchableOpacity onPress={() => router.push('/admin/class-years/create' as any)}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">Create</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-gray-100 px-6 py-3 gap-3">
          <View className="flex-row items-center gap-2">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs">School Year:</Text>
             <View className="flex-row items-center bg-gray-100 rounded-lg pr-2 min-w-[100px]">
                <TextInput
                  value={yearInput}
                  onChangeText={setYearInput}
                  onSubmitEditing={handleYearSearch}
                  returnKeyType="search"
                  placeholder={SCHOOL_YEAR}
                  className="flex-1 px-3 py-1 text-black text-xs"
                  style={{ fontFamily: 'Poppins-Regular' }}
                />
                <TouchableOpacity onPress={handleYearSearch}>
                  <Ionicons name="arrow-forward-circle" size={20} color="#136ADA" />
                </TouchableOpacity>
             </View>
          </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setGrade(undefined)}
            className={`px-3 py-1.5 rounded-full ${grade === undefined ? 'bg-bright-blue' : 'bg-gray-100'}`}
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: grade === undefined ? 'white' : '#6B7280' }}>
              All Grades
            </Text>
          </TouchableOpacity>
          {GRADES.map(g => (
            <TouchableOpacity
              key={g}
              onPress={() => setGrade(g)}
              className={`px-3 py-1.5 rounded-full ${grade === g ? 'bg-bright-blue' : 'bg-gray-100'}`}
            >
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: grade === g ? 'white' : '#6B7280' }}>
                Grade {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item, index) => item.classYearId || index.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex-row justify-between items-center"
              onPress={() => router.push(`/admin/class-years/${item.classYearId}` as any)}
            >
              <View className="flex-1 pr-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="bg-blue-50 px-3 py-1 rounded-full">
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14, color: '#136ADA' }}>{item.className}</Text>
                  </View>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Year: {item.schoolYear}</Text>
                </View>
                
                <View className="flex-row items-center gap-2">
                   <Ionicons name="person-outline" size={14} color="#6B7280" />
                   <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs">
                     Advisor: {item.homeRoomTeacher || (item.homeRoomId ? teachers.find(t => t.teacherId === item.homeRoomId)?.fullName : null) || 'No Advisor Assigned'}
                   </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Ionicons name="business-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No classes found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
