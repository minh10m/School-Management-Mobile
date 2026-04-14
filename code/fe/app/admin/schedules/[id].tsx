import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect } from "react";
import { scheduleService } from "../../../services/schedule.service";
import { subjectService } from "../../../services/subject.service";
import { teacherService } from "../../../services/teacher.service";
import { ScheduleDetailItem } from "../../../types/schedule";
import { SubjectResponse } from "../../../types/subject";
import { TeacherListItem } from "../../../types/teacher";
import { getErrorMessage } from "../../../utils/error";

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7"];

export default function AdminScheduleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [details, setDetails] = useState<ScheduleDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  // For Adding Period
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachersBySubject, setTeachersBySubject] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedTeacherSubjectId, setSelectedTeacherSubjectId] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [finishTime, setFinishTime] = useState("08:45");

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [res, subjectsRes] = await Promise.all([
        scheduleService.getScheduleDetails(id),
        subjectService.getSubjects(),
      ]);
      setDetails(Array.isArray(res) ? res : []);
      setSubjects(Array.isArray(subjectsRes) ? subjectsRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const loadTeachersForSubject = async (subId: string) => {
    setSelectedSubjectId(subId);
    setSelectedTeacherId("");
    setSelectedTeacherSubjectId(""); // Reset both teacher selections
    try {
      const res = await subjectService.getTeachersBySubject(subId);
      setTeachersBySubject(Array.isArray(res) ? res : (res as any).items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPeriod = async () => {
    if (!id || !selectedTeacherSubjectId) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn môn học và giáo viên.");
      return;
    }
    try {
      await scheduleService.createScheduleDetail(id, {
        teacherSubjectId: selectedTeacherSubjectId,
        dayOfWeek: selectedDay,
        startTime: `${startTime}:00`,
        finishTime: `${finishTime}:00`,
      });
      Alert.alert("Thành công", "Đã thêm tiết học!");
      setAssignModal(false);
      setSelectedSubjectId("");
      setSelectedTeacherId("");
      setSelectedTeacherSubjectId("");
      fetchDetails();
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err));
    }
  };

  const handleDeletePeriod = (detailId: string) => {
    Alert.alert("Xóa", "Xóa tiết học này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await scheduleService.deleteScheduleDetail(detailId);
            fetchDetails();
          } catch (err: any) {
            Alert.alert("Error", getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </SafeAreaView>
    );

  const filteredDetails = details.filter((d) => d.dayOfWeek === selectedDay);

  return (
    <AdminPageWrapper
      title="Quản lý Tiết học"
      rightComponent={
        <TouchableOpacity onPress={() => setAssignModal(true)}>
          <Ionicons name="add-circle" size={26} color="#136ADA" />
        </TouchableOpacity>
      }
    >

      {/* Day Selector */}
      <View className="bg-white border-b border-gray-100 py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 flex-row gap-4"
        >
          {DAYS.map((day, idx) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(idx + 1)}
              className={`px-6 py-2 rounded-2xl border ${selectedDay === idx + 1 ? "bg-amber-500 border-amber-500" : "bg-gray-50 border-gray-100"}`}
            >
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  color: selectedDay === idx + 1 ? "white" : "#6B7280",
                }}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Period List */}
        <View className="gap-4 pb-20">
          {filteredDetails
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((item) => (
              <View
                key={item.scheduleDetailId}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 10,
                          color: "#136ADA",
                        }}
                      >
                        {item.startTime.substring(0, 5)} -{" "}
                        {item.finishTime.substring(0, 5)}
                      </Text>
                    </View>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-black text-base"
                    >
                      {item.subjectName}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                    <Text
                      style={{ fontFamily: "Poppins-Regular" }}
                      className="text-gray-400 text-xs"
                    >
                      Giáo viên: {item.teacherName}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeletePeriod(item.scheduleDetailId)}
                >
                  <Ionicons name="trash-outline" size={20} color="#F43F5E" />
                </TouchableOpacity>
              </View>
            ))}

          {filteredDetails.length === 0 && (
            <View className="items-center py-20">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-2"
              >
                Chưa có tiết học nào trong ngày này
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Period Modal */}
      <Modal
        visible={assignModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-5 border-b border-gray-50">
            <TouchableOpacity 
              onPress={() => setAssignModal(false)}
              className="py-1"
            >
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 text-sm"
              >
                Hủy
              </Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-xl">
              Thêm Tiết học mới
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
          >
            <View className="gap-8">
              {/* Step 1: Subject */}
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-[10px] mb-3 ml-1 uppercase tracking-widest"
                >
                  1. Chọn Môn học
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
                >
                  {subjects.map((s) => (
                    <TouchableOpacity
                      key={s.subjectId}
                      onPress={() => loadTeachersForSubject(s.subjectId)}
                      className={`px-6 py-3.5 rounded-2xl border ${
                        selectedSubjectId === s.subjectId
                          ? "bg-bright-blue border-bright-blue shadow-lg shadow-blue-200"
                          : "bg-white border-gray-100 shadow-sm"
                      }`}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 12,
                          color:
                            selectedSubjectId === s.subjectId
                              ? "white"
                              : "#6B7280",
                        }}
                      >
                        {s.subjectName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Step 2: Teacher */}
              {selectedSubjectId !== "" && (
                <View>
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-gray-400 text-[10px] mb-3 ml-1 uppercase tracking-widest"
                  >
                    2. Chọn Giáo viên
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {teachersBySubject.map((t) => (
                      <TouchableOpacity
                        key={t.teacherId}
                        onPress={() => {
                          setSelectedTeacherId(t.teacherId);
                          setSelectedTeacherSubjectId(t.teacherSubjectId);
                        }}
                        className={`px-5 py-3 rounded-2xl border ${
                          selectedTeacherId === t.teacherId
                            ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200"
                            : "bg-white border-gray-100 shadow-sm"
                        }`}
                      >
                        <Text
                          style={{
                            fontFamily: "Poppins-Bold",
                            fontSize: 12,
                            color:
                              selectedTeacherId === t.teacherId
                                ? "white"
                                : "#6B7280",
                          }}
                        >
                          {t.fullName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 3: Time */}
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-[10px] mb-3 ml-1 uppercase tracking-widest"
                >
                  3. Thiết lập Thời gian
                </Text>
                <View className="flex-row gap-5">
                  <View className="flex-1">
                    <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex-row items-center gap-3">
                      <Ionicons name="time-outline" size={18} color="#9CA3AF" />
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-[10px] text-gray-400 -mb-1">Bắt đầu</Text>
                        <TextInput
                          placeholder="08:00"
                          value={startTime}
                          onChangeText={setStartTime}
                          className="text-black text-base"
                          style={{ fontFamily: "Poppins-Bold" }}
                        />
                      </View>
                    </View>
                  </View>
                  <View className="flex-1">
                    <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex-row items-center gap-3">
                      <Ionicons name="hourglass-outline" size={18} color="#9CA3AF" />
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-[10px] text-gray-400 -mb-1">Kết thúc</Text>
                        <TextInput
                          placeholder="08:45"
                          value={finishTime}
                          onChangeText={setFinishTime}
                          className="text-black text-base"
                          style={{ fontFamily: "Poppins-Bold" }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className="bg-bright-blue rounded-[24px] py-5 items-center mt-6 shadow-xl shadow-blue-200"
                onPress={handleAddPeriod}
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-white text-lg"
                >
                  Xác nhận Thêm
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </AdminPageWrapper>
  );
}
