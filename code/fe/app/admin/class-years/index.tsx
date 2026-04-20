import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from 'react';
import { classYearService } from '../../../services/classYear.service';
import { teacherService } from '../../../services/teacher.service';
import { ClassYearResponse } from '../../../types/classYear';
import { TeacherListItem } from '../../../types/teacher';
import { SCHOOL_YEAR } from '../../../constants/config';

const GRADES = [10, 11, 12];

export default function AdminClassYearsScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // States for applied filters
  const [grade, setGrade] = useState<number | undefined>();
  const [schoolYear, setSchoolYear] = useState(SCHOOL_YEAR);
  const [search, setSearch] = useState("");

  // States for modal inputs (temporary selections)
  const [tempGrade, setTempGrade] = useState<number | undefined>();
  const [tempYear, setTempYear] = useState(SCHOOL_YEAR);
  const [tempSearch, setTempSearch] = useState("");

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const [res, teaRes] = await Promise.all([
        classYearService.getClassYears({ schoolYear, grade }),
        teacherService.getTeachers({ PageSize: 100 }), // Fix property naming
      ]);
      const data = Array.isArray(res) ? res : (res as any).items || [];
      const tdata = Array.isArray(teaRes) ? teaRes : (teaRes as any).items || [];
      setClasses(data);
      setTeachers(tdata);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [schoolYear, grade]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const openFilter = () => {
    setTempSearch(search);
    setTempGrade(grade);
    setTempYear(schoolYear);
    setIsFilterVisible(true);
  };

  const applyFilters = () => {
    setGrade(tempGrade);
    setSchoolYear(tempYear);
    setSearch(tempSearch);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setTempGrade(undefined);
    setTempYear(SCHOOL_YEAR);
    setTempSearch("");
    setGrade(undefined);
    setSchoolYear(SCHOOL_YEAR);
    setSearch("");
    setIsFilterVisible(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  const filteredClasses = classes.filter((c) =>
    c.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPageWrapper
      title="Quản lý Lớp học"
      rightComponent={
        <View className="flex-row items-center gap-2">
           <TouchableOpacity 
             onPress={() => router.push('/admin/class-years/promote')}
             className="bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100"
           >
             <Text style={{ fontFamily: "Poppins-Bold" }} className="text-indigo-600 text-[10px]">Lên lớp</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             onPress={() => router.push("/admin/class-years/create" as any)}
             className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
           >
             <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-xs">Thêm mới</Text>
           </TouchableOpacity>
        </View>
      }
      searchProps={{
        value: tempSearch,
        onChangeText: setTempSearch,
        placeholder: "Tìm kiếm tên lớp...",
        onFilterPress: openFilter,
      }}
    >

      {/* Advanced Filter Bottom Sheet */}
      <Modal visible={isFilterVisible} animationType="slide" transparent={true} onRequestClose={() => setIsFilterVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Bộ lọc</Text>
              <TouchableOpacity
                onPress={() => setIsFilterVisible(false)}
                className="bg-white p-2 rounded-full border border-gray-100"
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: School Year */}
              <View className="mb-8">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">NĂM HỌC</Text>
                <View className="flex-row flex-wrap gap-2">
                  {["2024", "2025", "2026"].map(y => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setTempYear(y)}
                      className={`px-4 py-2 rounded-xl border ${tempYear === y ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempYear === y ? "#1D4ED8" : "#9CA3AF" }}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter: Grade */}
              <View className="mb-12">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">KHỐI LỚP</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => setTempGrade(undefined)}
                    className={`px-4 py-2 rounded-xl border ${tempGrade === undefined ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempGrade === undefined ? "#1D4ED8" : "#9CA3AF" }}>TẤT CẢ</Text>
                  </TouchableOpacity>
                  {GRADES.map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setTempGrade(g)}
                      className={`px-4 py-2 rounded-xl border ${tempGrade === g ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempGrade === g ? "#1D4ED8" : "#9CA3AF" }}>KHỐI {g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-50 h-16 rounded-[22px] items-center justify-center"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 15 }} className="text-gray-400">Thiết lập lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 bg-[#136ADA] h-16 rounded-[22px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 15 }} className="text-white">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Class Year List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          keyExtractor={(item) => item.classYearId}
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm"
              onPress={() => router.push(`/admin/class-years/${item.classYearId}` as any)}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 18 }} className="text-black mb-1">Lớp {item.className}</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                      <Text style={{ fontFamily: "Poppins-Bold", color: "#136ADA", fontSize: 10 }}>KHỐI {item.grade}</Text>
                    </View>
                    <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">{item.schoolYear}</Text>
                  </View>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center border border-indigo-100">
                  <Ionicons name="business-outline" size={24} color="#6366F1" />
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-50/50">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="person-outline" size={14} color="#9CA3AF" />
                  <Text style={{ fontFamily: "Poppins-Medium", fontSize: 11 }} className="text-gray-400">
                    GVCN: {item.homeRoomTeacher || (item.homeRoomId ? teachers.find(t => t.teacherId === item.homeRoomId)?.fullName : null) || "Chưa phân công"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="business-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center px-10">
                Không tìm thấy lớp học nào.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminPageWrapper>
  );
}
