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
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { classYearService } from "../../../services/classYear.service";
import { teacherService } from "../../../services/teacher.service";
import { TeacherListItem } from "../../../types/teacher";
import { SCHOOL_YEAR } from "../../../constants/config";

export default function AdminCreateClassScreen() {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    className: "",
    grade: 10,
    schoolYear: SCHOOL_YEAR,
    homeRoomId: "",
  });

  const fetchTeachers = async () => {
    try {
      setFetching(true);
      const res = await teacherService.getTeachers({ pageSize: 100 });
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
    if (!form.className || !form.schoolYear || !form.homeRoomId) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await classYearService.createClassYear(form);
      Alert.alert("Success", "Class created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Creation failed.");
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
          New Class
        </Text>
      </View>

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
                <Ionicons name="school" size={36} color="#136ADA" />
              </View>
            </View>
          </View>

          {/* Class Name */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-2 ml-1 uppercase tracking-widest"
            >
              Class Name *
            </Text>
            <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-1 flex-row items-center gap-3">
              <Ionicons name="at-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="e.g. 10A1"
                value={form.className}
                onChangeText={(t) => setForm({ ...form, className: t })}
                className="flex-1 py-4 text-black text-base"
                style={{ fontFamily: "Poppins-Regular" }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Grade Selection */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-3 ml-1 uppercase tracking-widest"
            >
              Select Grade *
            </Text>
            <View className="flex-row gap-3">
              {[10, 11, 12].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setForm({ ...form, grade: g })}
                  className={`flex-1 py-4 rounded-2xl border items-center shadow-sm ${
                    form.grade === g
                      ? "bg-bright-blue border-bright-blue"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Bold",
                      color: form.grade === g ? "white" : "#6B7280",
                    }}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* School Year */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-2 ml-1 uppercase tracking-widest"
            >
              School Year *
            </Text>
            <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-1 flex-row items-center gap-3">
              <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder={`e.g. ${SCHOOL_YEAR}`}
                value={form.schoolYear}
                onChangeText={(t) => setForm({ ...form, schoolYear: t })}
                className="flex-1 py-4 text-black text-base"
                style={{ fontFamily: "Poppins-Regular" }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Advisor Teacher Select */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-3 ml-1 uppercase tracking-widest"
            >
              Advisor Teacher *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {teachers.map((t) => (
                <TouchableOpacity
                  key={t.teacherId}
                  onPress={() => setForm({ ...form, homeRoomId: t.teacherId })}
                  className={`px-4 py-2 rounded-xl border items-center shadow-sm ${
                    form.homeRoomId === t.teacherId
                      ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 11,
                      color: form.homeRoomId === t.teacherId ? "white" : "#6B7280",
                    }}
                  >
                    {t.fullName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {teachers.length === 0 && (
              <Text className="text-gray-400 text-xs italic">
                No teachers found
              </Text>
            )}
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
                Create Class
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
