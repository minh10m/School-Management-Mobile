import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from "react";
import { teacherService } from "../../../services/teacher.service";
import { subjectService } from "../../../services/subject.service";
import { TeacherListItem } from "../../../types/teacher";
import { SubjectResponse } from "../../../types/subject";

export default function AdminTeachersScreen() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState<
    string | undefined
  >();
  const [tempSubjectName, setTempSubjectName] = useState<string | undefined>();

  const loadInitialData = async () => {
    try {
      const subRes = await subjectService.getSubjects();
      setSubjects(Array.isArray(subRes) ? subRes : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teacherService.getTeachers({
        FullName: search || undefined,
        SubjectName: selectedSubjectName,
        PageSize: 50,
        sortBy: "FullName",
        isAscending: true,
      });
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSubjectName]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const openFilter = () => {
    setTempSearch(search);
    setTempSubjectName(selectedSubjectName);
    setIsFilterVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
    setRefreshing(false);
  };

  const applyFilters = () => {
    setSearch(tempSearch);
    setSelectedSubjectName(tempSubjectName);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setTempSearch("");
    setTempSubjectName(undefined);
    setSearch("");
    setSelectedSubjectName(undefined);
    setIsFilterVisible(false);
  };

  return (
    <AdminPageWrapper
      title="Quản lý Giáo viên"
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm giáo viên...",
        onFilterPress: openFilter,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Advanced Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-3xl text-black"
              >
                Bộ lọc
              </Text>
              <TouchableOpacity
                onPress={() => setIsFilterVisible(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: Subject */}
              <View className="mb-12">
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-500 text-xs mb-3 ml-1"
                >
                  CHUYÊN MÔN
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => setTempSubjectName(undefined)}
                    className={`px-4 py-2 rounded-xl border ${!tempSubjectName ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins-Bold",
                        fontSize: 11,
                        color: !tempSubjectName ? "#1D4ED8" : "#9CA3AF",
                      }}
                    >
                      TẤT CẢ
                    </Text>
                  </TouchableOpacity>
                  {subjects.map((s) => (
                    <TouchableOpacity
                      key={s.subjectId}
                      onPress={() => setTempSubjectName(s.subjectName)}
                      className={`px-4 py-2 rounded-xl border ${tempSubjectName === s.subjectName ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 11,
                          color:
                            tempSubjectName === s.subjectName
                              ? "#1D4ED8"
                              : "#9CA3AF",
                        }}
                      >
                        {s.subjectName.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-50 h-16 rounded-[22px] items-center justify-center"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 15 }}
                  className="text-gray-400"
                >
                  Thiết lập lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 bg-[#136ADA] h-16 rounded-[22px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 15 }}
                  className="text-white"
                >
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Teacher List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item, index) => item.teacherId || index.toString()}
          className="bg-white"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push(`/admin/teachers/${item.teacherId}` as any)
              }
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 flex-row items-center"
            >
              <View className="w-14 h-14 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-[#6366F1] text-xl"
                >
                  {item.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1 ml-4">
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 16 }}
                  className="text-black mb-1"
                >
                  {item.fullName}
                </Text>
                <View className="flex-row items-center flex-wrap gap-2">
                  {item.subjectNames && item.subjectNames.length > 0 ? (
                    item.subjectNames.map((subject, idx) => (
                      <View
                        key={idx}
                        className="bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20"
                      >
                        <Text
                          style={{
                            fontFamily: "Poppins-Bold",
                            fontSize: 10,
                            color: "#6366F1",
                          }}
                        >
                          {subject.toUpperCase()}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View className="bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 10,
                          color: "#9CA3AF",
                        }}
                      >
                        CHƯA CÓ MÔN HỌC
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center px-10"
              >
                Không tìm thấy giáo viên nào.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminPageWrapper>
  );
}
