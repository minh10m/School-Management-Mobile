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
import { useRouter, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from "react";
import { roleService } from "../../../services/role.service";
import { RoleResponse } from "../../../types/role";

export default function AdminRolesScreen() {
  const router = useRouter();
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
    <AdminPageWrapper title="Quản lý Vai trò">

      {/* Standardized Role List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={roles}
          keyExtractor={(item) => item.roleId}
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-black mb-1">{item.name}</Text>
                <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
                  <View className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 10, color: "#136ADA" }}>MÃ: {item.normalizedName}</Text>
                  </View>
                </View>
              </View>
              <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center border border-blue-100">
                <Ionicons name="shield-checkmark-outline" size={24} color="#136ADA" />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="shield-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center px-10">
                Không tìm thấy vai trò nào trong hệ thống.
              </Text>
            </View>
          }
          ListFooterComponent={
            <View className="px-6 py-10 bg-white">
              <View className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100/50">
                 <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] text-center italic leading-4">
                  Vai trò xác định cấp độ truy cập toàn hệ thống. Các vai trò chuẩn bao gồm Quản trị, Giáo viên và Học sinh.
                </Text>
              </View>
              <View className="h-20" />
            </View>
          }
        />
      )}
    </AdminPageWrapper>
  );
}
