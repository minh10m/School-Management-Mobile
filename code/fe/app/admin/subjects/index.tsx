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
import { useRouter, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from "react";
import { subjectService } from "../../../services/subject.service";
import { SubjectResponse } from "../../../types/subject";

export default function AdminSubjectsScreen() {
  const router = useRouter();
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
    <AdminPageWrapper
      title="Quản lý Môn học"
      rightComponent={
        <TouchableOpacity
          onPress={() => router.push("/admin/subjects/create" as any)}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-xs">Thêm mới</Text>
        </TouchableOpacity>
      }
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm môn học...",
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Standardized Subject List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filteredSubjects}
          keyExtractor={(item, index) => item.subjectId || index.toString()}
          className="bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 flex-row items-center justify-between"
              onPress={() => router.push(`/admin/subjects/${item.subjectId}` as any)}
            >
              <View className="flex-1">
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-black mb-1">{item.subjectName}</Text>
                <View className="flex-row items-center gap-2 mt-1.5 text-wrap">
                  <View className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="#136ADA" />
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 10, color: "#136ADA" }} className="ml-1">
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
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="book-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center px-10">
                Không tìm thấy môn học nào.{"\n"}Hãy thử từ khóa khác.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminPageWrapper>
  );
}
