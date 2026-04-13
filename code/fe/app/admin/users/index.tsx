import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { AdminLayout } from "../../../components/ui/AdminLayout";
import { useState, useEffect, useCallback } from "react";
import { userService } from "../../../services/user.service";
import { UserListItem } from "../../../types/user";

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> =
  {
    Admin: { bg: "#EFF6FF", text: "#136ADA", label: "Quản trị" },
    Teacher: { bg: "#F3E8FF", text: "#A855F7", label: "Giáo viên" },
    Student: { bg: "#F0FDF4", text: "#22C55E", label: "Học sinh" },
  };

const TABS = ["Tất cả", "Admin", "Teacher", "Student"];
const TAB_LABELS: Record<string, string> = {
  All: "Tất cả",
  Admin: "Quản trị",
  Teacher: "Giáo viên",
  Student: "Học sinh",
};

export default function AdminUsersScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [users, setUsers] = useState<UserListItem[]>([]);

  // States for applied filters
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  // States for modal inputs
  const [tempTab, setTempTab] = useState("All");
  const [tempSearch, setTempSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({
        FullName: search || undefined,
        Role: activeTab === "All" ? undefined : activeTab,
        PageSize: 50,
        sortBy: "FullName",
        isAscending: true,
      });
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const openFilter = () => {
    setTempSearch(search);
    setTempTab(activeTab);
    setIsFilterVisible(true);
  };

  const applyFilters = () => {
    setSearch(tempSearch);
    setActiveTab(tempTab);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setTempSearch("");
    setTempTab("All");
    setSearch("");
    setActiveTab("All");
    setIsFilterVisible(false);
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const c = ROLE_COLORS[role] ?? { bg: "#F9FAFB", text: "#9CA3AF" };
    return (
      <View
        style={{ borderColor: c.text + '40' }}
        className="px-2.5 py-1 rounded-xl border"
      >
        <Text
          style={{ fontFamily: "Poppins-Bold", color: c.text, fontSize: 10 }}
        >
          {c.label || role.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <AdminLayout
      title="Quản lý Người dùng"
      rightComponent={
        <TouchableOpacity
          onPress={() => router.push("/admin/users/create" as any)}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-xs">Thêm mới</Text>
        </TouchableOpacity>
      }
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm người dùng...",
        onFilterPress: openFilter,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {/* Advanced Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Bộ lọc</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-white p-2 rounded-full border border-gray-100">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: Role Selection */}
              <View className="mb-12">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">QUYỀN TRUY CẬP</Text>
                <View className="flex-row flex-wrap gap-2">
                  {TABS.map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setTempTab(tab)}
                      className={`px-5 py-2.5 rounded-2xl border ${tempTab === tab ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"}`}
                    >
                      <Text
                        style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempTab === tab ? "#1D4ED8" : "#9CA3AF" }}
                      >
                        {(TAB_LABELS[tab] || tab).toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-50 h-16 rounded-[22px] items-center justify-center border border-gray-100"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 15 }} className="text-gray-400">Thiết lập lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 bg-[#136ADA] h-16 rounded-[22px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 15 }} className="text-white">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* User List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.userId}
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white rounded-[32px] p-5 border border-gray-100 flex-row items-center shadow-sm"
              onPress={() => router.push(`/admin/users/${item.userId}` as any)}
            >
              {/* Avatar Section */}
              <View className="w-16 h-16 rounded-[24px] bg-blue-50 items-center justify-center border border-blue-100">
                <Text
                  style={{
                    fontFamily: "Poppins-Bold",
                    color: "#136ADA",
                    fontSize: 22,
                  }}
                >
                  {item.fullName.charAt(0)}
                </Text>
              </View>

              <View className="flex-1 ml-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-black">{item.fullName}</Text>
                  {item.lockoutEnd && (
                    <Ionicons name="lock-closed" size={14} color="#EF4444" />
                  )}
                </View>
                <Text style={{ fontFamily: "Poppins-Medium", fontSize: 11 }} className="text-gray-400 mb-2.5">@{item.userName}</Text>
                <View className="flex-row">
                  <RoleBadge role={item.role ?? "User"} />
                </View>
              </View>
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
                <Ionicons name="chevron-forward" size={18} color="#136ADA" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center px-10"
              >
                Không tìm thấy người dùng nào.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminLayout>
  );
}
