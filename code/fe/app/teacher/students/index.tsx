import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { studentService } from "../../../services/student.service";
import { classYearService } from "../../../services/classYear.service";
import { useConfigStore } from "../../../store/configStore";
import { StudentListItem } from "../../../types/student";

export default function TeacherStudentListScreen() {
  const params = useLocalSearchParams();
  const { schoolYear: currentConfigYear } = useConfigStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState<string | undefined>();
  const [classId, setClassId] = useState<string | undefined>(
    params.classId as string,
  );
  const [homeroom, setHomeroom] = useState<{
    className: string;
    grade: number;
    classYearId: string;
  } | null>(null);

  useEffect(() => {
    const fetchHomeroom = async () => {
      try {
        const hr = await classYearService.getHomeroomClass(currentConfigYear);
        if (hr) {
          setHomeroom({
            className: hr.className || "",
            grade: hr.grade,
            classYearId: hr.classYearId,
          });
        }
      } catch (error) {
        console.error("Error fetching homeroom:", error);
      }
    };
    fetchHomeroom();
  }, [currentConfigYear]);

  useEffect(() => {
    if (params.classId !== classId) {
      setClassId(params.classId as string);
    }
  }, [params.classId]);

  useEffect(() => {
    // Only fetch students if we have a specific class context or homeroom context
    if (classId || homeroom) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [grade, classId, homeroom, currentConfigYear]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentService.getStudents({
        grade: grade,
        ClassYearId: classId || homeroom?.classYearId,
        schoolYear: currentConfigYear,
        search: search || undefined,
      });
      setStudents(response.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStudent = ({ item }: { item: StudentListItem }) => (
    <TouchableOpacity
      onPress={() => router.push(`/teacher/students/${item.studentId}`)}
      className="bg-white p-4 rounded-2xl mb-3 flex-row items-center border border-gray-100 shadow-sm"
    >
      <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-bright-blue text-lg"
        >
          {item.fullName.charAt(0)}
        </Text>
      </View>
      <View className="flex-1">
        <Text
          style={{ fontFamily: "Poppins-SemiBold" }}
          className="text-black text-base"
        >
          {item.fullName}
        </Text>
        <Text
          style={{ fontFamily: "Poppins-Regular" }}
          className="text-gray-500 text-xs"
        >
          Khối {item.grade} • {item.className}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-black text-xl flex-1"
          >
            Danh sách học sinh lớp {homeroom?.className}
          </Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm kiếm học sinh..."
            className="flex-1 ml-2 text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchStudents}
          />
        </View>
      </View>

      <View className="flex-1 px-6 pt-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#136ADA" />
          </View>
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.studentId}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center pt-10">
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400"
                >
                  Không tìm thấy học sinh
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
