import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { subjectService } from '../../../services/subject.service';
import { SubjectResponse } from '../../../types/subject';

export default function AdminSubjectsScreen() {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await subjectService.getSubjects();
      // Handle both { items: [] } and direct array [] responses
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubjects();
    setRefreshing(false);
  };

  const filteredSubjects = subjects.filter(s => 
    s.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Subject Management</Text>
        <TouchableOpacity onPress={() => router.push('/admin/subjects/create' as any)}>
           <Ionicons name="add-circle-outline" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-6 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search subjects..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filteredSubjects}
          keyExtractor={(item, index) => item.subjectId || index.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex-row items-center justify-between"
              onPress={() => router.push(`/admin/subjects/${item.subjectId}` as any)}
            >
              <View className="flex-1">
                 <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">{item.subjectName}</Text>
                 <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Max {item.maxPeriod} periods/week</Text>
                 </View>
              </View>
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                 <Ionicons name="chevron-forward" size={18} color="#136ADA" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Ionicons name="book-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No subjects found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
