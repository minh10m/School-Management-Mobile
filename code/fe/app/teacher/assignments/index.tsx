import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { assignmentService } from "../../../services/assignment.service";
import { TeacherAssignmentListResponse } from "../../../types/assignment";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<TeacherAssignmentListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getAssignments({});
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments();
  }, [fetchAssignments]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
          Assignments
        </Text>
        <TouchableOpacity onPress={() => router.push("/teacher/assignments/create" as any)}>
          <Ionicons name="add-circle-outline" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.assignmentId}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4"
            onPress={() => {
              // Navigate to submissions or edit
               router.push(`/teacher/submissions?assignmentId=${item.assignmentId}` as any);
            }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-yellow-100 rounded-2xl items-center justify-center">
                  <Ionicons name="document-text" size={20} color="#EAB308" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-base" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase">
                    Assignment
                  </Text>
                </View>
              </View>
              <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[9px] uppercase">
                  ACTIVE
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-[11px]">
                  Due: {new Date(item.finishTime).toLocaleDateString('en-GB')}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                 <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-500 text-xs">
                    View Submissions
                 </Text>
                 <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading && !refreshing ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center">
                No assignments created yet.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
