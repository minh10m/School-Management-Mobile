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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { userService } from "../../../services/user.service";
import { UserListItem } from "../../../types/user";

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  Admin: { bg: "#EFF6FF", text: "#136ADA", label: "Quản trị" },
  Teacher: { bg: "#F3E8FF", text: "#A855F7", label: "Giáo viên" },
  Student: { bg: "#F0FDF4", text: "#22C55E", label: "Học sinh" },
};

const TABS = ["Tất cả", "Admin", "Teacher", "Student"];
const TAB_LABELS: Record<string, string> = {
  "All": "Tất cả",
  "Admin": "Quản trị",
  "Teacher": "Giáo viên",
  "Student": "Học sinh"
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
    const c = ROLE_COLORS[role] ?? { bg: "#F3F4F6", text: "#6B7280" };
    return (
      <View
        style={{ backgroundColor: c.bg }}
        className="px-2 py-0.5 rounded-full"
      >
        <Text
          style={{ fontFamily: "Poppins-Medium", color: c.text, fontSize: 10 }}
        >
          {c.label || role}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Synchronized Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-xl text-black"
          >
            Quản lý Người dùng
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/admin/users/create" as any)}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-[#136ADA] text-xs"
          >
            Thêm mới
          </Text>
        </TouchableOpacity>
      </View>

      {/* Synchronized Search Bar Section */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <View className="flex-1 bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm kiếm người dùng..."
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            value={tempSearch}
            onChangeText={setTempSearch}
            onSubmitEditing={applyFilters}
          />
        </View>
        <TouchableOpacity
          onPress={openFilter}
          className="bg-blue-50 w-11 h-11 rounded-2xl items-center justify-center border border-blue-100"
        >
          <Ionicons name="options-outline" size={22} color="#136ADA" />
        </TouchableOpacity>
      </View>

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
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Lọc người dùng</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Filter: Role Selection */}
            <View className="mb-12">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Quyền truy cập</Text>
              <View className="flex-row flex-wrap gap-3">
                {TABS.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setTempTab(tab)}
                    className={`px-5 py-3 rounded-2xl items-center ${tempTab === tab ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                  >
                    <Text
                      style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: tempTab === tab ? "#1D4ED8" : "#9CA3AF" }}
                    >
                      {TAB_LABELS[tab] || tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Modal Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-50 h-16 rounded-[24px] items-center justify-center"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-gray-400">Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-2 bg-[#136ADA] h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-white">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 100,
            gap: 12,
          }}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-white rounded-3xl p-5 border border-gray-100 flex-row items-center shadow-sm"
              onPress={() => router.push(`/admin/users/${item.userId}` as any)}
            >
              {/* Avatar section */}
              <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center border border-blue-100">
                <Text
                  style={{
                    fontFamily: "Poppins-Bold",
                    color: "#136ADA",
                    fontSize: 20,
                  }}
                >
                  {item.fullName.charAt(0)}
                </Text>
              </View>

              <View className="flex-1 ml-4">
                <View className="flex-row items-center gap-2 mb-0.5">
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-black text-base"
                  >
                    {item.fullName}
                  </Text>
                  {item.lockoutEnd && (
                    <Ionicons name="lock-closed" size={12} color="#EF4444" />
                  )}
                </View>
                <Text
                  style={{ fontFamily: "Poppins-Regular" }}
                  className="text-gray-400 text-[10px] mb-2"
                >
                  @{item.userName}
                </Text>
                <View className="flex-row">
                  <RoleBadge role={item.role ?? "User"} />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="people-outline" size={64} color="#E5E7EB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center"
              >
                Không tìm thấy người dùng.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
