import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import { examScheduleService } from "../../services/examSchedule.service";
import { MyExamScheduleDetailResponse } from "../../types/examSchedule";
import { SCHOOL_YEAR, TERM } from "../../constants/config";
import { getErrorMessage } from "../../utils/error";

export default function ExamScheduleScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<MyExamScheduleDetailResponse[]>([]);

  // Filters
  const [type, setType] = useState("Giữa kì");
  const [term, setTerm] = useState(TERM);
  const [schoolYear, setSchoolYear] = useState(parseInt(SCHOOL_YEAR, 10));

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);
        const res = await examScheduleService.getMyExamSchedule({
          type,
          term,
          schoolYear,
        });
        setData(res);
      } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", getErrorMessage(error));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [type, term, schoolYear],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity className="p-2 -ml-2" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          className="text-black text-lg ml-2"
          style={{ fontFamily: "Poppins-Bold" }}
        >
          Lịch thi
        </Text>
      </View>

      {/* Filter Row */}
      <View className="px-6 py-4 flex-row gap-3 items-center">
        {/* Type Dropdown */}
        <TypeDropdown value={type} onChange={setType} />

        {/* Term Dropdown */}
        <TermDropdown value={term} onChange={setTerm} />
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#136ADA" size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 pt-2"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
              colors={["#136ADA"]}
            />
          }
        >
          {data.length === 0 ? (
            <View className="mt-20 items-center justify-center">
              <Ionicons name="calendar-outline" size={80} color="#E5E7EB" />
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-400 mt-4 text-center"
              >
                Không tìm thấy lịch thi cho{"\n"}
                {type} - Học kỳ {term}
              </Text>
            </View>
          ) : (
            data.map((item) => (
              <ExamCard key={item.examScheduleDetailId} data={item} />
            ))
          )}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TypeDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = ["Giữa kì", "Cuối kì"];

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-2 px-4 py-2 rounded-xl border bg-blue-50 border-blue-200"
      >
        <Text
          className="text-blue-800 text-sm"
          style={{ fontFamily: "Poppins-SemiBold" }}
        >
          {value}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#1e40af" />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          <View className="mt-36 mx-6 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => { onChange(opt); setOpen(false); }}
                className={`px-5 py-3.5 border-b border-gray-50 ${value === opt ? "bg-blue-50" : ""}`}
              >
                <Text
                  className={`text-sm ${value === opt ? "text-blue-700" : "text-gray-700"}`}
                  style={{ fontFamily: value === opt ? "Poppins-SemiBold" : "Poppins-Regular" }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function TermDropdown({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = [1, 2];

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50"
      >
        <Text
          className="text-gray-600 text-sm"
          style={{ fontFamily: "Poppins-Medium" }}
        >
          Học kỳ {value}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#6B7280" />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          <View className="mt-36 mx-6 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => { onChange(opt); setOpen(false); }}
                className={`px-5 py-3.5 border-b border-gray-50 ${value === opt ? "bg-blue-50" : ""}`}
              >
                <Text
                  className={`text-sm ${value === opt ? "text-blue-700" : "text-gray-700"}`}
                  style={{ fontFamily: value === opt ? "Poppins-SemiBold" : "Poppins-Regular" }}
                >
                  Học kỳ {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function ExamCard({ data }: { data: MyExamScheduleDetailResponse }) {
  return (
    <View className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-5 overflow-hidden flex-row">
      {/* Blue Accent Line */}
      <View className="w-2 bg-[#136ADA] h-full" />

      <View className="flex-1 p-5">
        {/* Header Row: Subject and SBD */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text
              className="text-black text-lg"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              {data.subjectName}
            </Text>
            <Text
              className="text-gray-400 text-xs"
              style={{ fontFamily: "Poppins-Medium" }}
            >
              Phòng: <Text className="text-gray-600">{data.roomName}</Text>
            </Text>
          </View>
          <View className="bg-blue-50 px-3 py-1.5 rounded-xl items-center border border-blue-100">
            <Text
              className="text-blue-400 text-[10px]"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              SBD
            </Text>
            <Text
              className="text-blue-700 text-sm"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              {data.identificationNumber || "---"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-gray-50 w-full my-3" />

        {/* Info Rows */}
        <View className="flex-row gap-6">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center">
              <Ionicons name="calendar-outline" size={14} color="#EF4444" />
            </View>
            <View>
              <Text
                className="text-gray-400 text-[9px] uppercase"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Ngày
              </Text>
              <Text
                className="text-black text-xs"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {data.date
                  ? new Date(data.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "---"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center">
              <Ionicons name="time-outline" size={14} color="#10B981" />
            </View>
            <View>
              <Text
                className="text-gray-400 text-[9px] uppercase"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Giờ thi
              </Text>
              <Text
                className="text-black text-xs"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {data.startTime?.substring(0, 5)} -{" "}
                {data.finishTime?.substring(0, 5)}
              </Text>
            </View>
          </View>
        </View>

        {/* Teacher Info */}
        <View className="flex-row items-center mt-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <Ionicons name="person-circle-outline" size={18} color="#9CA3AF" />
          <Text
            className="text-gray-500 text-[11px] ml-2"
            style={{ fontFamily: "Poppins-Medium" }}
          >
            Giám thị: <Text className="text-black">{data.teacherName}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
