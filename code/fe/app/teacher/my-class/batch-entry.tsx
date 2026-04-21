import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { classYearService } from "../../../services/classYear.service";
import { teacherService } from "../../../services/teacher.service";
import { studentService } from "../../../services/student.service";
import { resultService } from "../../../services/result.service";
import { ClassYearSummary } from "../../../types/classYear";
import { TeacherSubject } from "../../../types/teacher";
import { StudentListItem } from "../../../types/student";
import { CreateResultRequest } from "../../../types/result";
import { SCHOOL_YEAR } from "../../../constants/config";
import { StatusBar } from "expo-status-bar";
import { useConfigStore } from "../../../store/configStore";

export default function BatchResultEntryScreen() {
  const params = useLocalSearchParams();
  const { schoolYear: currentSchoolYear, term: currentTerm } = useConfigStore();
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState<ClassYearSummary[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    (params.classId as string) || null,
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    (params.subjectId as string) || null,
  );
  const [selectedType, setSelectedType] = useState("Thường xuyên");
  const inputRefs = useRef<Record<string, any>>({});
  const scoreTypes = [
    { label: "Thường xuyên", weight: 1 },
    { label: "15p", weight: 1 },
    { label: "Giữa kì", weight: 2 },
    { label: "Cuối kì", weight: 3 },
  ];

  const activeClass = useMemo(
    () => classes.find((c) => c.classYearId === selectedClassId),
    [classes, selectedClassId],
  );
  const activeSubject = useMemo(
    () => subjects.find((s) => s.subjectId === selectedSubjectId),
    [subjects, selectedSubjectId],
  );

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const me = await teacherService.getMe();
      const [cls, sub] = await Promise.all([
        classYearService.getTeachingClasses({ schoolYear: SCHOOL_YEAR }),
        teacherService.getTeacherSubjects(me.teacherId),
      ]);
      setClasses(cls || []);
      setSubjects(sub || []);

      // If params are missing, auto-select first ones (fallback)
      if (!selectedClassId && cls?.length > 0)
        setSelectedClassId(cls[0].classYearId);
      if (!selectedSubjectId && sub?.length > 0)
        setSelectedSubjectId(sub[0].subjectId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSubjectId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchStudents = useCallback(async () => {
    if (!selectedClassId) return;
    try {
      setLoadingStudents(true);
      const data = await studentService.getStudents({
        ClassYearId: selectedClassId,
        PageSize: 100,
      });
      setStudents(data.items);
      const s: Record<string, string> = {};
      data.items.forEach((st) => {
        s[st.studentId] = "";
      });
      setScores(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleScoreChange = (sid: string, v: string) => {
    setScores((p) => ({ ...p, [sid]: v.replace(/[^0-9.]/g, "") }));
  };

  const focusNext = (idx: number) => {
    if (idx < students.length - 1)
      inputRefs.current[students[idx + 1].studentId]?.focus();
  };

  const handleSave = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    const entries: CreateResultRequest[] = Object.entries(scores)
      .filter(([_, v]) => v.trim() !== "")
      .map(([sid, v]) => ({
        studentId: sid,
        subjectId: selectedSubjectId!,
        type: selectedType,
        value: Number(v),
        weight: scoreTypes.find((t) => t.label === selectedType)?.weight || 1,
        term: currentTerm,
        schoolYear: currentSchoolYear,
      }));
    if (entries.length === 0)
      return Alert.alert("Thông báo", "Chưa nhập điểm.");
    try {
      setSubmitting(true);
      await resultService.createResults(entries);
      Alert.alert("Thành công", `Đã lưu điểm cho ${entries.length} học sinh!`);
      const s: Record<string, string> = {};
      students.forEach((st) => {
        s[st.studentId] = "";
      });
      setScores(s);
    } catch (e) {
      Alert.alert("Lỗi", "Lưu thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{ paddingTop: 20, paddingBottom: 15 }}
        className="flex-row items-center justify-between px-8 bg-white"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-2xl bg-gray-50"
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-[#1E293B] text-lg"
        >
          Nhập điểm hàng loạt
        </Text>
        <View className="w-10" />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {loading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#136ADA" />
          </View>
        ) : (
          <View className="px-6 py-6">
            {selectedClassId ? (
              <View className="bg-white rounded-[40px] p-8 mb-8 shadow-sm border border-gray-100">
                <View className="flex-row items-center mb-6">
                  <View className="w-8 h-8 bg-blue-50 rounded-xl items-center justify-center mr-2">
                    <Ionicons
                      name="settings-outline"
                      size={16}
                      color="#136ADA"
                    />
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-gray-900 text-sm"
                  >
                    Cấu hình nhập điểm
                  </Text>
                </View>

                {/* Class & Subject Summary Display */}
                <View className="flex-row items-center gap-4 mb-8 p-4 bg-gray-50/50 rounded-3xl border border-gray-50">
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className="text-gray-400 text-[11px] uppercase tracking-widest mb-1 ml-1"
                    >
                      Lớp học
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-gray-900 text-lg ml-1"
                    >
                      {activeClass?.className || "---"}
                    </Text>
                  </View>
                  <View className="w-[1px] h-8 bg-gray-200" />
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className="text-gray-400 text-[11px] uppercase tracking-widest mb-1 ml-1"
                    >
                      Môn học
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-indigo-600 text-lg ml-1"
                    >
                      {activeSubject?.subjectName || "---"}
                    </Text>
                  </View>
                </View>

                {/* Selection Section (Vertical) */}
                <View className="gap-y-6">
                  <View>
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className="text-gray-400 text-[11px] uppercase tracking-widest mb-3 ml-1"
                    >
                      Loại điểm
                    </Text>
                    <View className="flex-row gap-2">
                      {scoreTypes.map((t) => (
                        <TouchableOpacity
                          key={t.label}
                          onPress={() => setSelectedType(t.label)}
                          className={`flex-1 py-4 rounded-2xl border ${selectedType === t.label ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-50"}`}
                        >
                          <Text
                            style={{ fontFamily: "Poppins-Bold" }}
                            className={`text-center text-[11px] ${selectedType === t.label ? "text-emerald-700" : "text-gray-400"}`}
                          >
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                </View>
              </View>
            ) : null}
            {students.length > 0 && (
              <View className="px-1">
                <View className="mb-6">
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-gray-400 text-[11px] uppercase tracking-widest ml-1"
                  >
                    Danh sách học sinh ({students.length})
                  </Text>
                </View>
                {loadingStudents ? (
                  <View className="py-10">
                    <ActivityIndicator color="#136ADA" />
                  </View>
                ) : (
                  students.map((st, i) => {
                    const sc = scores[st.studentId] || "";
                    const inv =
                      sc !== "" && (Number(sc) > 10 || isNaN(Number(sc)));
                    const fill = sc !== "";
                    return (
                      <View
                        key={st.studentId}
                        className={`flex-row items-center bg-white p-5 rounded-[32px] mb-4 shadow-sm border ${inv ? "border-rose-200 bg-rose-50/10" : fill ? "border-blue-100" : "border-gray-50"}`}
                      >
                        <View
                          className={`w-12 h-12 rounded-[20px] items-center justify-center mr-4 ${fill ? "bg-blue-50" : "bg-gray-50 opacity-60"}`}
                        >
                          <Text
                            style={{ fontFamily: "Poppins-Bold" }}
                            className={fill ? "text-blue-600" : "text-gray-400"}
                          >
                            {st.fullName.charAt(0)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text
                            style={{ fontFamily: "Poppins-Bold" }}
                            className="text-gray-800 text-sm"
                            numberOfLines={1}
                          >
                            {st.fullName}
                          </Text>
                          <Text
                            style={{ fontFamily: "Poppins-Medium" }}
                            className="text-gray-400 text-[11px]"
                          >
                            Số thứ tự: {i + 1}
                          </Text>
                        </View>
                        <View className="relative">
                          <TextInput
                            ref={(el) => {
                              inputRefs.current[st.studentId] = el;
                            }}
                            value={sc}
                            onChangeText={(v) =>
                              handleScoreChange(st.studentId, v)
                            }
                            placeholder="---"
                            placeholderTextColor="#CBD5E1"
                            keyboardType="numeric"
                            returnKeyType={
                              i === students.length - 1 ? "done" : "next"
                            }
                            onSubmitEditing={() => focusNext(i)}
                            blurOnSubmit={i === students.length - 1}
                            className={`w-16 h-14 rounded-[22px] text-center text-xl shadow-sm ${inv ? "text-rose-600 bg-rose-50" : fill ? "text-blue-600 bg-blue-50/30" : "text-gray-400 bg-gray-50"}`}
                            style={{ fontFamily: "Poppins-Bold" }}
                          />
                          {inv && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full items-center justify-center border-2 border-white">
                              <Ionicons name="alert" size={10} color="white" />
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      {!loading && students.length > 0 && (
        <View className="absolute bottom-10 left-8 right-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={submitting}
            activeOpacity={0.9}
            className={`h-16 rounded-[28px] shadow-2xl flex-row items-center justify-center ${submitting ? "bg-blue-300" : "bg-emerald-600 shadow-emerald-200"}`}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                  <Ionicons name="save" size={18} color="white" />
                </View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-white text-lg"
                >
                  Lưu toàn bộ điểm
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}
