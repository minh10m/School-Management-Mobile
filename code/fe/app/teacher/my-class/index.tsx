import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback, useMemo } from "react";
import { classYearService } from "../../../services/classYear.service";
import { scheduleService } from "../../../services/schedule.service";
import { ClassYearSummary } from "../../../types/classYear";
import { TeacherScheduleDetailItem } from "../../../types/schedule";
import { useConfigStore } from "../../../store/configStore";
import { useAuthStore } from "../../../store/authStore";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";

const GRADE_OPTIONS = [
  { label: "Tất cả", value: null },
  { label: "Khối 10", value: 10 },
  { label: "Khối 11", value: 11 },
  { label: "Khối 12", value: 12 },
];

export default function MyTeachingClasses() {
  const { userInfo } = useAuthStore();
  const { schoolYear, term: storeTerm } = useConfigStore();
  const [teaching, setTeaching] = useState<ClassYearSummary[]>([]);
  const [scheduleItems, setScheduleItems] = useState<
    TeacherScheduleDetailItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tgRes, schRes] = await Promise.all([
        classYearService
          .getTeachingClasses({
            schoolYear: `${schoolYear}-${schoolYear + 1}`,
            pageSize: 100,
          })
          .catch(() => []),
        scheduleService
          .getMyTeachingSchedule({
            Term: storeTerm,
            SchoolYear: schoolYear,
          })
          .catch(() => []),
      ]);

      const teachingData = Array.isArray(tgRes)
        ? tgRes
        : (tgRes as any)?.items || [];
      setTeaching(teachingData);
      setScheduleItems(schRes);
    } catch (error) {
      console.error("Error fetching teaching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Combine teaching classes with subject info from schedule
  const teachingWithSubject = useMemo(() => {
    return teaching.map((cls) => {
      // Find a schedule item that matches this class
      const scheduleMatch = scheduleItems.find(
        (s) => s.className === cls.className,
      );
      return {
        ...cls,
        subjectId: scheduleMatch?.subjectId ?? "",
        subjectName: scheduleMatch?.subjectName ?? "",
        periods: scheduleItems.filter((s) => s.className === cls.className)
          .length,
      };
    });
  }, [teaching, scheduleItems]);

  const stats = useMemo(() => {
    const uniqueGrades = new Set(teaching.map((c) => c.grade)).size;
    return {
      totalClasses: teaching.length,
      grades: uniqueGrades,
      periods: scheduleItems.length,
    };
  }, [teaching, scheduleItems]);

  const filteredClasses = useMemo(() => {
    let result = teachingWithSubject;
    if (selectedGrade !== null) {
      result = result.filter((c) => c.grade === selectedGrade);
    }
    if (search.trim()) {
      result = result.filter((c) =>
        c.className.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return result;
  }, [teachingWithSubject, selectedGrade, search]);

  const groupedClasses = useMemo(() => {
    const groups: { [key: number]: typeof filteredClasses } = {};
    filteredClasses.forEach((c) => {
      if (!groups[c.grade]) groups[c.grade] = [];
      groups[c.grade].push(c);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredClasses]);

  const getPeriodsForClass = (className: string) => {
    return scheduleItems.filter((s) => s.className === className).length;
  };

  return (
    <AdminPageWrapper
      title="Lớp giảng dạy"
      onBack={() => router.back()}
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm lớp học...",
      }}
    >
      <StatusBar hidden />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            className="mb-4 pt-1"
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {GRADE_OPTIONS.map((opt) => {
              const isActive = selectedGrade === opt.value;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setSelectedGrade(opt.value)}
                  className="mr-2"
                >
                  <View 
                    className={`px-4 py-2 rounded-2xl border ${isActive ? 'border-[#136ADA]' : 'border-gray-100'}`}
                    style={{
                      backgroundColor: isActive ? "#136ADA" : "#F8FAFC",
                      shadowColor: isActive ? "#136ADA" : "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isActive ? 0.1 : 0.05,
                      shadowRadius: 2,
                      elevation: isActive ? 2 : 1,
                      minWidth: 70,
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins-Bold",
                        fontSize: 10,
                        color: isActive ? "white" : "#94A3B8"
                      }}
                    >
                      {opt.label.toUpperCase()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {loading && !refreshing ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#136ADA" />
          </View>
        ) : (
          <View className="px-6 mt-2">
            {groupedClasses.length > 0 ? (
              groupedClasses.map(([grade, classes]) => (
                <View key={grade} className="mb-8">
                  <View className="flex-row items-center gap-2 mb-4 ml-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <Text
                      style={{ fontFamily: "Poppins-SemiBold" }}
                      className="text-gray-500 text-[10px] uppercase tracking-widest"
                    >
                      KHỐI {grade} ({classes.length} lớp)
                    </Text>
                  </View>
                  {classes.map((item) => (
                    <ClassCard
                      key={item.classYearId}
                      item={item}
                      periods={item.periods}
                    />
                  ))}
                </View>
              ))
            ) : (
              <View className="items-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Ionicons name="school-outline" size={64} color="#D1D5DB" />
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 mt-4 text-sm"
                >
                  Không tìm thấy lớp học giảng dạy
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </AdminPageWrapper>
  );
}

function StatCard({
  label,
  value,
  icon,
  bg,
  color,
}: {
  label: string;
  value: number | string;
  icon: string;
  bg: string;
  color: string;
}) {
  return (
    <View
      className={`${bg} flex-1 p-5 rounded-3xl border border-white/50 shadow-sm`}
    >
      <View className="w-8 h-8 rounded-full bg-white/60 items-center justify-center mb-3">
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text
        style={{ fontFamily: "Poppins-Bold" }}
        className="text-black text-2xl"
      >
        {value}
      </Text>
      <Text
        style={{ fontFamily: "Poppins-Medium" }}
        className="text-gray-500 text-xs mt-1 uppercase tracking-wider"
      >
        {label}
      </Text>
    </View>
  );
}

function ClassCard({
  item,
  periods,
}: {
  item: ClassYearSummary;
  periods: number;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="bg-white rounded-3xl p-5 flex-row items-center mb-4 border border-gray-50 shadow-sm"
      onPress={() => {
        router.push({
          pathname: `/teacher/my-class/${item.classYearId}`,
          params: {
            subjectId: item.subjectId,
            subjectName: item.subjectName,
          },
        } as any);
      }}
    >
      <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center mr-4 border border-blue-100/50">
        <Ionicons name="business-outline" size={24} color="#136ADA" />
      </View>

      <View className="flex-1">
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-base"
        >
          Lớp {item.className}
        </Text>
        <Text
          style={{ fontFamily: "Poppins-Medium" }}
          className="text-[#136ADA] text-[10px] uppercase mb-1"
        >
          {item.subjectName || "Chưa gán môn"}
        </Text>
        <View className="flex-row items-center gap-3 mt-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={12} color="#9CA3AF" />
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px]"
            >
              {(item as any).studentCount || "40"} HS
            </Text>
          </View>
          <View className="w-1 h-1 rounded-full bg-gray-200" />
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px]"
            >
              {periods} tiết/tuần
            </Text>
          </View>
        </View>
      </View>

      <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
}
