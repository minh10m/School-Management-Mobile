import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect } from "react";
import { scheduleService } from "../../../services/schedule.service";
import { classYearService } from "../../../services/classYear.service";
import { ClassYearResponse } from "../../../types/classYear";
import { getErrorMessage } from "../../../utils/error";

export default function AdminCreateScheduleScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    classYearId: "",
    term: "1",
    schoolYear: "2026",
    isActive: true,
  });

  const fetchClasses = async () => {
    try {
      setFetching(true);
      const res = await classYearService.getClassYears({ schoolYear: "2026" });
      const cdata = Array.isArray(res) ? res : (res as any).items || [];
      setClasses(cdata);
      if (cdata.length > 0)
        setForm((f) => ({ ...f, classYearId: cdata[0].classYearId }));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async () => {
    if (!form.classYearId || !form.schoolYear) {
      Alert.alert("Thiếu thông tin", "Lớp học và Năm học là bắt buộc.");
      return;
    }

    try {
      setLoading(true);
      await scheduleService.createSchedule(form);
      Alert.alert("Thành công", "Đã khởi tạo thời khóa biểu thành công!", [
        { text: "Đồng ý", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </SafeAreaView>
    );

  return (
    <AdminPageWrapper
      title="Khởi tạo TKB"
    >
      <ScrollView
        className="flex-1 bg-gray-50/30"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
        }}
      >
        {/* Hero Section */}
        <View className="items-center mb-8 mt-4">
           <View className="w-24 h-24 bg-blue-100/50 rounded-[32px] items-center justify-center shadow-sm">
             <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center shadow-md">
               <Ionicons name="calendar-outline" size={38} color="#1D4ED8" />
             </View>
           </View>
           <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-gray-900 mt-4">Tạo Thời khóa biểu</Text>
           <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs mt-1">Thiết lập kế hoạch học tập mới cho học sinh</Text>
        </View>

        {/* Card 1: General Info */}
        <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-6">
            <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center">
              <Ionicons name="information-circle-outline" size={18} color="#1D4ED8" />
            </View>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-900 text-base">Cấu hình chung</Text>
          </View>

          <View className="space-y-5">
            <View>
              <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[10px] mb-2 uppercase tracking-wider ml-1">Tên Thời khóa biểu</Text>
              <TextInput
                placeholder="VD: TKB Học kỳ 1 - 2026"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-black text-sm"
                style={{ fontFamily: "Poppins-Regular" }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                 <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[10px] mb-2 uppercase tracking-wider ml-1">Năm học *</Text>
                 <TextInput
                   placeholder="2026"
                   value={form.schoolYear}
                   onChangeText={(t) => setForm({ ...form, schoolYear: t })}
                   keyboardType="numeric"
                   className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-black text-sm text-center shadow-sm"
                   style={{ fontFamily: "Poppins-Bold" }}
                 />
              </View>
              <View className="flex-1">
                 <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[10px] mb-2 uppercase tracking-wider ml-1">Học kỳ *</Text>
                 <TextInput
                   placeholder="1"
                   value={form.term}
                   onChangeText={(t) => setForm({ ...form, term: t })}
                   keyboardType="numeric"
                   className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-black text-sm text-center shadow-sm"
                   style={{ fontFamily: "Poppins-Bold" }}
                 />
              </View>
            </View>
          </View>
        </View>

        {/* Card 2: Class Selection & Status */}
        <View className="bg-white rounded-[32px] p-6 mb-8 shadow-sm border border-gray-100">
          <View className="flex-row items-center gap-2 mb-6">
            <View className="w-8 h-8 bg-purple-50 rounded-lg items-center justify-center">
              <Ionicons name="people-outline" size={18} color="#7C3AED" />
            </View>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-900 text-base">Đối tượng & Trạng thái</Text>
          </View>

          <View className="mb-8">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[10px] mb-3 uppercase tracking-wider ml-1">Chọn Khối lớp *</Text>
            <View className="flex-row gap-3">
              {[10, 11, 12].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => {
                    setSelectedGrade(g);
                    setForm({ ...form, classYearId: "" }); // Reset class when grade changes
                  }}
                  className={`flex-1 py-3.5 rounded-2xl border items-center ${
                    selectedGrade === g 
                      ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-100" 
                      : "bg-white border-gray-100 shadow-sm"
                  }`}
                >
                  <Text style={{ 
                    fontFamily: "Poppins-Bold", 
                    fontSize: 13,
                    color: selectedGrade === g ? "white" : "#6B7280" 
                  }}>Khối {g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedGrade && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3 ml-1">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[10px] uppercase tracking-wider">Danh sách Lớp học - Khối {selectedGrade}</Text>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-blue-600 text-[10px]">{classes.filter(c => c.grade === selectedGrade).length} lớp</Text>
              </View>
              <View className="flex-row flex-wrap gap-2.5">
                {classes.filter(c => c.grade === selectedGrade).map((c) => (
                  <TouchableOpacity
                    key={c.classYearId}
                    onPress={() => setForm({ ...form, classYearId: c.classYearId })}
                    className={`px-5 py-3 rounded-xl border ${
                      form.classYearId === c.classYearId 
                        ? "bg-blue-50 border-blue-200" 
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <Text style={{ 
                      fontFamily: "Poppins-Bold", 
                      fontSize: 12,
                      color: form.classYearId === c.classYearId ? "#1D4ED8" : "#475569" 
                    }}>{c.className}</Text>
                  </TouchableOpacity>
                ))}
                {classes.filter(c => c.grade === selectedGrade).length === 0 && (
                  <Text className="text-gray-400 text-xs italic py-2">Không tìm thấy lớp học cho khối này</Text>
                )}
              </View>
            </View>
          )}

          <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between border border-gray-100">
            <View className="flex-row items-center gap-3">
               <View className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm">
                 <Ionicons name="flash" size={18} color="#1D4ED8" />
               </View>
               <View>
                 <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-900 text-sm">Kích hoạt</Text>
                 <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]">Làm TKB chính thức</Text>
               </View>
            </View>
            <Switch
              value={form.isActive}
              onValueChange={(v) => setForm({ ...form, isActive: v })}
              trackColor={{ false: "#E5E7EB", true: "#1D4ED8" }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-lg shadow-blue-200 ${
            loading ? "bg-blue-300" : "bg-blue-700"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-lg mr-2">Khởi tạo ngay</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        <Text style={{ fontFamily: "Poppins-Regular" }} className="text-center text-gray-400 text-[10px] mt-6 px-10">
          Lưu ý: Bạn có thể chỉnh sửa chi tiết các tiết học của Thời khóa biểu này sau khi đã khởi tạo thành công.
        </Text>
      </ScrollView>
    </AdminPageWrapper>
  );
}
