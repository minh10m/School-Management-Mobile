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
  const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (activeTab === "users" && allUsers.length === 0) {
      fetchAllUsers();
    }
  }, [activeTab]);

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await userService.getUsers({
        FullName: debouncedSearch,
        PageSize: 50,
      });
      setAllUsers(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await conversationService.getMyConversations({
        pageSize: 50,
        displayName: debouncedSearch,
      });
      setConversations(res.items);

      if (debouncedSearch.length > 1 && activeTab === "chats") {
        const userRes = await userService.getUsers({
          FullName: debouncedSearch,
          PageSize: 10,
        });
        
        const existingUserIds = new Set(fbConversations.flatMap((c) => c.members));
        const filteredUsers = userRes.items.filter((u) => !existingUserIds.has(u.userId));
        setUsers(filteredUsers);
      } else {
        setUsers([]);
      }
      
      if (activeTab === "users") {
        fetchAllUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fbConversations, debouncedSearch, activeTab]);

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
      <View className="bg-white border-b border-gray-50 pt-2">
        <View className="flex-row items-center justify-between px-6 py-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-gray-900">
            Trò chuyện
          </Text>
          <TouchableOpacity 
            onPress={() => router.push(`/${rolePrefix}/chat/new-group` as any)}
            className="bg-indigo-600 px-3 py-1.5 rounded-xl shadow-sm shadow-indigo-200"
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={16} color="white" />
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold", fontFamily: "Poppins-Bold", marginLeft: 2 }}>Nhóm</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row px-6 mb-2">
          <TouchableOpacity 
            onPress={() => setActiveTab("chats")}
            className={`mr-6 py-2 border-b-2 ${activeTab === "chats" ? "border-indigo-600" : "border-transparent"}`}
          >
            <Text style={{ fontFamily: activeTab === "chats" ? "Poppins-Bold" : "Poppins-Medium" }} className={`text-sm ${activeTab === "chats" ? "text-indigo-600" : "text-gray-400"}`}>
              Tin nhắn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("users")}
            className={`py-2 border-b-2 ${activeTab === "users" ? "border-indigo-600" : "border-transparent"}`}
          >
            <Text style={{ fontFamily: activeTab === "users" ? "Poppins-Bold" : "Poppins-Medium" }} className={`text-sm ${activeTab === "users" ? "text-indigo-600" : "text-gray-400"}`}>
              Người dùng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-3">
        <View className="flex-row items-center bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder={activeTab === "chats" ? "Tìm kiếm cuộc trò chuyện..." : "Tìm kiếm người dùng..."}
            className="flex-1 ml-2 text-sm text-gray-800"
            style={{ fontFamily: "Poppins-Regular" }}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {(loading || loadingUsers) && <ActivityIndicator size="small" color="#6366F1" />}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === "chats" ? (
          <View className="flex-1">
            {loading && conversations.length === 0 ? (
              <View className="flex-1 items-center justify-center p-10">
                <ActivityIndicator size="large" color="#6366F1" />
              </View>
            ) : (
              <>
                {/* Conversations Section */}
                {conversations.length > 0 && (
                  <View>
                    {debouncedSearch.length > 0 && (
                      <View className="px-6 py-2 bg-gray-50">
                        <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Kết quả trò chuyện
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
                        Người dùng mới
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

                {conversations.length === 0 && users.length === 0 && !loading && (
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
              </>
            )}
          </View>
        ) : (
          <View className="flex-1">
            {loadingUsers && allUsers.length === 0 ? (
              <View className="flex-1 items-center justify-center p-10">
                <ActivityIndicator size="large" color="#6366F1" />
              </View>
            ) : (
              <View>
                {allUsers.length > 0 ? (
                  allUsers.map((user) => (
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
                        <View className="flex-row items-center">
                          <View className="bg-indigo-50 px-2 py-0.5 rounded-md mr-2">
                            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-[10px] text-indigo-600">
                              {user.role}
                            </Text>
                          </View>
                          <Text style={{ fontFamily: "Poppins-Regular" }} className="text-[10px] text-gray-400">
                            {user.userName}
                          </Text>
                        </View>
                      </View>
                      <View className="bg-indigo-50 p-2 rounded-full">
                        <Ionicons name="paper-plane-outline" size={18} color="#6366F1" />
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="flex-1 items-center justify-center p-10 mt-10">
                    <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                    <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-900 text-lg mt-4">
                      Không tìm thấy người dùng nào
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
