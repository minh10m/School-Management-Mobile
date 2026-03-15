import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const MOCK_TEACHERS = [
  { teacherId: '1', userId: 'u2', fullName: 'Tran Thi Mai',    subjectName: 'Mathematics', email: 'mai@school.edu' },
  { teacherId: '2', userId: 'u4', fullName: 'Pham Thi Lan',    subjectName: 'Chemistry',   email: 'lan@school.edu' },
  { teacherId: '3', userId: 'u7', fullName: 'Do Van Duc',       subjectName: 'Physics',     email: 'duc@school.edu' },
  { teacherId: '4', userId: 'u8', fullName: 'Nguyen Thi Hoa',  subjectName: 'Literature',  email: 'hoa@school.edu' },
  { teacherId: '5', userId: 'u9', fullName: 'Le Van Nam',       subjectName: 'English',     email: 'nam@school.edu' },
  { teacherId: '6', userId:'u10', fullName: 'Vo Thi Bich',     subjectName: 'History',     email: 'bich@school.edu' },
  { teacherId: '7', userId:'u11', fullName: 'Phan Van Hung',   subjectName: 'Physical Ed', email: 'hung@school.edu' },
];

const SUBJECTS = ['All', 'Mathematics', 'Chemistry', 'Physics', 'Literature', 'English', 'History'];

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics: { bg: '#EFF6FF', text: '#136ADA' },
  Chemistry:   { bg: '#F0FDF4', text: '#22C55E' },
  Physics:     { bg: '#FFF7ED', text: '#F97316' },
  Literature:  { bg: '#FDF4FF', text: '#A855F7' },
  English:     { bg: '#F0FDFA', text: '#14B8A6' },
  History:     { bg: '#FEFCE8', text: '#EAB308' },
  'Physical Ed': { bg: '#FFF1F2', text: '#F43F5E' },
};

export default function AdminTeachersScreen() {
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');

  const filtered = MOCK_TEACHERS.filter(t => {
    const matchSubject = activeSubject === 'All' || t.subjectName === activeSubject;
    const matchSearch  = t.fullName.toLowerCase().includes(search.toLowerCase()) ||
                         t.email.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Teacher Management</Text>
      </View>

      {/* Search */}
      <View className="px-6 py-3 bg-white">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-3 gap-2 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search teachers..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 py-2.5 text-black text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Subject Filter */}
      <View className="bg-white border-b border-gray-100">
        <FlatList
          data={SUBJECTS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
          keyExtractor={s => s}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveSubject(item)}
              className={`px-3 py-1.5 rounded-full ${activeSubject === item ? 'bg-bright-blue' : 'bg-gray-100'}`}
            >
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: activeSubject === item ? 'white' : '#6B7280' }}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.teacherId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListHeaderComponent={
          <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs mb-1">{filtered.length} teachers</Text>
        }
        renderItem={({ item }) => {
          const col = SUBJECT_COLORS[item.subjectName] ?? { bg: '#F3F4F6', text: '#6B7280' };
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl px-4 py-3 border border-gray-100 flex-row items-center gap-3"
              onPress={() => router.push(`/admin/teachers/${item.teacherId}` as any)}
            >
              <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center">
                <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7', fontSize: 18 }}>
                  {item.fullName.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{item.fullName}</Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs mt-0.5">{item.email}</Text>
                <View style={{ backgroundColor: col.bg }} className="self-start mt-1.5 px-2 py-0.5 rounded-full">
                  <Text style={{ fontFamily: 'Poppins-Medium', color: col.text, fontSize: 10 }}>{item.subjectName}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No teachers found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
