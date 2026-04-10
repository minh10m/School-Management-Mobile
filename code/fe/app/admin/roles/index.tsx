import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { roleService } from '../../../services/role.service';
import { RoleResponse } from '../../../types/role';

export default function AdminRolesScreen() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roleService.getRoles({
        search: search || undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      // Handle both { items: [] } and direct array [] responses
      const data = Array.isArray(res) ? res : res.items || [];
      setRoles(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoles();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Role Management</Text>
      </View>

      {/* Search */}
      <View className="px-6 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search roles..."
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
          data={roles}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">{item.name}</Text>
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs mt-1">
                  Normalized: {item.normalizedName}
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                 <Ionicons name="shield-checkmark" size={20} color="#136ADA" />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Ionicons name="shield-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No roles found</Text>
            </View>
          }
        />
      )}

      {/* Note for Admin */}
      <View className="p-6 bg-white border-t border-gray-100 italic">
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px] text-center">
          Roles define access levels. Standard roles are Student, Teacher, and Admin.
        </Text>
      </View>
    </SafeAreaView>
  );
}
