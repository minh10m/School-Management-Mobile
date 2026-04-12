import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { subjectService } from "../../../services/subject.service";
import { SubjectResponse } from "../../../types/subject";

export default function AdminSubjectsScreen() {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await subjectService.getSubjects();
      // Handle both { items: [] } and direct array [] responses
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubjects();
    setRefreshing(false);
  };

  const filteredSubjects = subjects.filter((s) =>
    s.subjectName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header aligned with synchronised UI */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-xl text-black"
          >
            Quản lý Môn học
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/admin/subjects/create" as any)}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-[#136ADA] text-xs"
          >
            Thêm mới
          </Text>
        </TouchableOpacity>
      </View>

      {/* Synchronized Search Bar Section */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <View className="flex-1 bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm kiếm môn học..."
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filteredSubjects}
          keyExtractor={(item, index) => item.subjectId || index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 16,
            gap: 12,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex-row items-center justify-between"
              onPress={() =>
                router.push(`/admin/subjects/${item.subjectId}` as any)
              }
            >
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-black text-base"
                >
                  {item.subjectName}
                </Text>
                <View className="flex-row items-center gap-2 mt-1.5">
                  <View className="bg-gray-50 flex-row items-center px-2 py-0.5 rounded-lg border border-gray-100">
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Text
                      style={{
                        fontFamily: "Poppins-Medium",
                        fontSize: 10,
                        color: "#9CA3AF",
                      }}
                      className="ml-1"
                    >
                      {item.maxPeriod} tiết/tuần
                    </Text>
                  </View>
                </View>
              </View>
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
                <Ionicons name="chevron-forward" size={18} color="#136ADA" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="book-outline" size={64} color="#E5E7EB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center"
              >
                Không tìm thấy môn học nào.{"\n"}Hãy thử từ khóa khác.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
