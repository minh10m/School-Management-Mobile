import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { examScheduleService } from "../../../../services/examSchedule.service";
import {
  ExamStudentAssignmentResponse,
  ExamStudentAssignmentFilterRequest,
} from "../../../../types/examSchedule";
import { PagedResponse } from "../../../../types/common";

const ExamSlotAssignments = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<PagedResponse<ExamStudentAssignmentResponse> | null>(null);
  const [filter, setFilter] = useState<ExamStudentAssignmentFilterRequest>({
    pageNumber: 1,
    pageSize: 50,
  });

  const fetchData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const result = await examScheduleService.getAssignments(id, filter);
      setData(result);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch candidate list");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [id, filter]);

  const renderStudent = ({ item }: { item: ExamStudentAssignmentResponse }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
          <Text className="text-blue-600 font-bold">{item.studentName.charAt(0)}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
            {item.studentName}
          </Text>
          <Text className="text-gray-400 text-[10px]">ID: {item.studentId.substring(0, 8)}</Text>
        </View>
      </View>
      
      <View className="bg-blue-600 px-3 py-1 rounded-lg">
        <Text className="text-white font-black text-xs">{item.identificationNumber}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Synchronized Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-xl text-black"
          >
            Danh sách Thí sinh
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-400 text-[10px]"
          >
            Chi tiết phòng thi
          </Text>
        </View>
      </View>

      <View className="px-6 py-2">
        <View className="bg-blue-50 p-4 rounded-2xl flex-row items-center">
          <Ionicons name="information-circle-outline" size={20} color="#136ADA" />
          <Text className="text-blue-800 text-xs ml-2 flex-1 font-medium">
            Có {data?.totalCount || 0} học sinh được phân công vào phòng này.
          </Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderStudent}
          keyExtractor={(item) => item.examStudentAssignmentId}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 text-center">
                Chưa có học sinh nào được phân công.{"\n"}Vui lòng quay lại và bấm "Gán học sinh".
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ExamSlotAssignments;
