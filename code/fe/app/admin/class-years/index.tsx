import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { classYearService } from '../../../services/classYear.service';
import { ClassYearResponse } from '../../../types/classYear';

export default function AdminClassYearsScreen() {
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [grade, setGrade] = useState<number | undefined>();
  const [schoolYear, setSchoolYear] = useState('2026');

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await classYearService.getClassYears({
        schoolYear,
        grade
      });
      // Handle both { items: [] } and direct array [] responses
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [schoolYear, grade]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

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
        <TouchableOpacity onPress={() => router.push('/admin/class-years/create' as any)}>
          <Ionicons name="add-circle-outline" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-gray-100 px-6 py-3 gap-3">
         <View className="flex-row items-center gap-2">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs">School Year:</Text>
            <TextInput
               value={schoolYear}
               onChangeText={setSchoolYear}
               placeholder="2026"
               className="bg-gray-100 px-3 py-1 rounded-lg text-black text-xs min-w-[60px]"
            />
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
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
              onPress={() => router.push(`/admin/class-years/${item.classYearId}` as any)}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-blue-50 px-3 py-1 rounded-full">
                  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14, color: '#136ADA' }}>{item.className}</Text>
                </View>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Year: {item.schoolYear}</Text>
              </View>
              
              <View className="flex-row items-center gap-2 mb-3">
                 <Ionicons name="person-outline" size={14} color="#6B7280" />
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs">Advisor: {item.homeRoomTeacher || 'No Advisor Assigned'}</Text>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
                <View className="flex-row items-center gap-1">
                   <Ionicons name="people-outline" size={14} color="#9CA3AF" />
                   <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px]">{item.studentCount || 0} Students</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </View>
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
