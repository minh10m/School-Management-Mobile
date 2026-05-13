import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { userService } from "../../services/user.service";
import { conversationService } from "../../services/conversation.service";
import { UserListItem } from "../../types/user";

interface AddMembersScreenProps {
  rolePrefix?: "admin" | "teacher" | "student";
}

const PRIMARY_COLOR = "#136ADA";
const PRIMARY_LIGHT = "#E7F0FB";

export default function AddMembersScreen({ rolePrefix: rolePrefixProp }: AddMembersScreenProps) {
  const router = useRouter();
  const { conversationId, rolePrefix: paramRolePrefix } = useLocalSearchParams<{ 
    conversationId: string;
    rolePrefix?: string;
  }>();
  const rolePrefix = rolePrefixProp || paramRolePrefix || "student";

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await userService.getUsers({
          FullName: debouncedSearch,
          PageSize: 20,
        });
        setUsers(res.items || []);
      } catch (err) {
        console.log("Fetch users error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedSearch.length > 1 || debouncedSearch.length === 0) {
      fetchUsers();
    }
  }, [debouncedSearch]);

  const toggleUserSelection = (user: UserListItem) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.userId === user.userId);
      if (isSelected) {
        return prev.filter(u => u.userId !== user.userId);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddMembers = async () => {
    if (!conversationId) return;
    if (selectedUsers.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất 1 thành viên để thêm");
      return;
    }

    try {
      setAdding(true);
      await conversationService.addMembersToGroup({
        conversationId,
        memberIds: selectedUsers.map(u => u.userId),
      });

      Alert.alert("Thành công", "Đã thêm thành viên vào nhóm", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.log("Add members error:", err);
      const errorMsg = err.response?.data?.message || "Không thể thêm thành viên lúc này.";
      Alert.alert("Lỗi", errorMsg);
    } finally {
      setAdding(false);
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ["#F43F5E", "#3B82F6", "#14B8A6", PRIMARY_COLOR, "#F59E0B"];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header Section */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000000" }}>Thêm thành viên</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleAddMembers}
            disabled={adding || selectedUsers.length === 0}
            style={{ 
              backgroundColor: (adding || selectedUsers.length === 0) ? "#F3F4F6" : PRIMARY_COLOR,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12
            }}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ 
                color: (adding || selectedUsers.length === 0) ? "#9CA3AF" : "#FFFFFF", 
                fontWeight: "bold",
                fontSize: 14
              }}>Thêm</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Selected Users Chips */}
          {selectedUsers.length > 0 && (
            <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: PRIMARY_COLOR, textTransform: "uppercase", marginBottom: 12, letterSpacing: 1 }}>Đã chọn ({selectedUsers.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                {selectedUsers.map(u => (
                  <TouchableOpacity 
                    key={u.userId}
                    onPress={() => toggleUserSelection(u)}
                    style={{ flexDirection: "row", alignItems: "center", backgroundColor: PRIMARY_LIGHT, paddingLeft: 6, paddingRight: 10, paddingVertical: 6, borderRadius: 100, marginRight: 8, borderWidth: 1, borderColor: "#DBE9FE" }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: getAvatarColor(u.fullName), alignItems: "center", justifyContent: "center", marginRight: 8 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>{u.fullName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={{ color: PRIMARY_COLOR, fontSize: 13, fontWeight: "500", marginRight: 4 }}>{u.fullName.split(" ").pop()}</Text>
                    <Ionicons name="close-circle" size={16} color={PRIMARY_COLOR} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Search Bar */}
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: PRIMARY_COLOR, textTransform: "uppercase", marginBottom: 12, letterSpacing: 1 }}>Tìm kiếm</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: "#F3F4F6" }}>
              <View style={{ marginRight: 12 }}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
              </View>
              <TextInput
                placeholder="Tìm kiếm theo tên..."
                style={{ flex: 1, fontSize: 15, color: "#1F2937" }}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
              {loading && <ActivityIndicator size="small" color={PRIMARY_COLOR} />}
            </View>
          </View>

          {/* User Results List */}
          <View style={{ marginTop: 16 }}>
            {users.length > 0 ? (
              users.map(item => {
                const isSelected = selectedUsers.some(u => u.userId === item.userId);
                return (
                  <TouchableOpacity
                    key={item.userId}
                    onPress={() => toggleUserSelection(item)}
                    style={{ 
                      flexDirection: "row", 
                      alignItems: "center", 
                      paddingHorizontal: 24, 
                      paddingVertical: 12, 
                      backgroundColor: isSelected ? PRIMARY_LIGHT : "#FFFFFF",
                      borderBottomWidth: 1,
                      borderBottomColor: "#F9FAFB"
                    }}
                  >
                    <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: isSelected ? PRIMARY_COLOR : "#D1D5DB", backgroundColor: isSelected ? PRIMARY_COLOR : "transparent", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: getAvatarColor(item.fullName), alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>{item.fullName.charAt(0).toUpperCase()}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#1F2937" }}>{item.fullName}</Text>
                      <Text style={{ fontSize: 12, color: "#9CA3AF" }}>{item.role}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              search.length > 1 && !loading && (
                <View style={{ alignItems: "center", marginTop: 40 }}>
                  <Text style={{ color: "#9CA3AF" }}>Không tìm thấy người dùng "{search}"</Text>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
