import { assignmentService } from "@/services/assignment.service";
import { studentService } from "@/services/student.service";
import { classYearService } from "@/services/classYear.service";
import { SCHOOL_YEAR } from "@/constants/config";
import { StudentAssignmentResponse } from "@/types/assignment";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function StudentAssignmentListScreen() {
  const [assignments, setAssignments] = useState<StudentAssignmentResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);

      const params: any = {};
      try {
          // Fetch current class info for the student based on fixed school year
          const myClass = await classYearService.getMyClass(parseInt(SCHOOL_YEAR, 10));
          if (myClass?.classYearId) {
              params.ClassYearId = myClass.classYearId;
          }
      } catch (err) {
          // Fallback if class cannot be determined
      }

      const data: any = await assignmentService.getMyAssignments(params);
      
      const assignmentsList = Array.isArray(data) ? data : (data?.items || []);
      setAssignments(assignmentsList);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const getStatusInfo = (assignment: StudentAssignmentResponse) => {
    const now = new Date();
    const finish = new Date(assignment.finishTime);
    const isLate = now > finish;

    // API returns status: null if not submitted, or "Submitted"/"Graded" if already turned in
    if (assignment.status !== null) {
      return {
        label: assignment.status === "Graded" ? "Đã chấm điểm" : "Đã nộp",
        color: "text-green-500",
        bgColor: "bg-green-50",
        icon: "checkmark-circle-outline" as any,
      };
    }

    if (isLate) {
      return {
        label: "Quá hạn",
        color: "text-red-500",
        bgColor: "bg-red-50",
        icon: "alert-circle-outline" as any,
      };
    }

    return {
      label: "Chưa nộp",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      icon: "time-outline" as any,
    };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50/50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Bài tập của bạn",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: "Poppins-Bold",
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
        }}
      />
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color="#136ADA" />
            <Text
              className="mt-4 text-gray-400"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              Đang tải bài tập...
            </Text>
          </View>
        ) : !assignments || assignments.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <View className="bg-blue-50 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons
                name="document-text-outline"
                size={32}
                color="#136ADA"
              />
            </View>
            <Text
              className="text-black text-lg"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              Chưa có bài tập nào
            </Text>
            <Text
              className="text-gray-400 text-center px-10"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              Giáo viên chưa giao bài tập nào. Hãy nghỉ ngơi nhé!
            </Text>
          </View>
        ) : (
          <View className="pb-10">
            <Text
              className="text-gray-400 text-sm mb-6 uppercase tracking-wider"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              Nhiệm vụ hiện tại
            </Text>

            {assignments?.map((item) => {
              const status = getStatusInfo(item);
              return (
                <TouchableOpacity
                  key={item.assignmentId}
                  className="bg-white border border-gray-100 p-5 rounded-3xl mb-4 shadow-sm"
                  onPress={() =>
                    router.push(
                      `/student/assignments/${item.assignmentId}` as any,
                    )
                  }
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-4">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="px-2 py-0.5 bg-blue-100 rounded-md">
                          <Text
                            className="text-bright-blue text-[10px]"
                            style={{ fontFamily: "Poppins-Bold" }}
                          >
                            {item.subjectName}
                          </Text>
                        </View>
                        <Text
                          className="text-gray-400 text-[10px]"
                          style={{ fontFamily: "Poppins-Medium" }}
                        >
                          {item.teacherName}
                        </Text>
                      </View>
                      <Text
                        className="text-black text-lg leading-tight"
                        style={{ fontFamily: "Poppins-Bold" }}
                      >
                        {item.title}
                      </Text>
                    </View>

                    <View
                      className={`${status.bgColor} px-3 py-1.5 rounded-full flex-row items-center gap-1`}
                    >
                      <Ionicons
                        name={status.icon}
                        size={14}
                        color={status.color.replace("text-", "")}
                      />
                      <Text
                        className={`${status.color} text-[10px]`}
                        style={{ fontFamily: "Poppins-Bold" }}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color="#9CA3AF"
                        />
                        <Text
                          className="text-gray-400 text-xs"
                          style={{ fontFamily: "Poppins-Regular" }}
                        >
                          Starts: {formatDate(item.startTime)}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="alarm-outline"
                          size={14}
                          color="#9CA3AF"
                        />
                        <Text
                          className="text-gray-400 text-xs"
                          style={{ fontFamily: "Poppins-Regular" }}
                        >
                          Hạn nộp: {formatDate(item.finishTime)}
                        </Text>
                      </View>
                    </View>

                    <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="black"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
