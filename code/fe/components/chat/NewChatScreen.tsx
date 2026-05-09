import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { userService } from "../../services/user.service";
import { conversationService } from "../../services/conversation.service";
import { UserListItem } from "../../types/user";

interface NewChatScreenProps {
  rolePrefix: "admin" | "teacher" | "student";
}

export default function NewChatScreen({ rolePrefix }: NewChatScreenProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.length > 1) {
      searchUsers();
    } else if (debouncedSearch.length === 0) {
      // Load initial users when search is empty
      searchUsers();
    }
  }, [debouncedSearch]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({
        FullName: debouncedSearch,
        PageSize: 20,
      });
      setUsers(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: UserListItem) => {
    try {
      setLoading(true);
      const res = await conversationService.checkConversation(user.userId);
      if (res.data && res.data.conversationId) {
        // Đã có cuộc trò chuyện
        router.push({
          pathname: `/${rolePrefix}/chat/${res.data.conversationId}` as any,
          params: { name: user.fullName, isGroup: "false" }
        });
      } else {
        // Chưa có, chuyển qua màn hình chat với receiverId
        // Màn hình ChatRoomScreen sẽ tự xử lý nếu không có conversationId
        router.push({
          pathname: `/${rolePrefix}/chat/${user.userId}` as any,
          params: { isNew: "true", name: user.fullName, isGroup: "false" }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-rose-500", "bg-blue-500", "bg-teal-500", "bg-indigo-500"];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black">
          Tin nhắn mới
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4">
        <View className="flex-row items-center bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm theo tên hoặc email..."
            className="flex-1 ml-2 text-sm text-gray-800"
            style={{ fontFamily: "Poppins-Regular" }}
            value={search}
            onChangeText={setSearch}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {loading && <ActivityIndicator size="small" color="#6366F1" />}
        </View>
      </View>

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectUser(item)}
            className="flex-row items-center px-6 py-4 border-b border-gray-50"
          >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${getAvatarColor(item.fullName)}`}>
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white">
                {item.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-sm text-black">
                {item.fullName}
              </Text>
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-xs text-gray-400">
                {item.role}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center p-10">
            <Ionicons name="people-outline" size={64} color="#E5E7EB" />
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-center mt-4">
              {search.length > 1 ? "Không tìm thấy người dùng nào" : "Đang tải danh sách người dùng..."}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
