import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { conversationService } from "../../services/conversation.service";
import { ConversationResponse } from "../../types/conversation";
import { useConversationsListener } from "../../hooks/useConversationsListener";
import { userService } from "../../services/user.service";
import { UserListItem } from "../../types/user";

interface ChatListScreenProps {
  rolePrefix: "admin" | "teacher" | "student";
}

export default function ChatListScreen({ rolePrefix }: ChatListScreenProps) {
  const router = useRouter();
  const { conversations: fbConversations } = useConversationsListener();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchConversations = async () => {
    try {
      const res = await conversationService.getMyConversations({
        pageSize: 50,
        displayName: debouncedSearch,
      });
      setConversations(res.items);

      if (debouncedSearch.length > 1) {
        const userRes = await userService.getUsers({
          FullName: debouncedSearch,
          PageSize: 10,
        });
        
        // Lấy tất cả user IDs đang trò chuyện hiện tại (loại bỏ trùng lặp)
        const existingUserIds = new Set(fbConversations.flatMap((c) => c.members));
        
        // Lọc ra những người dùng chưa có cuộc trò chuyện
        const filteredUsers = userRes.items.filter((u) => !existingUserIds.has(u.userId));
        
        setUsers(filteredUsers);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fbConversations, debouncedSearch]); // Re-fetch khi Firebase có dữ liệu mới hoặc tìm kiếm thay đổi

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-rose-500",
      "bg-blue-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-orange-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const renderItem = ({ item }: { item: ConversationResponse }) => {
    const isUnread = item.unReadCount > 0;
    const initial = item.displayName.charAt(0).toUpperCase();
    const avatarColor = getAvatarColor(item.displayName);

    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: `/${rolePrefix}/chat/${item.conversationId}` as any,
          params: { 
            name: item.displayName,
            isGroup: item.isGroup ? "true" : "false"
          }
        })}
        className={`flex-row items-center p-4 border-b border-gray-100 ${
          isUnread ? "bg-indigo-50/30" : "bg-white"
        }`}
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${avatarColor}`}
        >
          {item.isGroup ? (
            <Ionicons name="people" size={24} color="white" />
          ) : (
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-lg">
              {initial}
            </Text>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text
              style={{ fontFamily: isUnread ? "Poppins-Bold" : "Poppins-Medium" }}
              className={`text-sm ${isUnread ? "text-black" : "text-gray-800"}`}
              numberOfLines={1}
            >
              {item.displayName}
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Regular" }}
              className={`text-[10px] ${isUnread ? "text-indigo-600 font-bold" : "text-gray-400"}`}
            >
              {new Date(item.lastUpdatedAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text
              style={{ fontFamily: isUnread ? "Poppins-SemiBold" : "Poppins-Regular" }}
              className={`text-xs flex-1 mr-4 ${
                isUnread ? "text-indigo-600" : "text-gray-500"
              }`}
              numberOfLines={1}
            >
              {isUnread ? "Bạn có tin nhắn mới" : "Chạm để xem tin nhắn"}
            </Text>
            {isUnread && (
              <View className="bg-rose-500 w-5 h-5 rounded-full items-center justify-center shadow-sm shadow-rose-200">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-[10px]">
                  {item.unReadCount > 99 ? "99+" : item.unReadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleSelectUser = async (user: UserListItem) => {
    try {
      setLoading(true);
      const res = await conversationService.checkConversation(user.userId);
      if (res.data && res.data.conversationId) {
        router.push({
          pathname: `/${rolePrefix}/chat/${res.data.conversationId}` as any,
          params: { name: user.fullName, isGroup: "false" }
        });
      } else {
        router.push({
          pathname: `/${rolePrefix}/chat/${user.userId}` as any,
          params: { isNew: "true", name: user.fullName, isGroup: "false" }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSearch(""); // Clear search after selection
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-50">
        <View className="w-16 items-start">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-gray-900">
          Tin nhắn
        </Text>
        <View className="flex-row justify-end items-center">
          <TouchableOpacity 
            onPress={() => router.push(`/${rolePrefix}/chat/new-group` as any)}
            style={{ backgroundColor: "#136ADA", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold", fontFamily: "Poppins-Bold" }}>Tạo nhóm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 py-4 border-b border-gray-50">
        <View className="flex-row items-center bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="flex-1 ml-2 text-sm text-gray-800"
            style={{ fontFamily: "Poppins-Regular" }}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center p-10">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <View className="flex-1">
            {/* Conversations Section */}
            {conversations.length > 0 && (
              <View>
                {debouncedSearch.length > 0 && (
                  <View className="px-6 py-2 bg-gray-50">
                    <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Cuộc trò chuyện hiện tại
                    </Text>
                  </View>
                )}
                <FlatList
                  data={conversations}
                  keyExtractor={(item) => item.conversationId}
                  renderItem={renderItem}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* New Users Search Results */}
            {users.length > 0 && (
              <View>
                <View className="px-6 py-2 bg-gray-50">
                  <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Tìm kiếm người dùng mới
                  </Text>
                </View>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.userId}
                    onPress={() => handleSelectUser(user)}
                    className="flex-row items-center p-4 border-b border-gray-100 bg-white"
                  >
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${getAvatarColor(user.fullName)}`}>
                      <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-lg">
                        {user.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontFamily: "Poppins-Medium" }} className="text-sm text-gray-800">
                        {user.fullName}
                      </Text>
                      <Text style={{ fontFamily: "Poppins-Regular" }} className="text-xs text-gray-500">
                        {user.role}
                      </Text>
                    </View>
                    <Ionicons name="chatbubble-outline" size={20} color="#6366F1" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {conversations.length === 0 && users.length === 0 && (
              <View className="flex-1 items-center justify-center p-10 mt-10">
                <View className="bg-gray-50 p-6 rounded-full mb-4">
                  <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
                </View>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-900 text-lg mb-1">
                  Chưa có cuộc trò chuyện nào
                </Text>
                <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-500 text-center text-sm">
                  {debouncedSearch ? "Không tìm thấy kết quả phù hợp" : "Hãy bắt đầu cuộc trò chuyện với bạn bè hoặc giáo viên của bạn"}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
