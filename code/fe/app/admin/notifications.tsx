import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { notificationService } from "../../services/notification.service";
import { userService } from "../../services/user.service";
import { NotificationResponse } from "../../types/notification";
import { UserListItem } from "../../types/user";

const { width } = Dimensions.get("window");

// Helper function to group notifications
const groupNotifications = (notifications: NotificationResponse[]) => {
  const grouped: { [key: string]: NotificationResponse[] } = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.createdAt);
    let groupKey = "";

    if (notifDate.toDateString() === today.toDateString()) {
      groupKey = "Hôm nay";
    } else if (notifDate.toDateString() === yesterday.toDateString()) {
      groupKey = "Hôm qua";
    } else {
      groupKey = notifDate.toLocaleDateString("vi-VN");
    }

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(notif);
  });

  return Object.keys(grouped).map((key) => ({
    title: key,
    data: grouped[key],
  }));
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminNotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating notifications
  const [createVisible, setCreateVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notificationType, setNotificationType] = useState("System"); // System, Event, Assignment, Other
  const [targetGroup, setTargetGroup] = useState("All"); // All, Teachers, Students, Custom
  
  // Custom users multi-select state
  const [searchQuery, setSearchQuery] = useState("");
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, []),
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAllNotifications({
        pageNumber: 1,
        pageSize: 50,
      });
      const grouped = groupNotifications(res.items);
      setNotifications(grouped);
    } catch (error) {
      console.log("Error loading notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      "Xóa thông báo",
      "Bạn có chắc chắn muốn xóa thông báo này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notificationId);
              Alert.alert("Thành công", "Xóa thông báo thành công!");
              fetchNotifications();
            } catch (error) {
              console.log("Error deleting notification", error);
              Alert.alert("Lỗi", "Không thể xóa thông báo.");
            }
          },
        },
      ]
    );
  };

  // Load custom users based on search query
  const loadUsers = async (search = "") => {
    try {
      setLoadingUsers(true);
      const res = await userService.getUsers({
        PageSize: 100,
        FullName: search || undefined,
      });
      setUsersList(res.items);
    } catch (error) {
      console.log("Error fetching users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (targetGroup === "Custom" && createVisible) {
      loadUsers(searchQuery);
    }
  }, [targetGroup, searchQuery, createVisible]);

  const handleToggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateNotification = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Tiêu đề không được để trống.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Lỗi", "Nội dung thông báo không được để trống.");
      return;
    }

    try {
      setSubmitting(true);
      let targetIds: string[] = [];

      if (targetGroup === "All") {
        const res = await userService.getUsers({ PageSize: 1000 });
        targetIds = res.items.map((u) => u.userId);
      } else if (targetGroup === "Teachers") {
        const res = await userService.getUsers({ Role: "Teacher", PageSize: 1000 });
        targetIds = res.items.map((u) => u.userId);
      } else if (targetGroup === "Students") {
        const res = await userService.getUsers({ Role: "Student", PageSize: 1000 });
        targetIds = res.items.map((u) => u.userId);
      } else {
        targetIds = selectedUserIds;
      }

      if (targetIds.length === 0) {
        Alert.alert("Lỗi", "Không có người nhận nào được chọn hoặc tìm thấy.");
        return;
      }

      await notificationService.createNotification({
        userId: targetIds,
        title: title.trim(),
        content: content.trim(),
        type: notificationType,
      });

      Alert.alert("Thành công", "Gửi thông báo thành công!");
      setCreateVisible(false);
      
      // Reset form
      setTitle("");
      setContent("");
      setNotificationType("System");
      setTargetGroup("All");
      setSelectedUserIds([]);
      setSearchQuery("");
      
      // Refresh notifications list
      fetchNotifications();
    } catch (error: any) {
      console.log("Error sending notification", error);
      Alert.alert("Lỗi", error?.response?.data?.message || "Không thể gửi thông báo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>
            Thông báo hệ thống
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
          <Text className="text-gray-400 mt-4 text-sm" style={{ fontFamily: "Poppins-Medium" }}>
            Chưa có thông báo nào được nhận
          </Text>
          <TouchableOpacity
            onPress={() => setCreateVisible(true)}
            className="mt-6 bg-bright-blue/10 px-6 py-3 rounded-full border border-bright-blue/20"
          >
            <Text className="text-bright-blue text-sm" style={{ fontFamily: "Poppins-SemiBold" }}>
              + Tạo thông báo mới
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <SectionList
            sections={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center px-6 py-4 border-b border-gray-50/50">
                {/* Unread Dot */}
                <View className="w-4 items-center justify-center mr-2">
                  {!item.isRead && (
                    <View className="w-2.5 h-2.5 bg-bright-blue rounded-full" />
                  )}
                </View>

                {/* Icon based on type */}
                <View className="w-12 h-12 rounded-full mr-4 bg-bright-blue/10 items-center justify-center">
                  <Ionicons
                    name={
                      item.type === "Assignment"
                        ? "document-text"
                        : item.type === "Event"
                        ? "calendar"
                        : "notifications"
                    }
                    size={22}
                    color="#136ADA"
                  />
                </View>

                {/* Content */}
                <View className="flex-1 pr-2">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-black text-sm flex-1 pr-2" style={{ fontFamily: "Poppins-Bold" }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text className="text-gray-400 text-[10px]" style={{ fontFamily: "Poppins-Regular" }}>
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs pr-4 mt-1" style={{ fontFamily: "Poppins-Regular" }} numberOfLines={2}>
                    {item.content}
                  </Text>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteNotification(item.id)}
                  className="p-2"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View className="px-6 py-2 bg-gray-50/60 mt-2">
                <Text className="text-gray-500 text-xs uppercase tracking-wider" style={{ fontFamily: "Poppins-SemiBold" }}>
                  {title}
                </Text>
              </View>
            )}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          {/* Floating Action Button */}
          <TouchableOpacity
            onPress={() => setCreateVisible(true)}
            className="absolute bottom-6 right-6 w-14 h-14 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/30 items-center justify-center"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Create Notification Modal */}
      <Modal
        visible={createVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
              <TouchableOpacity onPress={() => setCreateVisible(false)}>
                <Text className="text-gray-500 text-sm" style={{ fontFamily: "Poppins-Regular" }}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <Text className="text-black text-base" style={{ fontFamily: "Poppins-Bold" }}>
                Gửi Thông Báo Mới
              </Text>
              <TouchableOpacity onPress={handleCreateNotification} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#136ADA" />
                ) : (
                  <Text className="text-blue-600 text-sm" style={{ fontFamily: "Poppins-SemiBold" }}>
                    Gửi
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Form */}
            <FlatList
              data={[]}
              renderItem={null}
              ListHeaderComponent={
                <View className="p-6 gap-5">
                  {/* Tiêu đề */}
                  <View className="gap-1">
                    <Text className="text-gray-500 text-xs ml-1" style={{ fontFamily: "Poppins-Medium" }}>
                      Tiêu đề thông báo
                    </Text>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Nhập tiêu đề..."
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-black text-sm"
                      style={{ fontFamily: "Poppins-Regular" }}
                    />
                  </View>

                  {/* Nội dung */}
                  <View className="gap-1">
                    <Text className="text-gray-500 text-xs ml-1" style={{ fontFamily: "Poppins-Medium" }}>
                      Nội dung thông báo
                    </Text>
                    <TextInput
                      value={content}
                      onChangeText={setContent}
                      placeholder="Nhập nội dung chi tiết thông báo..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-black text-sm h-32"
                      style={{ fontFamily: "Poppins-Regular", textAlignVertical: "top" }}
                    />
                  </View>

                  {/* Loại thông báo */}
                  <View className="gap-2">
                    <Text className="text-gray-500 text-xs ml-1" style={{ fontFamily: "Poppins-Medium" }}>
                      Loại thông báo
                    </Text>
                    <View className="flex-row gap-2">
                      {[
                        { label: "Hệ thống", value: "System", color: "bg-blue-100 text-blue-700 border-blue-200" },
                        { label: "Sự kiện", value: "Event", color: "bg-rose-100 text-rose-700 border-rose-200" },
                        { label: "Bài học", value: "Assignment", color: "bg-purple-100 text-purple-700 border-purple-200" },
                        { label: "Khác", value: "Other", color: "bg-gray-100 text-gray-700 border-gray-200" },
                      ].map((typeItem) => {
                        const isSelected = notificationType === typeItem.value;
                        return (
                          <TouchableOpacity
                            key={typeItem.value}
                            onPress={() => setNotificationType(typeItem.value)}
                            className={`flex-1 py-2.5 rounded-full border items-center justify-center ${
                              isSelected ? typeItem.color : "bg-white border-gray-200"
                            }`}
                          >
                            <Text
                              className={`text-[11px] ${
                                isSelected ? "font-bold" : "text-gray-500"
                              }`}
                              style={{ fontFamily: isSelected ? "Poppins-Bold" : "Poppins-Regular" }}
                            >
                              {typeItem.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Người nhận */}
                  <View className="gap-2">
                    <Text className="text-gray-500 text-xs ml-1" style={{ fontFamily: "Poppins-Medium" }}>
                      Đối tượng nhận thông báo
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {[
                        { label: "Tất cả", value: "All" },
                        { label: "Giáo viên", value: "Teachers" },
                        { label: "Học sinh", value: "Students" },
                        { label: "Tùy chọn", value: "Custom" },
                      ].map((group) => {
                        const isSelected = targetGroup === group.value;
                        return (
                          <TouchableOpacity
                            key={group.value}
                            onPress={() => setTargetGroup(group.value)}
                            className={`px-5 py-2.5 rounded-full border items-center justify-center ${
                              isSelected
                                ? "bg-bright-blue border-bright-blue"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <Text
                              className={`text-[11px] ${
                                isSelected ? "text-white font-bold" : "text-gray-500"
                              }`}
                              style={{ fontFamily: isSelected ? "Poppins-Bold" : "Poppins-Regular" }}
                            >
                              {group.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Multi-select user list if Target is Custom */}
                  {targetGroup === "Custom" && (
                    <View className="gap-3 mt-2">
                      <Text className="text-gray-500 text-xs ml-1" style={{ fontFamily: "Poppins-Medium" }}>
                        Tìm kiếm & Chọn người nhận (Đã chọn: {selectedUserIds.length})
                      </Text>
                      
                      {/* Search Bar */}
                      <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2">
                        <Ionicons name="search-outline" size={18} color="#9CA3AF" className="mr-2" />
                        <TextInput
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          placeholder="Tìm theo họ tên hoặc tài khoản..."
                          placeholderTextColor="#9CA3AF"
                          className="flex-1 text-black text-sm p-1"
                          style={{ fontFamily: "Poppins-Regular" }}
                        />
                        {searchQuery.length > 0 && (
                          <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Search Results list */}
                      {loadingUsers ? (
                        <ActivityIndicator size="small" color="#136ADA" className="my-4" />
                      ) : usersList.length === 0 ? (
                        <Text className="text-gray-400 text-xs text-center my-4" style={{ fontFamily: "Poppins-Regular" }}>
                          Không tìm thấy người dùng nào.
                        </Text>
                      ) : (
                        <View className="bg-gray-50 border border-gray-100 rounded-2xl p-2 max-h-60 overflow-hidden">
                          <FlatList
                            data={usersList}
                            keyExtractor={(item) => item.userId}
                            nestedScrollEnabled={true}
                            renderItem={({ item }) => {
                              const isSelected = selectedUserIds.includes(item.userId);
                              return (
                                <TouchableOpacity
                                  onPress={() => handleToggleUserSelection(item.userId)}
                                  className="flex-row items-center justify-between p-3 border-b border-gray-100/50"
                                >
                                  <View className="flex-row items-center flex-1">
                                    <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3 overflow-hidden">
                                      {item.avatarUrl ? (
                                        <Image className="rounded-full"
                                          source={{ uri: item.avatarUrl }}
                                          style={{ width: 32, height: 32, borderRadius: 9999 }}
                                          contentFit="cover"
                                        />
                                      ) : (
                                        <Text className="text-blue-600 font-bold text-xs" style={{ fontFamily: "Poppins-Bold" }}>
                                          {item.fullName.charAt(0)}
                                        </Text>
                                      )}
                                    </View>
                                    <View className="flex-1">
                                      <Text className="text-black text-xs font-semibold" style={{ fontFamily: "Poppins-Medium" }} numberOfLines={1}>
                                        {item.fullName}
                                      </Text>
                                      <Text className="text-gray-400 text-[9px]" style={{ fontFamily: "Poppins-Regular" }}>
                                        @{item.userName} • {item.role}
                                      </Text>
                                    </View>
                                  </View>
                                  <Ionicons
                                    name={isSelected ? "checkbox" : "square-outline"}
                                    size={20}
                                    color={isSelected ? "#136ADA" : "#9CA3AF"}
                                  />
                                </TouchableOpacity>
                              );
                            }}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>
              }
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
