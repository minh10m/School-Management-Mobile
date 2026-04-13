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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { studentService } from "../../../services/student.service";
import { StudentListItem } from "../../../types/student";

const GRADES = ["10", "11", "12"];

export default function AdminStudentsScreen() {
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Synchronized Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-xl text-black"
        >
          Quản lý Học sinh
        </Text>
      </View>

      {/* Synchronized Search Bar Section */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <View className="flex-1 bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm kiếm học sinh..."
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            value={tempSearch}
            onChangeText={setTempSearch}
            onSubmitEditing={applyFilters}
          />
        </View>
        <TouchableOpacity
          onPress={openFilter}
          className="bg-blue-50 w-11 h-11 rounded-2xl items-center justify-center border border-blue-100"
        >
          <Ionicons name="options-outline" size={22} color="#136ADA" />
        </TouchableOpacity>
      </View>

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
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Lọc học sinh</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Filter: Grade */}
            <View className="mb-12">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Khối lớp</Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setTempGrade(undefined)}
                  className={`flex-1 py-3.5 rounded-2xl items-center ${!tempGrade ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                >
                  <Text
                    style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: !tempGrade ? "#1D4ED8" : "#9CA3AF" }}
                  >
                    Tất cả khối
                  </Text>
                </TouchableOpacity>
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setTempGrade(g)}
                    className={`flex-1 py-3.5 rounded-2xl items-center ${tempGrade === g ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                  >
                    <Text
                      style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: tempGrade === g ? "#1D4ED8" : "#9CA3AF" }}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Modal Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-50 h-16 rounded-[24px] items-center justify-center"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-gray-400">Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-2 bg-[#136ADA] h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-white">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item, index) => item.studentId || index.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100, gap: 12 }}
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
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex-row items-center"
              onPress={() =>
                router.push(`/admin/students/${item.studentId}` as any)
              }
            >
              <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-[#136ADA] text-lg"
                >
                  {item.fullName.charAt(0)}
                </Text>
              </View>
              <View className="flex-1 ml-4">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-black text-base"
                >
                  {item.fullName}
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View className="bg-teal-50 px-2 py-0.5 rounded-lg">
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
                    style={{ fontFamily: "Poppins-Regular" }}
                    className="text-gray-400 text-[10px]"
                  >
                    Khối {item.grade}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="people-outline" size={64} color="#E5E7EB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center"
              >
                Không tìm thấy học sinh.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
