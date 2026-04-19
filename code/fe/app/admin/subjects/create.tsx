import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState } from "react";
import { subjectService } from "../../../services/subject.service";
import { getErrorMessage } from "../../../utils/error";

export default function AdminCreateSubjectScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subjectName: "",
    maxPeriod: 0,
  });

  const handleSubmit = async () => {
    if (!form.subjectName || form.maxPeriod <= 0) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập Tên môn học và Số tiết/tuần hợp lệ (>0).",
      );
      return;
    }

    try {
      setLoading(true);
      await subjectService.createSubject(form);
      Alert.alert("Thành công", "Đã tạo môn học thành công!", [
        { text: "Đồng ý", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageWrapper
      title="Thêm Môn học"
      leftComponent={
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontFamily: "Poppins-Regular", color: '#6B7280', fontSize: 16 }}>
            Hủy
          </Text>
        </TouchableOpacity>
      }
    >

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 100 }}
      >
        <View className="gap-8">
          {/* Hero Icon */}
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-blue-50/50 items-center justify-center rounded-[32px]">
              <View className="w-16 h-16 bg-white shadow-sm items-center justify-center rounded-[24px]">
                <Ionicons name="book" size={36} color="#136ADA" />
              </View>
            </View>
          </View>

          {/* Subject Name */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-2 ml-1 uppercase tracking-widest"
            >
              Tên Môn học *
            </Text>
            <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-1 flex-row items-center gap-3">
              <Ionicons name="at-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="VD: Toán học"
                value={form.subjectName}
                onChangeText={(t) => setForm({ ...form, subjectName: t })}
                className="flex-1 py-4 text-black text-base"
                style={{ fontFamily: "Poppins-Regular" }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Max Periods */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-2 ml-1 uppercase tracking-widest"
            >
              Số tiết/tuần *
            </Text>
            <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-1 flex-row items-center gap-3">
              <Ionicons name="time-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="VD: 5"
                value={form.maxPeriod.toString()}
                onChangeText={(t) =>
                  setForm({ ...form, maxPeriod: parseInt(t) || 0 })
                }
                keyboardType="numeric"
                className="flex-1 py-4 text-black text-base"
                style={{ fontFamily: "Poppins-Regular" }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <Text
              style={{ fontFamily: "Poppins-Regular" }}
              className="text-gray-400 text-[10px] mt-2 ml-1 leading-4"
            >
              Tổng số tiết học của môn này trong thời khóa biểu hàng tuần 
              của học sinh.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-bright-blue rounded-[24px] py-5 items-center mt-10 shadow-xl shadow-blue-200"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-white text-lg"
              >
                Đăng ký Môn học
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AdminPageWrapper>
  );
}
