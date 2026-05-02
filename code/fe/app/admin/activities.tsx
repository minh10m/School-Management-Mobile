import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
import { useEffect, useState, useCallback } from "react";
import { useConfigStore } from "../../store/configStore";
import { dashboardService } from "../../services/dashboard.service";
import { RecentActivity } from "../../types/dashboard";

export default function ActivitiesPage() {
  const router = useRouter();
  const { schoolYear } = useConfigStore();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats(Number(schoolYear));
      setActivities(data.recentActivities);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolYear]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  return (
    <AdminPageWrapper
      title="Hoạt động gần đây"
      onBack={() => router.back()}
    >
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#F97316" className="mt-10" />
        ) : (
          <View className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-10">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <View
                  key={index}
                  className={`flex-row items-center p-5 ${
                    index !== activities.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                      activity.type === "Payment"
                        ? "bg-orange-50"
                        : activity.type === "Submission"
                        ? "bg-blue-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <Ionicons
                      name={
                        activity.type === "Payment"
                          ? "cash-outline"
                          : activity.type === "Submission"
                          ? "document-text-outline"
                          : "notifications-outline"
                      }
                      size={24}
                      color={
                        activity.type === "Payment"
                          ? "#F97316"
                          : activity.type === "Submission"
                          ? "#3B82F6"
                          : "#6B7280"
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-800 text-sm mb-1"
                    >
                      {activity.description}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                      <Text
                        style={{ fontFamily: "Poppins-Regular" }}
                        className="text-gray-400 text-[11px] ml-1"
                      >
                        {new Date(activity.time).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {new Date(activity.time).toLocaleDateString("vi-VN")}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="p-10 items-center justify-center">
                <Ionicons name="file-tray-outline" size={48} color="#E5E7EB" />
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 mt-2"
                >
                  Không có hoạt động nào
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </AdminPageWrapper>
  );
}
