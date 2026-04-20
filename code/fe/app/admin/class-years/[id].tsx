import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { classYearService } from "../../../services/classYear.service";
import { teacherService } from "../../../services/teacher.service";
import { studentService } from "../../../services/student.service";
import { ClassYearResponse } from "../../../types/classYear";
import { TeacherListItem } from "../../../types/teacher";
import { StudentListItem } from "../../../types/student";
import { getErrorMessage } from "../../../utils/error";

export default function AdminClassDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const [classData, setClassData] = useState<ClassYearResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [studentsInClass, setStudentsInClass] = useState<StudentListItem[]>([]);

  const [form, setForm] = useState({
    className: "",
    grade: 0,
    schoolYear: 0,
    homeRoomId: "",
  });

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await classYearService.getClassYearById(id);
      const [teaRes, studentsRes, allClassesRes] = await Promise.all([
        teacherService.getTeachers({ PageSize: 100 }),
        studentService.getStudents({ ClassName: res.className, PageSize: 100 }),
        classYearService.getClassYears(),
      ]);
      setClassData(res);
      setForm({
        className: res.className,
        grade: res.grade,
        schoolYear: res.schoolYear,
        homeRoomId: res.homeRoomId || "",
      });
      let tdata: TeacherListItem[] = Array.isArray(teaRes)
        ? teaRes
        : (teaRes as any).items || [];
      const sdata = Array.isArray(studentsRes)
        ? studentsRes
        : (studentsRes as any).items || [];
      const cdata = Array.isArray(allClassesRes)
        ? allClassesRes
        : (allClassesRes as any).items || [];

      const usedTeacherIds = new Set(
        cdata
          .map((c: any) => c.homeRoomId)
          .filter((tid: string) => tid && tid !== res.homeRoomId),
      );
      tdata = tdata.filter((t) => !usedTeacherIds.has(t.teacherId));

      setTeachers(tdata);
      setStudentsInClass(sdata);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    if (!form.className.trim()) {
      Alert.alert("Lỗi", "Tên lớp không được để trống");
      return;
    }
    try {
      await classYearService.updateClassYear(id, {
        ...form,
        schoolYear: parseInt(String(form.schoolYear), 10),
      });
      Alert.alert("Thành công", "Đã cập nhật thông tin lớp học");
      setEditing(false);
      fetchData();
    } catch (err: any) {
      Alert.alert("Lỗi", getErrorMessage(err));
    }
  };

  if (loading)
    return (
      <AdminPageWrapper title="Đang tải...">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      </AdminPageWrapper>
    );

  return (
    <AdminPageWrapper
      title={`Lớp ${classData?.className}`}
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/admin/class-years" as any);
        }
      }}
      rightComponent={
        <TouchableOpacity
          onPress={() => setEditing(!editing)}
          className={`px-4 py-2 rounded-xl ${editing ? "bg-gray-100" : "bg-blue-50 border border-blue-100"}`}
        >
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className={`text-xs ${editing ? "text-gray-500" : "text-[#136ADA]"}`}
          >
            {editing ? "Hủy" : "Chỉnh sửa"}
          </Text>
        </TouchableOpacity>
      }
    >
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        {/* Main Identity Header */}
        <View className="px-6 py-12 items-center bg-white">
          <View className="relative">
            <View className="w-28 h-28 rounded-[40px] bg-indigo-500 items-center justify-center shadow-2xl shadow-indigo-200">
              <Ionicons name="business" size={48} color="white" />
            </View>
            <View className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl items-center justify-center shadow-lg border border-gray-50">
               <Ionicons name="school" size={20} color="#6366F1" />
            </View>
          </View>
          
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-gray-900 text-4xl mt-6 mb-2 tracking-tight"
          >
            {classData?.className}
          </Text>
          
          <View className="flex-row items-center gap-3">
            <View className="bg-indigo-50 px-5 py-2 rounded-2xl border border-indigo-100">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-indigo-600 text-[11px] uppercase tracking-wider"
              >
                Khối {classData?.grade}
              </Text>
            </View>
            <View className="bg-emerald-50 px-5 py-2 rounded-2xl border border-emerald-100">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-emerald-600 text-[11px] uppercase tracking-wider"
              >
                Niên khóa {classData?.schoolYear}
              </Text>
            </View>
          </View>
        </View>

        {/* Vital Stats Chips - Redesigned as a premium bar */}
        <View className="px-8 -mt-6">
          <View className="bg-white p-6 rounded-[40px] shadow-xl shadow-gray-100 border border-gray-50 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
               <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center border border-blue-100">
                  <Ionicons name="people" size={24} color="#136ADA" />
               </View>
               <View>
                 <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-900 text-xl leading-tight">
                   {studentsInClass.length}
                 </Text>
                 <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase tracking-wider">
                   Học sinh trong lớp
                 </Text>
               </View>
            </View>
            <View className="bg-blue-50/50 p-2 rounded-full">
               <Ionicons name="stats-chart" size={16} color="#136ADA" />
            </View>
          </View>
        </View>

        {editing ? (
          <View className="p-8 gap-8">
            <View>
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-gray-900 text-sm mb-3 ml-1"
              >
                Tên Lớp học
              </Text>
              <TextInput
                value={form.className}
                onChangeText={(t) => setForm(prev => ({ ...prev, className: t }))}
                className="bg-gray-50 border border-gray-100 rounded-[22px] px-6 py-5 text-black text-sm"
                style={{ fontFamily: "Poppins-Medium" }}
                placeholder="Ví dụ: 10A1"
              />
            </View>

            <View>
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-gray-900 text-sm mb-4 ml-1"
              >
                Chọn Giáo viên Chủ nhiệm
              </Text>
              <View className="gap-3">
                {teachers.map((teacher) => {
                  const isSelected = form.homeRoomId === teacher.teacherId;
                  return (
                    <Pressable
                      key={teacher.teacherId}
                      onPress={() =>
                        setForm(prev => ({ ...prev, homeRoomId: teacher.teacherId }))
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        borderRadius: 20,
                        borderWidth: 1,
                        backgroundColor: isSelected ? '#2563EB' : 'white',
                        borderColor: isSelected ? '#2563EB' : '#F1F5F9',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isSelected ? 0.1 : 0.05,
                        shadowRadius: 2,
                        elevation: isSelected ? 3 : 1,
                      }}
                    >
                      <View
                        style={{
                          width: 44, 
                          height: 44, 
                          borderRadius: 14, 
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#F0F7FF',
                          alignItems: 'center', 
                          justifyContent: 'center',
                          marginRight: 14
                        }}
                      >
                        <Ionicons
                          name="person"
                          size={20}
                          color={isSelected ? "white" : "#2563EB"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{
                            fontFamily: "Poppins-Bold",
                            fontSize: 14,
                            color: isSelected ? "white" : "#111827",
                          }}
                        >
                          {teacher.fullName}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Poppins-Medium",
                            fontSize: 10,
                            color: isSelected ? "rgba(255,255,255,0.7)" : "#6B7280",
                          }}
                        >
                           {teacher.subjectNames && teacher.subjectNames.length > 0 ? teacher.subjectNames.join(" • ") : "Giáo viên"}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="white"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              className="bg-[#136ADA] rounded-[28px] py-5 items-center mt-4 shadow-xl shadow-blue-200"
              onPress={handleUpdate}
            >
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-white text-base"
              >
                Cập nhật Lớp học
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 py-10">
            {/* Advisor Spotlight Card */}
            <View className="mb-12">
              <View className="flex-row items-center justify-between mb-4 px-2">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-400 text-[10px] uppercase tracking-[3px]"
                >
                  QUẢN LÝ CHỦ NHIỆM
                </Text>
                <View className="w-8 h-px bg-gray-100" />
              </View>
              
              <TouchableOpacity
                onPress={() =>
                  classData?.homeRoomId &&
                  router.push(`/admin/teachers/${classData.homeRoomId}` as any)
                }
                className="bg-white rounded-[40px] px-7 py-8 border border-gray-100 shadow-xl shadow-gray-200 flex-row items-center gap-6"
              >
                <View className="w-18 h-18 rounded-[28px] bg-purple-50 items-center justify-center border border-purple-100 shadow-sm">
                  <Ionicons name="medal" size={36} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-gray-900 text-2xl leading-tight"
                  >
                    {classData?.homeRoomTeacher ||
                      (classData?.homeRoomId
                         ? teachers.find(
                             (t) => t.teacherId === classData.homeRoomId,
                           )?.fullName
                         : null) ||
                      "Chưa phân công"}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                     <View className="w-2 h-2 rounded-full bg-emerald-500" />
                     <Text
                        style={{ fontFamily: "Poppins-Medium" }}
                        className="text-gray-400 text-xs"
                      >
                        Giáo viên Chủ nhiệm
                      </Text>
                  </View>
                </View>
                <View className="bg-gray-50/50 p-3 rounded-full">
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Students Roster Section */}
            <View className="mb-8 flex-row items-end justify-between px-2">
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-900 text-3xl tracking-tight"
                >
                  Học sinh
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-indigo-400 text-[10px] uppercase tracking-widest mt-1"
                >
                  Danh sách chính thức
                </Text>
              </View>
              <View className="bg-indigo-50 px-4 py-1.5 rounded-full">
                 <Text style={{ fontFamily: "Poppins-Bold" }} className="text-indigo-600 text-[10px]">
                   {studentsInClass.length} THÀNH VIÊN
                 </Text>
              </View>
            </View>

            {studentsInClass.length > 0 ? (
              <View className="gap-5">
                {studentsInClass.map((s, idx) => (
                  <TouchableOpacity
                    key={s.studentId}
                    onPress={() =>
                      router.push(`/admin/students/${s.studentId}` as any)
                    }
                    className="flex-row items-center p-6 bg-white border border-gray-100 rounded-[36px] shadow-sm active:opacity-70"
                  >
                    <View className="w-14 h-14 rounded-[22px] bg-blue-50 items-center justify-center mr-5 border border-blue-100/50">
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-[#136ADA] text-2xl"
                      >
                        {s.fullName.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-gray-900 text-lg leading-tight"
                      >
                        {s.fullName}
                      </Text>
                      <View className="flex-row items-center mt-1.5 gap-2">
                        <View className="flex-row items-center">
                           <Ionicons
                             name="finger-print-outline"
                             size={12}
                             color="#94A3B8"
                           />
                           <Text
                             style={{ fontFamily: "Poppins-Medium" }}
                             className="text-gray-400 text-[10px] ml-1 uppercase"
                           >
                             {s.studentId.split("-")[0]}
                           </Text>
                        </View>
                        <View className="w-1 h-1 rounded-full bg-gray-200" />
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px]">Active</Text>
                      </View>
                    </View>
                    <View className="bg-emerald-50 px-4 py-1.5 rounded-2xl border border-emerald-100/50">
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-emerald-600 text-[9px] uppercase tracking-wider"
                      >
                        Đang học
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="items-center py-16 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6 shadow-sm">
                  <Ionicons name="people-outline" size={36} color="#D1D5DB" />
                </View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-400 text-sm"
                >
                  Chưa có học sinh trực thuộc
                </Text>
              </View>
            )}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </AdminPageWrapper>
  );
}
