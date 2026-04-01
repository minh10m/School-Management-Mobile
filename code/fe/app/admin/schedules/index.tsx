import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../../../services/schedule.service';
import { classYearService } from '../../../services/classYear.service';
import { ScheduleSummary } from '../../../types/schedule';
import { ClassYearResponse } from '../../../types/classYear';

export default function AdminSchedulesScreen() {
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [term, setTerm] = useState('1');

  const loadClasses = async () => {
    try {
      const res = await classYearService.getClassYears({ schoolYear: '2026' });
      setClasses(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scheduleService.getSchedules({
        classYearId: selectedClassId,
        term,
        pageSize: 50
      });
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setSchedules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, term]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Schedule Management</Text>
        <TouchableOpacity onPress={() => router.push('/admin/schedules/create' as any)}>
           <Ionicons name="add-circle-outline" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 gap-4">
         <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
               <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs text-center">Term:</Text>
               <View className="flex-row gap-2">
                  {['1', '2'].map(t => (
                     <TouchableOpacity key={t} 
                       onPress={() => setTerm(t)}
                       className={`px-3 py-1 rounded-lg border ${term === t ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'}`}
                     >
                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 10, color: term === t ? 'white' : '#6B7280' }}>{t}</Text>
                     </TouchableOpacity>
                  ))}
               </View>
            </View>
         </View>

         <View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs mb-2">Filter by Class:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
               <TouchableOpacity 
                  onPress={() => setSelectedClassId(undefined)}
                  className={`px-4 py-2 rounded-2xl border ${!selectedClassId ? 'bg-bright-blue border-bright-blue' : 'bg-gray-50 border-gray-100'}`}
               >
                  <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: !selectedClassId ? 'white' : '#6B7280' }}>All Classes</Text>
               </TouchableOpacity>
               {classes.map(c => (
                  <TouchableOpacity key={c.classYearId} 
                     onPress={() => setSelectedClassId(c.classYearId)}
                     className={`px-4 py-2 rounded-2xl border ${selectedClassId === c.classYearId ? 'bg-bright-blue border-bright-blue' : 'bg-gray-50 border-gray-100'}`}
                  >
                     <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: selectedClassId === c.classYearId ? 'white' : '#6B7280' }}>{c.className}</Text>
                  </TouchableOpacity>
               ))}
            </ScrollView>
         </View>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item, index) => item.scheduleId || index.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
              onPress={() => router.push(`/admin/schedules/${item.scheduleId}` as any)}
            >
              <View className="flex-row items-center justify-between">
                 <View>
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">{item.name || `Schedule - ${item.className}`}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                       <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                          <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 10, color: '#136ADA' }}>Class {item.className}</Text>
                       </View>
                       <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Term {item.term}</Text>
                    </View>
                 </View>
                 <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center">
                    <Ionicons name="calendar" size={20} color="#D97706" />
                 </View>
              </View>
              <View className="flex-row items-center justify-end mt-4 pt-3 border-t border-gray-50">
                 <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: '#136ADA' }}>Manage Periods</Text>
                 <Ionicons name="chevron-forward" size={16} color="#136ADA" className="ml-1" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No schedules found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
import { ScrollView } from 'react-native';
