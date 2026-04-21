import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback, useMemo } from "react";
import { classYearService } from "../../../services/classYear.service";
import { studentService } from "../../../services/student.service";
import { ClassYearResponse } from "../../../types/classYear";
import { StudentListItem } from "../../../types/student";

export default function TeachingClassDetail() {
  const { id, subjectId, subjectName } = useLocalSearchParams();
  const [classInfo, setClassInfo] = useState<ClassYearResponse | null>(null);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    if (!id || id === "create-assignment") return;
    try {
      setLoading(true);
      const [classRes, studentsRes] = await Promise.all([
        classYearService.getClassYearById(id as string).catch(() => null),
        studentService.getStudents({ ClassYearId: id as string, PageSize: 200 }).catch(() => ({ items: [], totalCount: 0 })),
      ]);

      setClassInfo(classRes);
      setStudents(studentsRes.items || []);
    } catch (error) {
      console.error("Error fetching class detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter((s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/teacher/my-class");
    }
  };

  if (loading && !classInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{classInfo?.className || "Chi tiết lớp học"}</Text>
          <Text style={styles.headerSubtitle}>
            {subjectName ? `${subjectName} • ` : ""}{classInfo?.grade ? `Khối ${classInfo.grade}` : "Đang tải..."} 
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hub Action Buttons */}
        <View className="px-5 py-6 flex-row gap-x-3">
          <FeatureCard
            label="Bài tập"
            icon="document"
            color="#2563EB"
            bg="bg-[#EFF6FF]"
            onPress={() =>
              router.push({
                pathname: "/teacher/my-class/assignments",
                params: {
                  classId: id,
                  subjectId: subjectId,
                  subjectName: subjectName,
                },
              } as any)
            }
          />
          <FeatureCard
            label="Điểm số"
            icon="bar-chart"
            color="#059669"
            bg="bg-[#ECFDF5]"
            onPress={() =>
              router.push({
                pathname: "/teacher/my-class/grades",
                params: {
                  classId: id,
                  subjectId: subjectId,
                  subjectName: subjectName,
                },
              } as any)
            }
          />
          <FeatureCard
            label="Nhập nhanh"
            icon="flash"
            color="#7C3AED"
            bg="bg-[#F5F3FF]"
            onPress={() =>
              router.push({
                pathname: "/teacher/my-class/batch-entry",
                params: { classId: id, subjectId: subjectId },
              } as any)
            }
          />
        </View>

        <View className="bg-white rounded-t-[40px] pt-8 min-h-[500px]">
          <View style={styles.searchContainer}>
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-800 text-base mb-4">Danh sách học sinh</Text>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#94A3B8" />
              <TextInput
                placeholder="Tìm kiếm học sinh..."
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.listContent}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((item, index) => (
                <StudentRow key={item.studentId} item={item} index={index} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>
                  {searchQuery ? "Không tìm thấy học sinh phù hợp" : "Chưa có học sinh trong lớp này"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({ label, icon, color, bg, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-1 ${bg} p-5 rounded-[32px] border border-white items-start justify-between min-h-[140px] shadow-sm shadow-gray-200/50`}
    >
      <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm shadow-gray-100">
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View className="w-full flex-row items-end justify-between mt-4">
        <Text
          style={{ fontFamily: "Poppins-Bold", color, fontSize: 15 }}
          className="flex-1 leading-tight"
        >
          {label}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={color} />
      </View>
    </TouchableOpacity>
  );
}

function StudentRow({ item, index }: { item: StudentListItem; index: number }) {
  return (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => router.push(`/teacher/students/${item.studentId}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.fullName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.fullName}</Text>
        <Text style={styles.studentIdText}>Mã: {item.studentId.substring(0, 8).toUpperCase()}</Text>
      </View>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  headerSubtitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#64748B",
    marginTop: -2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#0F172A",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#136ADA",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontFamily: "Poppins-Bold",
    fontSize: 15,
    color: "#1E293B",
  },
  studentIdText: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  numberBadge: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  numberText: {
    fontFamily: "Poppins-Bold",
    fontSize: 12,
    color: "#64748B",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 15,
  },
});
