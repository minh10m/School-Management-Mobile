import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConversationsListener } from "../../hooks/useConversationsListener";
import { conversationService } from "../../services/conversation.service";
import { userService } from "../../services/user.service";
import { useAuthStore } from "../../store/authStore";
import { MemberInfo, MessageResponse } from "../../types/conversation";
import { UserResponse } from "../../types/user";

export default function ChatRoomScreen() {
  const {
    id,
    isNew,
    name,
    isGroup: isGroupParam,
    avatarUrl: avatarUrlParam,
  } = useLocalSearchParams<{
    id: string;
    isNew?: string;
    name?: string;
    isGroup?: string;
    avatarUrl?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userInfo } = useAuthStore();
  const { conversations: fbConversations } = useConversationsListener();
  const segments = useSegments();
  const rolePrefix = segments[0]; // e.g., 'teacher', 'student'
  const [realConversationId, setRealConversationId] = useState<string | null>(
    isNew === "true" ? null : id,
  );

  useEffect(() => {
    if (isNew !== "true") {
      setRealConversationId(id);
    }
  }, [id, isNew]);

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [membersInfo, setMembersInfo] = useState<MemberInfo[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<UserResponse | null>(
    null,
  );
  const [viewingMember, setViewingMember] = useState<MemberInfo | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Group editing state
  const [editingGroup, setEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupAvatar, setEditGroupAvatar] = useState<{
    uri: string;
    file: any;
  } | null>(null);
  const [updatingGroup, setUpdatingGroup] = useState(false);

  useEffect(() => {
    if (showInfoModal && isGroup && !viewingMember) {
      setEditGroupName(name || "");
      setEditGroupAvatar(null);
      setEditingGroup(false);
    }
  }, [showInfoModal, viewingMember]);

  const handlePickGroupAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setEditGroupAvatar({
        uri: asset.uri,
        file: {
          uri: asset.uri,
          type: asset.mimeType || "image/jpeg",
          name: asset.fileName || "group_avatar.jpg",
        },
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!editGroupName.trim() || !realConversationId) return;
    try {
      setUpdatingGroup(true);
      const formData = new FormData();
      formData.append("ConversationName", editGroupName.trim());
      if (editGroupAvatar?.file) {
        formData.append("Avatar", editGroupAvatar.file as any);
      }

      await conversationService.updateGroup(realConversationId, formData);
      setEditingGroup(false);
      router.back();
      // Hiện thông báo sau khi đã quay lại list chat
      setTimeout(() => {
        Alert.alert("Thành công", "Cập nhật thông tin nhóm thành công");
      }, 300);
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin nhóm");
    } finally {
      setUpdatingGroup(false);
    }
  };

  // Tìm thông tin cuộc trò chuyện hiện tại từ Firebase
  const currentConversation = fbConversations.find(
    (c) => c.id === (realConversationId || id),
  );

  const fetchMessages = async () => {
    if (!realConversationId || realConversationId === "add-members" || realConversationId === "new-group") {
      setLoading(false);
      return;
    }
    
    // Quick check for GUID format (basic check)
    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(realConversationId);
    if (!isGuid && isNew !== "true") {
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
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [realConversationId]); // Only fetch on initial load or ID change

  // Listen to realtime new messages
  useEffect(() => {
    if (currentConversation?.lastMessageObj) {
      const newMsg = currentConversation.lastMessageObj as MessageResponse;
      setMessages((prev) => {
        // Prevent duplicate appending by real ID, but update if changed (like status)
        const existingIndex = prev.findIndex((msg) => msg.id === newMsg.id);
        if (existingIndex !== -1) {
          // Update the message if there's any change
          if (prev[existingIndex].status !== newMsg.status || prev[existingIndex].content !== newMsg.content) {
            const newArray = [...prev];
            newArray[existingIndex] = newMsg;
            return newArray;
          }
          return prev;
        }

        // If it's a message from us, try to find the optimistic 'temp' message
        // and replace it with the real one to avoid duplicates.
        if (newMsg.senderId === userInfo?.id) {
          const tempMsgIndex = prev.findIndex(
            (msg) =>
              msg.id.startsWith("temp-") &&
              msg.content === newMsg.content
          );

          if (tempMsgIndex !== -1) {
            const newArray = [...prev];
            newArray[tempMsgIndex] = newMsg;
            return newArray;
          }
        }

        // Otherwise just append to the top (which is index 0 since list is inverted)
        return [newMsg, ...prev];
      });
    }
  }, [currentConversation?.lastMessageObj]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !id) return;
    const textToSend = inputText.trim();
    setInputText(""); // Clear immediately for better UX

    // Create temporary message for optimistic update
    const tempId = `temp-${Date.now()}`;
    const newMessage: MessageResponse = {
      id: tempId,
      senderId: userInfo?.id || "",
      senderName: userInfo?.fullName || "Bạn",
      conversationId: realConversationId || "",
      type: "Text",
      content: textToSend,
      status: "Đang gửi", // Sending...
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [newMessage, ...prev]);

    // Scroll to bottom (which is index 0 in inverted list)
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);

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

      // Update the temporary message with real data if needed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                status: "Đã gửi",
                conversationId: returnedConversationId || msg.conversationId,
              }
            : msg,
        ),
      );

      if (returnedConversationId && !realConversationId) {
        setRealConversationId(returnedConversationId);
      }
    } catch (err) {
      console.log(err);
      // Remove the optimistic message on error and restore input
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const isGroup =
    isGroupParam === "true" ||
    (currentConversation ? currentConversation.members.length > 2 : false) ||
    membersInfo.length > 2;

  const getDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: MessageResponse;
    index: number;
  }) => {
    const isMe = item.senderId === userInfo?.id;
    
    // Tìm tin nhắn gần nhất phía trên (cũ hơn) mà không phải System để gộp nhóm avatar
    const prevRealItem = messages.slice(index + 1).find(m => m.type?.toLowerCase() !== "system");
    // Tìm tin nhắn gần nhất phía dưới (mới hơn) mà không phải System để gộp nhóm avatar
    const nextRealItem = messages.slice(0, index).reverse().find(m => m.type?.toLowerCase() !== "system");
    
    const isSameSenderAsPrev = prevRealItem && prevRealItem.senderId === item.senderId;
    
    // Date separator logic - Dùng tin nhắn ngay sát phía trên (bất kể loại nào)
    const absolutePrevItem = messages[index + 1];
    const itemDate = new Date(item.createdAt);
    const prevItemDate = absolutePrevItem ? new Date(absolutePrevItem.createdAt) : null;
    const showDateSeparator = !prevItemDate || itemDate.toDateString() !== prevItemDate.toDateString();

    // Kiểm tra xem tin nhắn tiếp theo có khác ngày không (dùng nextRealItem để gộp avatar)
    const isNextDay = nextRealItem && new Date(nextRealItem.createdAt).toDateString() !== itemDate.toDateString();
    const isSameSenderAsNext = nextRealItem && nextRealItem.senderId === item.senderId && !isNextDay;

    // Determine seen status for 1-on-1 chats
    let displayStatus = item.status;
    if (isMe && index === 0 && !isGroup) {
      if (item.status === "Đã xem") {
        displayStatus = "Đã xem";
      } else if (currentConversation) {
        const otherMemberId = currentConversation.members.find(
          (m) => m !== userInfo?.id,
        );
        const messageAge = Date.now() - new Date(item.createdAt).getTime();
        const isStale = messageAge > 3000;

        if (
          otherMemberId &&
          currentConversation.unreadCounts &&
          currentConversation.unreadCounts[otherMemberId] === 0 &&
          isStale
        ) {
          displayStatus = "Đã xem";
        }
      }
    }

    // Detect if content is only emojis
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]+$/u;
    const isEmojiOnly = emojiRegex.test(item.content.replace(/\s/g, ""));
    
    const sender = membersInfo.find(m => m.userId === item.senderId);
    const avatarUrl = sender?.avatarUrl;

    return (
      <View>
        {showDateSeparator && (
          <View className="items-center my-6">
            <View className="bg-gray-100 px-4 py-1.5 rounded-full">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-[11px] text-gray-500 uppercase tracking-wider"
              >
                {getDateLabel(itemDate)}
              </Text>
            </View>
          </View>
        )}
        
        {item.type?.toLowerCase() === "system" ? (
          <View className="items-center my-4 px-10">
            <View className="bg-gray-100/80 px-4 py-1.5 rounded-full">
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-[11px] text-gray-500 text-center leading-4"
              >
                {item.content}
              </Text>
            </View>
          </View>
        ) : (
        <View
          className={`flex-row px-4 ${isMe ? "justify-end" : "justify-start"} ${
            !isSameSenderAsPrev || showDateSeparator ? "mt-4" : "mt-1"
          }`}
        >
        {!isMe && (
          <View className="w-9 mr-1 items-center justify-end pb-1">
            {!isSameSenderAsNext && (
              avatarUrl ? (
                <Image 
                  source={{ uri: avatarUrl }} 
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
              <View className="w-8 h-8 rounded-full bg-rose-500 items-center justify-center shadow-sm">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-[10px]">
                  {item.senderName.charAt(0).toUpperCase()}
                </Text>
              </View>
              )
            )}
          </View>
        )}

        <View style={{ maxWidth: "80%", alignItems: isMe ? "flex-end" : "flex-start" }}>
          {!isMe && !isSameSenderAsPrev && isGroup && (
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-[11px] text-gray-500 ml-3 mb-1"
            >
              {item.senderName}
            </Text>
          )}
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedMessageId(selectedMessageId === item.id ? null : item.id)}
            className={`px-3.5 py-2 ${
              isMe
                ? "bg-indigo-600"
                : isEmojiOnly ? "bg-transparent" : "bg-gray-100 border border-gray-200/50"
            }`}
            style={{
              borderRadius: 20,
              shadowColor: isMe ? "#4F46E5" : "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isMe ? 0.2 : 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text
              style={{ 
                fontFamily: "Poppins-Regular",
                fontSize: isEmojiOnly ? 32 : 15,
                lineHeight: isEmojiOnly ? 40 : 22
              }}
              className={`${isMe ? "text-white" : "text-gray-800"}`}
            >
              {item.content}
            </Text>
          </TouchableOpacity>

          {(selectedMessageId === item.id || (!isSameSenderAsNext && index === 0)) && (
            <View className={`flex-row items-center mt-1 ${isMe ? "justify-end" : "justify-start"} px-1`}>
              <Text
                style={{ fontFamily: "Poppins-Regular" }}
                className="text-[10px] text-gray-400"
              >
                {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {isMe && index === 0 && (
                <Text style={{ fontFamily: "Poppins-Regular" }} className="text-[10px] text-gray-400 ml-1">
                  • {displayStatus}
                </Text>
              )}
            </View>
          )}
        </View>
        </View>
        )}
      </View>
    );
  };

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

  const handleLeaveGroup = async () => {
    if (!realConversationId) return;
    try {
      setLoading(true);
      await conversationService.leaveGroup(realConversationId);
      setShowInfoModal(false);
      router.back();
      Alert.alert("Thành công", "Rời nhóm thành công");
    } catch (err) {
      console.log(err);
      Alert.alert("Thông báo", "Không thể rời nhóm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
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
        className="flex-row items-center justify-between px-4 pb-4 bg-white border-b border-gray-100 z-10"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3 overflow-hidden">
            {isGroup ? (
              (currentConversation?.avatarUrl || avatarUrlParam) ? (
                <Image 
                  source={{ uri: currentConversation?.avatarUrl || avatarUrlParam || "" }} 
                  style={{ width: 40, height: 40 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Ionicons name="people" size={20} color="#6366F1" />
              )
            ) : (otherMember?.avatarUrl || avatarUrlParam) ? (
              <Image 
                source={{ uri: otherMember?.avatarUrl || avatarUrlParam }} 
                style={{ width: 40, height: 40 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Ionicons name="person" size={20} color="#6366F1" />
            )}
          </View>
          <TouchableOpacity onPress={() => handleShowInfo()}>
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-base text-gray-900"
            >
              {isGroup ? (currentConversation?.displayName || name) : (name || "Chi tiết trò chuyện")}
            </Text>

            {!currentConversation && isNew === "true" && (
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-[10px] text-gray-400"
              >
                Bắt đầu cuộc trò chuyện mới
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleShowInfo()} className="p-2">
          <Ionicons
            name="information-circle-outline"
            size={26}
            color="#4B5563"
          />
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
          ListFooterComponent={() => (
            <View className="items-center py-10 px-6">
              <View className="w-16 h-16 bg-indigo-50 rounded-full items-center justify-center mb-4 overflow-hidden">
                {isGroup ? (
                  <Ionicons name="people" size={32} color="#6366F1" />
                ) : (otherMember?.avatarUrl || avatarUrlParam) ? (
                  <Image 
                    source={{ uri: otherMember?.avatarUrl || avatarUrlParam }} 
                    style={{ width: 64, height: 64 }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <Ionicons name="person" size={32} color="#6366F1" />
                )}
              </View>
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-lg text-gray-900 text-center"
              >
                {isGroup
                  ? "Chào mừng bạn đến với nhóm"
                  : "Bắt đầu cuộc trò chuyện với"}
              </Text>
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-indigo-600 text-center mb-2"
              >
                {isGroup ? (currentConversation?.displayName || name) : name}
              </Text>
              <View className="bg-gray-100 px-4 py-2 rounded-xl">
                <Text
                  style={{ fontFamily: "Poppins-Regular" }}
                  className="text-[11px] text-gray-500 text-center"
                >
                  {isGroup
                    ? "Đây là sự khởi đầu của nhóm này. Hãy gửi tin nhắn để mọi người cùng thấy!"
                    : "Mọi tin nhắn đều được bảo mật. Chúc bạn có một cuộc trò chuyện vui vẻ."}
                </Text>
              </View>
            </View>
          )}
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
            <TouchableOpacity
              onPress={handleSend}
              disabled={sending}
              className="ml-2 p-1"
            >
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
          <View
            className="bg-white rounded-t-3xl p-6"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-xl text-black"
              >
                {viewingMember
                  ? "Trang cá nhân"
                  : editingGroup
                    ? "Chỉnh sửa nhóm"
                    : isGroup
                      ? `Thông tin nhóm`
                      : "Trang cá nhân"}
              </Text>
              <View className="flex-row items-center gap-2">
                {isGroup && !viewingMember && !editingGroup && (
                  <TouchableOpacity
                    onPress={() => setEditingGroup(true)}
                    className="p-2 bg-indigo-50 rounded-full"
                  >
                    <Ionicons name="create-outline" size={20} color="#6366F1" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleCloseModal}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Ionicons
                    name={isGroup && viewingMember ? "arrow-back" : "close"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {viewingMember ? (
              <View className="items-center py-6">
                <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4 overflow-hidden">
                  {(otherUserProfile?.avatarUrl || viewingMember.avatarUrl) ? (
                    <Image 
                      source={{ uri: otherUserProfile?.avatarUrl || viewingMember.avatarUrl || '' }} 
                      style={{ width: 96, height: 96 }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-4xl text-indigo-600"
                  >
                    {viewingMember.fullName.charAt(0).toUpperCase()}
                  </Text>
                  )}
                </View>

                {loadingProfile ? (
                  <ActivityIndicator
                    size="small"
                    color="#6366F1"
                    className="mb-6"
                  />
                ) : (
                  <>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-2xl text-black mb-1 text-center"
                    >
                      {otherUserProfile
                        ? otherUserProfile.fullName
                        : viewingMember.fullName}
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Regular" }}
                      className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3"
                    >
                      {otherUserProfile ? otherUserProfile.role : "Thành viên"}
                    </Text>
                    {otherUserProfile && (
                      <View className="mb-6 items-center w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <View className="flex-row items-center mb-3">
                          <Ionicons
                            name="mail-outline"
                            size={18}
                            color="#6B7280"
                            className="mr-2"
                          />
                          <Text
                            style={{ fontFamily: "Poppins-Medium" }}
                            className="text-gray-700 ml-2"
                          >
                            {otherUserProfile.email}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons
                            name="call-outline"
                            size={18}
                            color="#6B7280"
                            className="mr-2"
                          />
                          <Text
                            style={{ fontFamily: "Poppins-Medium" }}
                            className="text-gray-700 ml-2"
                          >
                            {otherUserProfile.phoneNumber}
                          </Text>
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
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className="text-indigo-600"
                    >
                      {isGroup ? "Quay lại" : "Đóng"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : editingGroup ? (
              <View className="py-4">
                <View className="items-center mb-6">
                  <TouchableOpacity
                    onPress={handlePickGroupAvatar}
                    className="w-24 h-24 rounded-full bg-indigo-50 items-center justify-center border-4 border-white shadow-sm overflow-hidden"
                  >
                    {editGroupAvatar?.uri ? (
                      <Image
                        source={{ uri: editGroupAvatar.uri }}
                        style={{ width: 96, height: 96 }}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (currentConversation?.avatarUrl || avatarUrlParam) ? (
                      <Image
                        source={{ uri: currentConversation?.avatarUrl || avatarUrlParam || "" }}
                        style={{ width: 96, height: 96 }}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <Ionicons name="camera-outline" size={32} color="#6366F1" />
                    )}
                  </TouchableOpacity>
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-indigo-600 mt-2 text-xs"
                  >
                    Thay đổi ảnh nhóm
                  </Text>
                </View>

                <View className="gap-1 mb-6">
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-gray-500 text-xs ml-1"
                  >
                    Tên nhóm
                  </Text>
                  <TextInput
                    value={editGroupName}
                    onChangeText={setEditGroupName}
                    placeholder="Nhập tên nhóm mới..."
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-black text-sm"
                    style={{ fontFamily: "Poppins-Regular" }}
                  />
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"
                    onPress={() => setEditingGroup(false)}
                    disabled={updatingGroup}
                  >
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className="text-gray-600"
                    >
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-indigo-600 py-4 rounded-2xl items-center shadow-lg shadow-indigo-200"
                    onPress={handleUpdateGroup}
                    disabled={updatingGroup}
                  >
                    {updatingGroup ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text
                        style={{ fontFamily: "Poppins-SemiBold" }}
                        className="text-white"
                      >
                        Lưu thay đổi
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <FlatList
                  data={membersInfo}
                  keyExtractor={(item) => item.userId}
                  className="max-h-80"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="flex-row items-center py-3 border-b border-gray-50"
                      onPress={() => handleShowInfo(item)}
                      disabled={item.userId === userInfo?.id}
                    >
                      <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-4 overflow-hidden">
                        {item.avatarUrl ? (
                          <Image 
                            source={{ uri: item.avatarUrl }} 
                            style={{ width: 48, height: 48 }}
                            contentFit="cover"
                            transition={200}
                          />
                        ) : (
                        <Text
                          style={{ fontFamily: "Poppins-Bold" }}
                          className="text-indigo-600 text-lg"
                        >
                          {item.fullName.charAt(0).toUpperCase()}
                        </Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ fontFamily: "Poppins-Medium" }}
                          className="text-base text-black"
                        >
                          {item.fullName}{" "}
                          {item.userId === userInfo?.id ? "(Bạn)" : ""}
                        </Text>
                      </View>
                      {item.userId !== userInfo?.id && (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#D1D5DB"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <Text
                      style={{ fontFamily: "Poppins-Regular" }}
                      className="text-center text-gray-400 py-4"
                    >
                      Chưa có dữ liệu thành viên
                    </Text>
                  )}
                />

                {isGroup && (
                  <View className="mt-6 gap-3">
                    <TouchableOpacity
                      className="bg-indigo-600 py-3 rounded-2xl flex-row items-center justify-center"
                      onPress={() => {
                        setShowInfoModal(false);
                        router.push({
                          pathname: `/${rolePrefix}/chat/add-members` as any,
                          params: { conversationId: realConversationId },
                        });
                      }}
                    >
                      <Ionicons
                        name="person-add-outline"
                        size={20}
                        color="white"
                        className="mr-2"
                      />
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-white ml-2"
                      >
                        Thêm thành viên
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-rose-50 py-3 rounded-2xl flex-row items-center justify-center"
                      onPress={handleLeaveGroup}
                    >
                      <Ionicons
                        name="log-out-outline"
                        size={20}
                        color="#F43F5E"
                        className="mr-2"
                      />
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-rose-500 ml-2"
                      >
                        Rời nhóm
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
