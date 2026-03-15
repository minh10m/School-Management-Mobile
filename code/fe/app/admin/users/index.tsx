import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const MOCK_USERS = [
  { userId: '1', username: 'admin01', fullName: 'Nguyen Van Admin', role: 'Admin', email: 'admin@school.edu', lockoutEnd: null },
  { userId: '2', username: 'teacher01', fullName: 'Tran Thi Mai', role: 'Teacher', email: 'mai@school.edu', lockoutEnd: null },
  { userId: '3', username: 'student01', fullName: 'Le Van Minh', role: 'Student', email: 'minh@school.edu', lockoutEnd: null },
  { userId: '4', username: 'teacher02', fullName: 'Pham Thi Lan', role: 'Teacher', email: 'lan@school.edu', lockoutEnd: null },
  { userId: '5', username: 'student02', fullName: 'Hoang Van Nam', role: 'Student', email: 'nam@school.edu', lockoutEnd: '2099-12-31' },
  { userId: '6', username: 'student03', fullName: 'Nguyen Thi Hoa', role: 'Student', email: 'hoa@school.edu', lockoutEnd: null },
  { userId: '7', username: 'teacher03', fullName: 'Do Van Duc', role: 'Teacher', email: 'duc@school.edu', lockoutEnd: null },
];

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Admin:   { bg: '#EFF6FF', text: '#136ADA' },
  Teacher: { bg: '#F3E8FF', text: '#A855F7' },
  Student: { bg: '#F0FDF4', text: '#22C55E' },
};

const TABS = ['All', 'Admin', 'Teacher', 'Student'];

export default function AdminUsersScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_USERS.filter(u => {
    const matchRole = activeTab === 'All' || u.role === activeTab;
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const RoleBadge = ({ role }: { role: string }) => {
    const c = ROLE_COLORS[role] ?? { bg: '#F3F4F6', text: '#6B7280' };
    return (
      <View style={{ backgroundColor: c.bg }} className="px-2 py-0.5 rounded-full">
        <Text style={{ fontFamily: 'Poppins-Medium', color: c.text, fontSize: 10 }}>{role}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">User Management</Text>
        <TouchableOpacity onPress={() => router.push('/admin/users/create' as any)}>
          <Ionicons name="person-add-outline" size={24} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-6 py-3 bg-white">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-3 gap-2 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search users..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 py-2.5 text-black text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Role Tabs */}
      <View className="flex-row px-6 py-2 bg-white border-b border-gray-100 gap-2">
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full ${activeTab === tab ? 'bg-bright-blue' : 'bg-gray-100'}`}
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: activeTab === tab ? 'white' : '#6B7280' }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.userId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center gap-3"
            onPress={() => router.push(`/admin/users/${item.userId}` as any)}
          >
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA', fontSize: 16 }}>
                {item.fullName.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-0.5">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{item.fullName}</Text>
                {item.lockoutEnd && <Ionicons name="lock-closed" size={12} color="#EF4444" />}
              </View>
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs mb-1">{item.email}</Text>
              <RoleBadge role={item.role} />
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No users found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
