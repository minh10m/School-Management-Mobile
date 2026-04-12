import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { examScheduleService } from "../../../services/examSchedule.service";
import {
  ExamScheduleDetailResponse,
  ExamScheduleDetailFilterRequest,
} from "../../../types/examSchedule";
import { PagedResponse } from "../../../types/common";
import { getErrorMessage } from "../../../utils/error";

const ExamScheduleDetail = () => {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<PagedResponse<ExamScheduleDetailResponse> | null>(null);
  const [filter, setFilter] = useState<ExamScheduleDetailFilterRequest>({
    pageNumber: 1,
    pageSize: 20,
  });

  const fetchData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const result = await examScheduleService.getScheduleDetails(id, filter);
      setData(result);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch exam slot details");
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

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setLoading(true);
        const success = await examScheduleService.uploadExcel(id, file.uri);
        if (success) {
          Alert.alert("Success", "Exam slot details imported from Excel");
          fetchData();
        } else {
          Alert.alert("Error", "Could not import Excel file");
        }
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudents = async () => {
    Alert.alert(
      "Confirm",
      "Do you want to automatically assign students to these exam rooms? This will overwrite any existing assignment data for this schedule.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: async () => {
            try {
              setLoading(true);
              const success = await examScheduleService.triggerAssignment(id);
              if (success) {
                Alert.alert("Success", "Students assigned to exam rooms successfully");
              } else {
                Alert.alert("Failed", "Could not assign students");
              }
            } catch (error: any) {
              Alert.alert("Error", getErrorMessage(error));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderSlot = ({ item }: { item: ExamScheduleDetailResponse }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm"
      onPress={() => router.push(`/admin/exam-schedules/slot/${item.examScheduleDetailId}`)}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-gray-900 font-bold text-base">{item.subjectName}</Text>
          <Text className="text-gray-500 text-xs mt-0.5">Room: {item.roomName}</Text>
        </View>
        <View className="bg-blue-50 px-2 py-1 rounded">
          <Text className="text-blue-600 text-[10px] font-bold">SLOT: {item.startTime.substring(0, 5)} - {item.finishTime.substring(0, 5)}</Text>
        </View>
      </View>

      <View className="border-t border-gray-50 pt-2 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1">{item.teacherName}</Text>
        </View>
        <Text className="text-gray-400 text-[10px] italic">{item.date}</Text>
      </View>
    </TouchableOpacity>
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
            {title || "Schedule Detail"}
          </Text>
        </View>
      </View>

      {/* Primary Actions */}
      <View className="px-6 py-4 flex-row gap-x-4 bg-white">
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 bg-[#10B981] h-12 rounded-2xl flex-row items-center justify-center shadow-sm"
          onPress={handleImportExcel}
        >
          <Ionicons name="cloud-upload" size={20} color="white" />
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white ml-2 text-sm"
          >
            Import
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 bg-[#136ADA] h-12 rounded-2xl flex-row items-center justify-center shadow-sm"
          onPress={handleAssignStudents}
        >
          <Ionicons name="people" size={20} color="white" />
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white ml-2 text-sm"
          >
            Assign
          </Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 mt-4 flex-row justify-between items-center">
        <Text className="text-gray-900 font-bold text-lg">Exam Slots</Text>
        <View className="bg-gray-200 px-2 py-0.5 rounded-full">
          <Text className="text-gray-600 text-[10px] font-bold">{data?.totalCount || 0}</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderSlot}
          keyExtractor={(item) => item.examScheduleDetailId}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20 bg-white rounded-2xl mx-6 mt-4 border border-dashed border-gray-200">
              <Ionicons name="grid-outline" size={48} color="#E5E7EB" />
              <Text className="text-gray-400 mt-4 text-center px-6">
                This schedule has no slots defined yet.{"\n"}Please import from the template Excel file.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ExamScheduleDetail;
