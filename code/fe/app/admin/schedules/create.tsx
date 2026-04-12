import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { scheduleService } from "../../../services/schedule.service";
import { classYearService } from "../../../services/classYear.service";
import { ClassYearResponse } from "../../../types/classYear";
import { getErrorMessage } from "../../../utils/error";

export default function AdminCreateScheduleScreen() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [fetching, setFetching] = useState(true);

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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-xl ml-2"
        >
          Khởi tạo TKB
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 100,
        }}
      >
        <View className="gap-8">
          {/* Hero Icon */}
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-blue-50/50 items-center justify-center rounded-[32px]">
              <View className="w-16 h-16 bg-white shadow-sm items-center justify-center rounded-[24px]">
                <Ionicons name="calendar" size={36} color="#136ADA" />
              </View>
            </View>
          </View>

          {/* Schedule Name */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-xs mb-2 ml-1 uppercase tracking-widest"
            >
              Tên Thời khóa biểu (Tùy chọn)
            </Text>
            <TextInput
              placeholder="VD: TKB Học kỳ 1 - 10A1"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              className="bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-black text-base"
              style={{ fontFamily: "Poppins-Regular" }}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Class Selection */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-xs mb-3 ml-1 uppercase tracking-widest"
            >
              Chọn Lớp học *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            >
              {classes.map((c) => (
                <TouchableOpacity
                  key={c.classYearId}
                  onPress={() =>
                    setForm({ ...form, classYearId: c.classYearId })
                  }
                  className={`px-6 py-3.5 rounded-2xl border ${
                    form.classYearId === c.classYearId
                      ? "bg-bright-blue border-bright-blue shadow-lg shadow-blue-200"
                      : "bg-white border-gray-100 shadow-sm"
                  }`}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Bold",
                      color:
                        form.classYearId === c.classYearId
                          ? "white"
                          : "#6B7280",
                    }}
                  >
                    {c.className}
                  </Text>
                </TouchableOpacity>
              ))}
              {classes.length === 0 && (
                <Text className="text-gray-400 text-xs italic">
                  Không tìm thấy lớp học
                </Text>
              )}
            </ScrollView>
          </View>

          {/* Term & Year */}
          <View className="flex-row gap-5">
            <View className="flex-1">
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 text-xs mb-2 ml-1 uppercase tracking-widest"
              >
                Học kỳ *
              </Text>
              <View className="flex-row gap-3">
                {["1", "2"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setForm({ ...form, term: t })}
                    className={`flex-1 py-4 rounded-2xl border items-center shadow-sm ${
                      form.term === t
                        ? "bg-bright-blue border-bright-blue"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins-Bold",
                        color: form.term === t ? "white" : "#6B7280",
                      }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-1">
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 text-xs mb-2 ml-1 uppercase tracking-widest"
              >
                Năm học *
              </Text>
              <TextInput
                placeholder="2026"
                keyboardType="numeric"
                value={form.schoolYear}
                onChangeText={(t) => setForm({ ...form, schoolYear: t })}
                className="bg-white border border-gray-100 rounded-2xl px-4 py-4 text-black text-base text-center shadow-sm"
                style={{ fontFamily: "Poppins-Bold" }}
              />
            </View>
          </View>

          {/* Active Switch */}
          <View className="bg-gray-50/50 p-5 rounded-[32px] border border-gray-100 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                <Ionicons name="flash" size={20} color="#136ADA" />
              </View>
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-black text-base"
                >
                  Kích hoạt ngay
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Regular" }}
                  className="text-gray-400 text-[10px]"
                >
                  Đặt làm thời khóa biểu chính
                </Text>
              </View>
            </View>
            <Switch
              value={form.isActive}
              onValueChange={(v) => setForm({ ...form, isActive: v })}
              trackColor={{ false: "#E5E7EB", true: "#136ADA" }}
              thumbColor="white"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-bright-blue rounded-[24px] py-5 items-center mt-4 shadow-xl shadow-blue-200"
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
                Khởi tạo Thời khóa biểu
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
