import { useState, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { notificationService } from "../../services/notification.service";
import { NotificationResponse } from "../../types/notification";

const { width } = Dimensions.get("window");

// helper function to group notifications
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

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>Thông báo</Text>
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
          <Text
            className="text-gray-400 mt-4"
            style={{ fontFamily: "Poppins-Medium" }}
          >
            Chưa có thông báo nào
          </Text>
        </View>
      ) : (
        <SectionList
          sections={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center px-6 py-4">
              {/* Unread Dot */}
              <View className="w-4 items-center justify-center mr-2">
                {!item.isRead && (
                  <View className="w-2.5 h-2.5 bg-bright-blue rounded-full" />
                )}
              </View>

              {/* Icon instead of avatar based on type */}
              <View className="w-14 h-14 rounded-full overflow-hidden mr-4 bg-bright-blue/10 items-center justify-center">
                <Ionicons
                  name={
                    item.type === "Assignment"
                      ? "document-text"
                      : item.type === "Event"
                        ? "calendar"
                        : "notifications"
                  }
                  size={24}
                  color="#136ADA"
                />
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <Text
                    className="text-black text-base"
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="text-gray-400 text-xs"
                    style={{ fontFamily: "Poppins-Regular" }}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
                <Text
                  className="text-gray-400 text-sm pr-4 mt-1"
                  style={{ fontFamily: "Poppins-Regular" }}
                  numberOfLines={2}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View className="px-6 py-2 bg-white mt-4">
              <Text
                className="text-black text-lg"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                {title}
              </Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
