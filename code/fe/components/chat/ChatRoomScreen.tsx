import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { conversationService } from "../../services/conversation.service";
import { MessageResponse, MemberInfo } from "../../types/conversation";
import { useAuthStore } from "../../store/authStore";
import { useConversationsListener } from "../../hooks/useConversationsListener";
import { userService } from "../../services/user.service";
import { UserResponse } from "../../types/user";

export default function ChatRoomScreen() {
  const { id, isNew, name, isGroup: isGroupParam } = useLocalSearchParams<{ 
    id: string; 
    isNew?: string; 
    name?: string;
    isGroup?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userInfo } = useAuthStore();
  const { conversations: fbConversations } = useConversationsListener();
  const [realConversationId, setRealConversationId] = useState<string | null>(isNew === "true" ? null : id);

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [membersInfo, setMembersInfo] = useState<MemberInfo[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<UserResponse | null>(null);
  const [viewingMember, setViewingMember] = useState<MemberInfo | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Tìm thông tin cuộc trò chuyện hiện tại từ Firebase
  const currentConversation = fbConversations.find((c) => c.id === (realConversationId || id));

  const fetchMessages = async () => {
    if (!realConversationId) {
      setLoading(false);
      return;
    }
    try {
      // Call API to get latest messages
      const res = await conversationService.getMessages(realConversationId, {
        pageSize: 100, // Load 100 latest messages
        pageNumber: 1,
      });
      // API typically returns newest first, so we use inverted=true in FlatList
      setMessages(res.data.messageResponse.items);
      setMembersInfo(res.data.memberInfos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [realConversationId, currentConversation?.lastMessageAt]); // Refetch when lastMessageAt changes in Firebase

  const handleSend = async () => {
    if (!inputText.trim() || sending || !id) return;
    const textToSend = inputText.trim();
    setInputText(""); // Clear immediately for better UX
    setSending(true);

    try {
      const payload: any = { content: textToSend };
      if (realConversationId) {
        payload.conversationId = realConversationId;
      } else {
        payload.receiverId = id; // id is receiverId if isNew is true
      }

      const res = await conversationService.sendMessage(payload);
      const returnedConversationId = res.data; // this is the string Guid
      
      // Update local state immediately so user sees their message
      const newMessage: MessageResponse = {
        id: Math.random().toString(), // temporary ID
        senderId: userInfo?.id || "",
        senderName: userInfo?.fullName || "Bạn",
        conversationId: returnedConversationId || realConversationId || "",
        content: textToSend,
        status: "Đã gửi",
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [newMessage, ...prev]);

      if (returnedConversationId && !realConversationId) {
        setRealConversationId(returnedConversationId);
      }
    } catch (err) {
      console.error(err);
      // Revert if error
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: MessageResponse; index: number }) => {
    const isMe = item.senderId === userInfo?.id;
    const prevItem = messages[index + 1]; // Because inverted, the previous message is index + 1
    const isSameSenderAsPrev = prevItem && prevItem.senderId === item.senderId;

    return (
      <View
        className={`flex-row mb-1 px-4 ${isMe ? "justify-end" : "justify-start"} ${
          !isSameSenderAsPrev ? "mt-3" : ""
        }`}
      >
        {!isMe && !isSameSenderAsPrev && (
          <View className="w-8 h-8 rounded-full bg-rose-500 items-center justify-center mr-2">
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-xs">
              {item.senderName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {!isMe && isSameSenderAsPrev && <View className="w-8 mr-2" />}

        <View
          className={`max-w-[75%] px-4 py-2.5 ${
            isMe
              ? "bg-indigo-500 rounded-2xl rounded-tr-sm"
              : "bg-gray-100 rounded-2xl rounded-tl-sm border border-gray-200/50"
          }`}
          style={
            isMe
              ? { shadowColor: "#6366F1", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 }
              : {}
          }
        >
          {!isMe && !isSameSenderAsPrev && (
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-[10px] text-gray-500 mb-0.5">
              {item.senderName}
            </Text>
          )}
          <Text
            style={{ fontFamily: "Poppins-Regular" }}
            className={`text-sm ${isMe ? "text-white" : "text-gray-800"}`}
          >
            {item.content}
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className={`text-[9px] mt-1 text-right ${isMe ? "text-indigo-200" : "text-gray-400"}`}
          >
            {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  const isGroup = isGroupParam === "true" || (currentConversation ? currentConversation.members.length > 2 : false) || (membersInfo.length > 2);
  const otherMember = membersInfo.find((m) => m.userId !== userInfo?.id);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoadingProfile(true);
      setOtherUserProfile(null);
      const data = await userService.getUserById(userId);
      setOtherUserProfile(data);
    } catch (err: any) {
      try {
        const res = await userService.getUsers({ FullName: "" }); // Search by ID isn't directly in getUsers usually, but let's see
        // For now fallback to what we have in membersInfo if 403
      } catch (fallbackErr) {}
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleShowInfo = async (member?: MemberInfo) => {
    setShowInfoModal(true);
    if (member) {
      setViewingMember(member);
      fetchUserProfile(member.userId);
    } else if (!isGroup && otherMember) {
      setViewingMember(otherMember);
      fetchUserProfile(otherMember.userId);
    } else {
      setViewingMember(null);
    }
  };

  const handleCloseModal = () => {
    if (isGroup && viewingMember) {
      setViewingMember(null);
      setOtherUserProfile(null);
    } else {
      setShowInfoModal(false);
      setViewingMember(null);
      setOtherUserProfile(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-4 bg-white border-b border-gray-100 shadow-sm z-10"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
            <Ionicons name={isGroup ? "people" : "person"} size={20} color="#6366F1" />
          </View>
          <TouchableOpacity onPress={() => handleShowInfo()}>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-base text-gray-900">
              {name || "Chi tiết trò chuyện"}
            </Text>

            {!currentConversation && isNew === "true" && (
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-[10px] text-gray-400">
                Bắt đầu cuộc trò chuyện mới
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleShowInfo()} className="p-2">
          <Ionicons name="information-circle-outline" size={26} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View className="flex-1 items-center justify-center bg-gray-50/30">
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={{ paddingVertical: 20 }}
          className="flex-1 bg-gray-50/30"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input */}
      <View
        className="flex-row items-center px-4 py-3 bg-white border-t border-gray-100"
        style={{ paddingBottom: insets.bottom || 12 }}
      >
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-1 min-h-[44px]">
          <TextInput
            className="flex-1 text-sm text-gray-800 py-2"
            style={{ fontFamily: "Poppins-Regular" }}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          {inputText.trim().length > 0 && (
            <TouchableOpacity onPress={handleSend} disabled={sending} className="ml-2 p-1">
              {sending ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <Ionicons name="send" size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info Modal */}
      <Modal visible={showInfoModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black">
                {viewingMember 
                  ? "Trang cá nhân" 
                  : (isGroup ? `Danh sách thành viên (${membersInfo.length})` : "Trang cá nhân")}
              </Text>
              <TouchableOpacity onPress={handleCloseModal} className="p-2 bg-gray-100 rounded-full">
                <Ionicons name={isGroup && viewingMember ? "arrow-back" : "close"} size={20} color="black" />
              </TouchableOpacity>
            </View>

            {viewingMember ? (
              <View className="items-center py-6">
                <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4">
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-4xl text-indigo-600">
                    {viewingMember.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {loadingProfile ? (
                  <ActivityIndicator size="small" color="#6366F1" className="mb-6" />
                ) : (
                  <>
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-black mb-1 text-center">
                      {otherUserProfile ? otherUserProfile.fullName : viewingMember.fullName}
                    </Text>
                    <Text style={{ fontFamily: "Poppins-Regular" }} className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
                      {otherUserProfile ? otherUserProfile.role : "Thành viên"}
                    </Text>
                    {otherUserProfile && (
                      <View className="mb-6 items-center w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <View className="flex-row items-center mb-3">
                          <Ionicons name="mail-outline" size={18} color="#6B7280" className="mr-2" />
                          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 ml-2">{otherUserProfile.email}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="call-outline" size={18} color="#6B7280" className="mr-2" />
                          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 ml-2">{otherUserProfile.phoneNumber}</Text>
                        </View>
                      </View>
                    )}
                  </>
                )}

                <View className="flex-row gap-4">
                  <TouchableOpacity 
                    className="bg-indigo-50 px-8 py-3 rounded-full flex-row items-center"
                    onPress={handleCloseModal}
                  >
                    <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-indigo-600">
                      {isGroup ? "Quay lại" : "Đóng"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={membersInfo}
                keyExtractor={(item) => item.userId}
                className="max-h-96"
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    className="flex-row items-center py-3 border-b border-gray-50"
                    onPress={() => handleShowInfo(item)}
                    disabled={item.userId === userInfo?.id}
                  >
                    <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-4">
                      <Text style={{ fontFamily: "Poppins-Bold" }} className="text-indigo-600 text-lg">
                        {item.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontFamily: "Poppins-Medium" }} className="text-base text-black">
                        {item.fullName} {item.userId === userInfo?.id ? "(Bạn)" : ""}
                      </Text>
                    </View>
                    {item.userId !== userInfo?.id && (
                      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <Text style={{ fontFamily: "Poppins-Regular" }} className="text-center text-gray-400 py-4">
                    Chưa có dữ liệu thành viên
                  </Text>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
