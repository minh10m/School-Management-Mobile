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
  Pressable,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
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
import { FormActionButton } from "../../../components/ui/FormActionButton";
import { getErrorMessage } from "../../../utils/error";

const DAYS = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];

export default function AdminScheduleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [details, setDetails] = useState<ScheduleDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isDaySelectorOpen, setDaySelectorOpen] = useState(false);
  // For Adding Period
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachersBySubject, setTeachersBySubject] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedTeacherSubjectId, setSelectedTeacherSubjectId] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [finishTime, setFinishTime] = useState("08:45");

  // New Picker States
  const [showPicker, setShowPicker] = useState<'start' | 'finish' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const timeToDate = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const dateToTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirmPicker = () => {
    const timeStr = dateToTime(tempDate);
    if (showPicker === 'start') setStartTime(timeStr);
    else if (showPicker === 'finish') setFinishTime(timeStr);
    setShowPicker(null);
  };

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
      console.log(err);
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
      console.log(err);
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

  const filteredDetails = details.filter((d) => d.dayOfWeek === selectedDay);
  const BG_COLORS = ["bg-purple-50", "bg-cyan-50", "bg-blue-50", "bg-red-50", "bg-amber-50"];

  return (
    <AdminPageWrapper
      title="Lịch giảng dạy"
      rightComponent={
        <TouchableOpacity
          onPress={() => setAssignModal(true)}
          className="bg-blue-50 p-2 rounded-xl"
        >
          <Ionicons name="add" size={24} color="#136ADA" />
        </TouchableOpacity>
      }
      containerStyle={{ backgroundColor: "white" }}
    >
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <>
          {/* Day Selector - Dropdown Style matching Student UI */}
          <View className="px-6 py-4">
            <TouchableOpacity
              className="bg-white border border-gray-100 rounded-2xl p-4 flex-row justify-between items-center shadow-sm"
              onPress={() => setDaySelectorOpen(!isDaySelectorOpen)}
            >
              <Text
                className="text-black text-sm"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {DAYS[selectedDay - 1]}
              </Text>
              <Ionicons
                name={isDaySelectorOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="black"
              />
            </TouchableOpacity>

            {isDaySelectorOpen && (
              <View className="bg-white border border-gray-100 rounded-2xl p-2 mt-2 shadow-md z-50">
                {DAYS.map((day, idx) => (
                  <TouchableOpacity
                    key={day}
                    className={`p-3 rounded-xl ${
                      selectedDay === idx + 1 ? "bg-blue-50" : ""
                    }`}
                    onPress={() => {
                      setSelectedDay(idx + 1);
                      setDaySelectorOpen(false);
                    }}
                  >
                    <Text
                      className={`text-sm ${
                        selectedDay === idx + 1
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                      style={{
                        fontFamily:
                          selectedDay === idx + 1
                            ? "Poppins-Medium"
                            : "Poppins-Regular",
                      }}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <ScrollView
            className="flex-1 px-6 pt-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Header labels */}
            {filteredDetails.length > 0 && (
              <View className="flex-row mb-4 px-2">
                <Text
                  className="text-gray-400 text-[10px] w-20 text-center uppercase tracking-widest"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  Thời gian
                </Text>
                <Text
                  className="text-gray-400 text-[10px] flex-1 ml-4 uppercase tracking-widest"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  Tiết học
                </Text>
              </View>
            )}

            <View>
              {filteredDetails.length > 0 ? (
                <View className="pb-10">
                  {filteredDetails
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((item, index) => (
                      <View key={item.scheduleDetailId} className="flex-row mb-6">
                        {/* Column 1: Time */}
                        <View className="w-20 items-end pr-3 pt-1">
                          <Text
                            className="text-black text-sm"
                            style={{ fontFamily: "Poppins-Bold" }}
                          >
                            {item.startTime.substring(0, 5)}
                          </Text>
                          <Text
                            className="text-gray-400 text-[10px]"
                            style={{ fontFamily: "Poppins-Regular" }}
                          >
                            {item.finishTime.substring(0, 5)}
                          </Text>
                        </View>

                        {/* Column 2: Timeline Line & Dot */}
                        <View className="items-center relative mr-4">
                          <View className="h-full w-[2px] bg-blue-50 absolute top-0" />
                          <View className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm mt-1.5 z-10" />
                        </View>

                        {/* Column 3: Subject Card */}
                        <View className="flex-1">
                          <View
                            className={`${
                              BG_COLORS[index % BG_COLORS.length]
                            } rounded-3xl p-5 relative shadow-sm`}
                          >
                            <View className="flex-row items-center mb-1">
                              <View className="w-10 h-10 bg-white/60 rounded-full items-center justify-center mr-3">
                                <Ionicons
                                  name="book-outline"
                                  size={18}
                                  color="#4B5563"
                                />
                              </View>
                              <View className="flex-1">
                                <Text
                                  className="text-black text-[15px]"
                                  style={{ fontFamily: "Poppins-Bold" }}
                                >
                                  {item.subjectName}
                                </Text>
                                <Text
                                  className="text-gray-500 text-xs"
                                  style={{ fontFamily: "Poppins-Medium" }}
                                >
                                  {item.teacherName}
                                </Text>
                              </View>
                            </View>

                            <TouchableOpacity
                              onPress={() =>
                                handleDeletePeriod(item.scheduleDetailId)
                              }
                              className="absolute top-4 right-4"
                            >
                              <Ionicons
                                name="close-circle"
                                size={22}
                                color="#F43F5E"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                </View>
              ) : (
                <View className="items-center justify-center py-24">
                  <View className="bg-gray-50 p-8 rounded-full mb-4">
                    <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-gray-900 text-lg"
                  >
                    Trống lịch
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins-Regular" }}
                    className="text-gray-400 text-center px-12 mt-1"
                  >
                    Chưa có tiết học nào được sắp xếp cho ngày này.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAssignModal(true)}
                    className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl"
                  >
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-white text-sm"
                    >
                      Thêm ngay
                    </Text>
                  </TouchableOpacity>
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
                    <TouchableOpacity 
                      onPress={() => {
                        setTempDate(timeToDate(startTime));
                        setShowPicker('start');
                      }}
                      className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex-row items-center gap-3"
                    >
                      <Ionicons name="time-outline" size={18} color="#1D4ED8" />
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-[10px] text-gray-400 -mb-1">Bắt đầu</Text>
                        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-base">
                          {startTime}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-1">
                    <TouchableOpacity 
                      onPress={() => {
                        setTempDate(timeToDate(finishTime));
                        setShowPicker('finish');
                      }}
                      className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex-row items-center gap-3"
                    >
                      <Ionicons name="hourglass-outline" size={18} color="#7C3AED" />
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-[10px] text-gray-400 -mb-1">Kết thúc</Text>
                        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-base">
                          {finishTime}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          <FormActionButton
            title="Xác nhận Thêm"
            onPress={handleAddPeriod}
          />
        </SafeAreaView>

        {/* Time Picker Modal Wrapper */}
        <Modal
          visible={showPicker !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPicker(null)}
        >
          <Pressable 
            className="flex-1 bg-black/40 justify-end"
            onPress={() => setShowPicker(null)}
          >
            <View className="bg-white rounded-t-[40px] px-8 pb-10 shadow-2xl">
              <View className="flex-row justify-between items-center py-6 border-b border-gray-50 mb-4">
                <TouchableOpacity onPress={() => setShowPicker(null)}>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-base">Hủy</Text>
                </TouchableOpacity>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
                  Chọn giờ
                </Text>
                <TouchableOpacity onPress={handleConfirmPicker}>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600 text-base">Xong</Text>
                </TouchableOpacity>
              </View>

              <View className="items-center py-4">
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onPickerChange}
                  style={{ width: '100%', height: 200 }}
                  textColor="black"
                />
              </View>
            </View>
          </Pressable>
        </Modal>
      </Modal>
    </>
  )}
</AdminPageWrapper>
  );
}
