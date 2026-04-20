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
import { studentService } from "../../../services/student.service";
import { StudentListItem } from "../../../types/student";

const GRADES = ["10", "11", "12"];

export default function AdminStudentsScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();
  const [tempGrade, setTempGrade] = useState<string | undefined>();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentService.getStudents({
        FullName: search || undefined,
        Grade: selectedGrade ? parseInt(selectedGrade, 10) : undefined,
        PageSize: 50,
        sortBy: "FullName",
        isAscending: true,
      });
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedGrade]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  const openFilter = () => {
    setTempSearch(search);
    setTempGrade(selectedGrade);
    setIsFilterVisible(true);
  };

  const applyFilters = () => {
    setSearch(tempSearch);
    setSelectedGrade(tempGrade);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setTempSearch("");
    setTempGrade(undefined);
    setSearch("");
    setSelectedGrade(undefined);
    setIsFilterVisible(false);
  };

  return (
    <AdminPageWrapper
      title="Quản lý Học sinh"
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm học sinh...",
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
              {/* Filter: Grade */}
              <View className="mb-12">
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-500 text-xs mb-3 ml-1"
                >
                  KHỐI LỚP
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => setTempGrade(undefined)}
                    className={`px-4 py-2 rounded-xl border ${!tempGrade ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins-Bold",
                        fontSize: 11,
                        color: !tempGrade ? "#1D4ED8" : "#9CA3AF",
                      }}
                    >
                      TẤT CẢ
                    </Text>
                  </TouchableOpacity>
                  {GRADES.map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setTempGrade(g)}
                      className={`px-4 py-2 rounded-xl border ${tempGrade === g ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 11,
                          color: tempGrade === g ? "#1D4ED8" : "#9CA3AF",
                        }}
                      >
                        KHỐI {g}
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

      {/* Student List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item, index) => item.studentId || index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            gap: 16,
          }}
          className="bg-white"
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
                router.push(`/admin/students/${item.studentId}` as any)
              }
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 flex-row items-center"
            >
              <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-[#136ADA] text-xl"
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
                  <View className="bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                    <Text
                      style={{
                        fontFamily: "Poppins-Medium",
                        fontSize: 10,
                        color: "#0D9488",
                      }}
                    >
                      Lớp {item.className}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins-Medium", fontSize: 10 }}
                    className="text-gray-400"
                  >
                    Khối {item.grade}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="person-outline" size={64} color="#D1D5DB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center px-10"
              >
                Không tìm thấy học sinh nào.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminPageWrapper>
  );
}
