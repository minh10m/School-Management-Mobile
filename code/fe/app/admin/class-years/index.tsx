import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { AdminLayout } from "../../../components/ui/AdminLayout";
import { useState, useEffect, useCallback } from 'react';
import { classYearService } from '../../../services/classYear.service';
import { teacherService } from '../../../services/teacher.service';
import { ClassYearResponse } from '../../../types/classYear';
import { TeacherListItem } from '../../../types/teacher';
import { SCHOOL_YEAR } from '../../../constants/config';

const GRADES = [10, 11, 12];

export default function AdminClassYearsScreen() {
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
    <AdminLayout
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
      <Stack.Screen options={{ headerShown: false }} />

      {/* Advanced Filter Bottom Sheet */}
      <Modal visible={isFilterVisible} animationType="slide" transparent={true} onRequestClose={() => setIsFilterVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Bộ lọc</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
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

    </AdminLayout>
  );
}
