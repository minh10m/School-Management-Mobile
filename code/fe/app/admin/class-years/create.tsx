import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { classYearService } from "../../../services/classYear.service";
import { teacherService } from "../../../services/teacher.service";
import { TeacherListItem } from "../../../types/teacher";
import { SCHOOL_YEAR } from "../../../constants/config";
import { getErrorMessage } from "../../../utils/error";

const FormLabel = ({ children }: { children: string }) => (
  <Text
    style={{ fontFamily: "Poppins-SemiBold" }}
    className="text-gray-500 text-xs mb-2 uppercase tracking-widest ml-1"
  >
    {children}
  </Text>
);

export default function AdminCreateClassScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [teacherSearch, setTeacherSearch] = useState("");

  const [form, setForm] = useState({
    className: "",
    grade: 10,
    schoolYear: SCHOOL_YEAR,
    homeRoomId: "",
  });

  const fetchTeachers = async () => {
    try {
      setFetching(true);
      const res = await teacherService.getTeachers({ PageSize: 100 });
      const tdata = Array.isArray(res) ? res : (res as any).items || [];
      setTeachers(tdata);
      if (tdata.length > 0)
        setForm((f) => ({ ...f, homeRoomId: tdata[0].teacherId }));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async () => {
    if (!form.className.trim() || !form.schoolYear || !form.homeRoomId) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường dữ liệu.");
      return;
    }

    try {
      setLoading(true);
      await classYearService.createClassYear({
        ...form,
        schoolYear: parseInt(String(form.schoolYear), 10)
      });
      Alert.alert("Thành công", "Đã tạo lớp học mới thành công!", [
        { text: "Đồng ý", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Lỗi", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <AdminPageWrapper title="Tạo Lớp mới">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </AdminPageWrapper>
    );

  return (
    <AdminPageWrapper 
      title="Tạo Lớp mới"
      rightComponent={
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading}
          style={{ padding: 8 }}
        >
          {loading ? (
             <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <Text style={{ fontFamily: "Poppins-Bold", color: '#2563EB', fontSize: 16 }}>
              Lưu
            </Text>
          )}
        </TouchableOpacity>
      }
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 bg-white"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 100 }}
        >
          {/* Section: Class Identity */}
          <View className="mb-8">
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-base mb-6">Định danh Lớp học</Text>
            
            <View className="mb-6">
              <FormLabel>Tên lớp học *</FormLabel>
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center border border-gray-50">
                <Ionicons name="pencil-outline" size={20} color="#9CA3AF" className="mr-3" />
                <TextInput
                  placeholder="Ví dụ: 10A1, 12A2..."
                  value={form.className}
                  onChangeText={(t) => setForm(prev => ({ ...prev, className: t }))}
                  className="flex-1 text-black text-sm"
                  style={{ fontFamily: "Poppins-Medium" }}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View className="mb-6">
              <FormLabel>Năm học *</FormLabel>
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center border border-gray-50">
                <Ionicons name="calendar-outline" size={20} color="#9CA3AF" className="mr-3" />
                <TextInput
                  placeholder="2026"
                  value={String(form.schoolYear)}
                  onChangeText={(t) => setForm(prev => ({ ...prev, schoolYear: t }))}
                  keyboardType="numeric"
                  className="flex-1 text-black text-sm"
                  style={{ fontFamily: "Poppins-Medium" }}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Section: Grade Selection */}
          <View style={{ marginBottom: 40 }}>
            <FormLabel>Chọn Khối học *</FormLabel>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              {[10, 11, 12].map((g) => {
                const isActive = form.grade === g;
                return (
                  <View key={g} style={{ flex: 1, marginRight: g === 12 ? 0 : 12 }}>
                    <Pressable
                      onPress={() => setForm(prev => ({ ...prev, grade: g }))}
                      style={{
                        paddingVertical: 16,
                        borderRadius: 20,
                        borderWidth: 1.5,
                        backgroundColor: isActive ? '#2563EB' : '#FFFFFF',
                        borderColor: isActive ? '#2563EB' : '#F1F5F9',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isActive ? 0.2 : 0.05,
                        shadowRadius: 8,
                        elevation: isActive ? 6 : 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{ 
                          fontFamily: "Poppins-Bold", 
                          fontSize: 20,
                          color: isActive ? 'white' : '#1F2937'
                        }}
                      >
                        {g}
                      </Text>
                      <Text
                        style={{ 
                          fontFamily: "Poppins-Bold", 
                          fontSize: 9,
                          color: isActive ? 'rgba(255,255,255,0.8)' : '#9CA3AF',
                          textTransform: 'uppercase',
                          marginTop: -2
                        }}
                      >
                        KHỐI
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Section: Advisor Selection */}
          <View style={{ marginBottom: 40, backgroundColor: '#F8FAFC', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ fontFamily: "Poppins-Bold", color: '#1E3A8A', fontSize: 13, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Giáo viên Chủ nhiệm</Text>
            
            <View className="flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 py-2 mb-6 shadow-sm">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                value={teacherSearch}
                onChangeText={setTeacherSearch}
                placeholder="Tìm tên giáo viên..."
                className="flex-1 ml-2 text-sm h-10"
                style={{ fontFamily: 'Poppins-Medium' }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="gap-3">
              {teachers
                .filter(t => t.fullName.toLowerCase().includes(teacherSearch.toLowerCase()))
                .map((teacher) => {
                  const isSelected = form.homeRoomId === teacher.teacherId;
                  return (
                    <Pressable
                      key={teacher.teacherId}
                      onPress={() => setForm(prev => ({ ...prev, homeRoomId: teacher.teacherId }))}
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
                      <View style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: 14, 
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#F0F7FF',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: 14
                      }}>
                        <Ionicons name="person" size={20} color={isSelected ? "white" : "#2563EB"} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ 
                          fontFamily: "Poppins-Bold", 
                          fontSize: 14, 
                          color: isSelected ? "white" : "#111827" 
                        }}>
                          {teacher.fullName}
                        </Text>
                        <Text style={{ 
                          fontFamily: "Poppins-Medium", 
                          fontSize: 10, 
                          color: isSelected ? "rgba(255,255,255,0.7)" : "#6B7280" 
                        }}>
                          {teacher.subjectNames && teacher.subjectNames.length > 0 ? teacher.subjectNames.join(" • ") : "Giáo viên"}
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color="white" />}
                    </Pressable>
                  );
                })}
              
              {teachers.filter(t => t.fullName.toLowerCase().includes(teacherSearch.toLowerCase())).length === 0 && (
                <View className="items-center py-8">
                   <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs">Không tìm thấy giáo viên nào</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AdminPageWrapper>
  );
}
