import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Premium Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black flex-1">Quản lý Lớp học</Text>
        <View className="flex-row items-center gap-2">
           <TouchableOpacity 
             onPress={() => router.push('/admin/class-years/promote')}
             className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100"
           >
             <Text style={{ fontFamily: "Poppins-Bold" }} className="text-indigo-600 text-[10px] tracking-tighter">LÊN LỚP</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             onPress={() => router.push("/admin/class-years/create" as any)}
             className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100"
           >
             <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-[10px] tracking-tighter">THÊM MỚI</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* Modern Search & Options Bar */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <View className="flex-1 bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm kiếm tên lớp..."
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            value={tempSearch}
            onChangeText={setTempSearch}
            onSubmitEditing={applyFilters}
          />
        </View>
        <TouchableOpacity
          onPress={openFilter}
          className="bg-[#136ADA] w-12 h-12 rounded-2xl items-center justify-center shadow-md shadow-blue-200"
        >
          <Ionicons name="options-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Advanced Filter Bottom Sheet */}
      <Modal visible={isFilterVisible} animationType="slide" transparent={true} onRequestClose={() => setIsFilterVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Lọc Lớp học</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Filter: School Year */}
            <View className="mb-8">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Năm học</Text>
              <View className="bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 flex-row items-center">
                <TextInput
                  value={tempYear}
                  onChangeText={setTempYear}
                  placeholder={SCHOOL_YEAR}
                  keyboardType="numeric"
                  className="flex-1 text-black text-base"
                  style={{ fontFamily: "Poppins-SemiBold" }}
                />
              </View>
            </View>

            {/* Filter: Grade */}
            <View className="mb-12">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Khối lớp</Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setTempGrade(undefined)}
                  className={`flex-1 py-3.5 rounded-2xl items-center ${tempGrade === undefined ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                >
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: tempGrade === undefined ? "#1D4ED8" : "#9CA3AF" }}>Tất cả khối</Text>
                </TouchableOpacity>
                {GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setTempGrade(g)}
                    className={`flex-1 py-3.5 rounded-2xl items-center ${tempGrade === g ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                  >
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: tempGrade === g ? "#1D4ED8" : "#9CA3AF" }}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Modal Actions */}
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

      {/* Class List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          keyExtractor={(item, index) => item.classYearId || index.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" /> }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100"
              onPress={() => router.push(`/admin/class-years/${item.classYearId}` as any)}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="bg-blue-50 px-4 py-1.5 rounded-2xl border border-blue-100">
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 14, color: "#136ADA" }}>{item.className}</Text>
                </View>
                <View className="bg-gray-50 px-3 py-1 rounded-xl">
                  <Text style={{ fontFamily: "Poppins-Medium", fontSize: 10 }} className="text-gray-400">AY {item.schoolYear}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center border border-indigo-200">
                  <Ionicons name="person" size={18} color="#6366F1" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: "Poppins-Medium", fontSize: 10 }} className="text-gray-400 uppercase tracking-tighter">Giáo viên Chủ nhiệm</Text>
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13 }} className="text-indigo-900" numberOfLines={1}>
                    {item.homeRoomTeacher || (item.homeRoomId ? teachers.find((t) => t.teacherId === item.homeRoomId)?.fullName : null) || "Chưa phân công"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="business-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center px-10">Không tìm thấy lớp học nào.{"\n"}Hãy thử điều chỉnh bộ lọc.</Text>
            </View>
          }
          ListFooterComponent={<View className="h-20" />}
        />
      )}
    </SafeAreaView>
  );
}
