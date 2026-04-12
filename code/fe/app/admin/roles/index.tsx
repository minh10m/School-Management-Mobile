import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { roleService } from "../../../services/role.service";
import { RoleResponse } from "../../../types/role";

export default function AdminRolesScreen() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roleService.getRoles({
        sortBy: "name",
        sortOrder: "asc",
      });
      // Handle both { items: [] } and direct array [] responses
      const data = Array.isArray(res) ? res : res.items || [];
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoles();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Synchronized Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-xl text-black flex-1"
        >
          Quản lý Vai trò
        </Text>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={roles}
          keyExtractor={(item) => item.roleId}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 16,
            gap: 12,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-black text-base"
                >
                  {item.name}
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Regular" }}
                  className="text-gray-400 text-[10px] mt-0.5"
                >
                  Cấp độ Truy cập: {item.normalizedName}
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
                <Ionicons name="shield-checkmark" size={20} color="#136ADA" />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="shield-outline" size={64} color="#E5E7EB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center"
              >
                Không tìm thấy vai trò nào
              </Text>
            </View>
          }
        />
      )}

      {/* Synchronized Footer Note */}
      <View className="p-6 bg-gray-50/50 border-t border-gray-50">
        <Text
          style={{ fontFamily: "Poppins-Medium" }}
          className="text-gray-400 text-[10px] text-center italic"
        >
          Vai trò xác định cấp độ truy cập toàn hệ thống. Các vai trò chuẩn bao gồm Quản trị, Giáo viên và Học sinh.
        </Text>
      </View>
    </SafeAreaView>
  );
}
