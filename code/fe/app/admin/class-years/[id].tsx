import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
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
  const { id } = useLocalSearchParams<{ id: string }>();
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
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        {/* Main Identity Header */}
        <View className="px-6 py-8 items-center bg-gray-50/30">
          <View className="w-24 h-24 rounded-[36px] bg-white items-center justify-center shadow-sm border border-gray-100 mb-4">
            <View className="w-20 h-20 rounded-[32px] bg-indigo-500 items-center justify-center shadow-inner">
              <Ionicons name="business" size={40} color="white" />
            </View>
          </View>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-gray-900 text-3xl mb-1"
          >
            {classData?.className}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="bg-indigo-50 px-4 py-1.5 rounded-2xl border border-indigo-100">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-indigo-600 text-[10px] uppercase"
              >
                Khối {classData?.grade}
              </Text>
            </View>
            <View className="bg-emerald-50 px-4 py-1.5 rounded-2xl border border-emerald-100">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-emerald-600 text-[10px] uppercase"
              >
                {classData?.schoolYear}
              </Text>
            </View>
          </View>
        </View>

        {/* Vital Stats Chips */}
        <View className="flex-row px-8 -mt-6 gap-4">
          <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 items-center">
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-gray-900 text-xl"
            >
              {studentsInClass.length}
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[9px] uppercase tracking-widest"
            >
              Học sinh
            </Text>
          </View>
          <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 items-center">
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-emerald-500 text-xl"
            >
              100%
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[9px] uppercase tracking-widest"
            >
              Chuyên cần
            </Text>
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
                {teachers.map((t) => (
                  <TouchableOpacity
                    key={t.teacherId}
                    onPress={() =>
                      setForm(prev => ({ ...prev, homeRoomId: t.teacherId }))
                    }
                    className={`flex-row items-center p-4 rounded-[22px] border ${form.homeRoomId === t.teacherId ? "bg-indigo-600 border-indigo-700 shadow-md shadow-indigo-100" : "bg-gray-50 border-gray-100"}`}
                  >
                    <View
                      className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${form.homeRoomId === t.teacherId ? "bg-indigo-500" : "bg-white"}`}
                    >
                      <Ionicons
                        name="person"
                        size={20}
                        color={
                          form.homeRoomId === t.teacherId ? "white" : "#6366F1"
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 13,
                          color:
                            form.homeRoomId === t.teacherId ? "white" : "#1F2937",
                        }}
                      >
                        {t.fullName}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Poppins-Medium",
                          fontSize: 9,
                          color:
                            form.homeRoomId === t.teacherId ? "rgba(255,255,255,0.7)" : "#9CA3AF",
                        }}
                      >
                         {t.subjectNames && t.subjectNames.length > 0 ? t.subjectNames.join(" • ") : "Giáo viên"}
                      </Text>
                    </View>
                    {form.homeRoomId === t.teacherId && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="white"
                      />
                    )}
                  </TouchableOpacity>
                ))}
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
            <View className="mb-10">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-gray-400 text-[10px] uppercase tracking-[2px] mb-4 ml-2"
              >
                QUẢN LÝ CHỦ NHIỆM
              </Text>
              <TouchableOpacity
                onPress={() =>
                  classData?.homeRoomId &&
                  router.push(`/admin/teachers/${classData.homeRoomId}` as any)
                }
                className="bg-white rounded-[36px] px-6 py-7 border border-gray-100 shadow-sm flex-row items-center gap-5"
              >
                <View className="w-16 h-16 rounded-[24px] bg-purple-50 items-center justify-center border border-purple-100">
                  <Ionicons name="medal" size={32} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-gray-900 text-xl leading-tight"
                  >
                    {classData?.homeRoomTeacher ||
                      (classData?.homeRoomId
                        ? teachers.find(
                            (t) => t.teacherId === classData.homeRoomId,
                          )?.fullName
                        : null) ||
                      "Chưa phân công"}
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-gray-400 text-xs mt-0.5"
                  >
                    Giáo viên Chủ nhiệm
                  </Text>
                </View>
                <View className="bg-gray-50 p-2 rounded-full">
                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Students Roster Section */}
            <View className="mb-6 flex-row items-center justify-between px-2">
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-900 text-2xl"
                >
                  Danh sách Học sinh
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-[10px] uppercase tracking-widest mt-1"
                >
                  Tổng cộng {studentsInClass.length} thành viên
                </Text>
              </View>
            </View>

            {studentsInClass.length > 0 ? (
              <View className="gap-4">
                {studentsInClass.map((s, idx) => (
                  <TouchableOpacity
                    key={s.studentId}
                    onPress={() =>
                      router.push(`/admin/students/${s.studentId}` as any)
                    }
                    className="flex-row items-center p-5 bg-white border border-gray-100 rounded-[32px] shadow-sm"
                  >
                    <View className="w-12 h-12 rounded-[18px] bg-blue-50 items-center justify-center mr-4 border border-blue-100">
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-[#136ADA] text-xl"
                      >
                        {s.fullName.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-gray-900 text-base leading-tight"
                      >
                        {s.fullName}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name="finger-print-outline"
                          size={12}
                          color="#9CA3AF"
                        />
                        <Text
                          style={{ fontFamily: "Poppins-Medium" }}
                          className="text-gray-400 text-[10px] ml-1 uppercase"
                        >
                          {s.studentId.split("-")[0]}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-emerald-50 px-3 py-1 rounded-full">
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-emerald-500 text-[9px]"
                      >
                        ĐANG HỌC
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
