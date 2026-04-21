import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { classYearService } from "../../../services/classYear.service";
import { feeService } from "../../../services/fee.service";
import { SCHOOL_YEAR, TERM } from "../../../constants/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, Modal } from "react-native";
import { FormActionButton } from "../../../components/ui/FormActionButton";

export default function AdminCreateFeeScreen() {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Form
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [classYearId, setClassYearId] = useState("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const res = await classYearService.getClassYears({ schoolYear: SCHOOL_YEAR, pageSize: 100 });
      setClasses(res || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách lớp học");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tên khoản phí");
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) return Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
    if (!classYearId) return Alert.alert("Lỗi", "Vui lòng chọn lớp học");

    try {
      setLoading(true);
      await feeService.createFee({
        title: title.trim(),
        amount: Number(amount),
        dueDate: dueDate.toISOString(),
        classYearId,
        schoolYear: parseInt(SCHOOL_YEAR, 10)
      });
      Alert.alert("Thành công", "Đã tạo khoản phí mới", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể tạo khoản phí");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <AdminPageWrapper title="Tạo khoản phí mới" showLogo={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Basic Info */}
        <View className="mb-6">
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-lg mb-4">Thông tin chung</Text>
          
          <View className="mb-4">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-wide ml-1">Tên khoản phí</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="VD: Học phí học kì 1"
                className="flex-1 ml-3 text-base text-gray-800"
                style={{ fontFamily: "Poppins-Medium" }}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-wide ml-1">Số tiền (VNĐ)</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <Ionicons name="cash-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="VD: 500000"
                keyboardType="numeric"
                className="flex-1 ml-3 text-base text-gray-800"
                style={{ fontFamily: "Poppins-Medium" }}
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-wide ml-1">Hạn nộp</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100"
            >
              <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="flex-1 ml-3 text-base text-gray-800">
                {dueDate.toLocaleDateString("vi-VN")}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* DatePicker Modal for iOS to avoid layout issues */}
          {Platform.OS === 'ios' ? (
            <Modal transparent visible={showDatePicker} animationType="slide">
              <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl p-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg">Chọn ngày hết hạn</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={{ fontFamily: "Poppins-Bold", color: "#136ADA" }}>Xong</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="items-center">
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      minimumDate={new Date()}
                      locale="vi-VN"
                      style={{ width: '100%', backgroundColor: 'white' }}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )
          )}
        </View>

        {/* Target Audience */}
        <View className="mb-8">
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-lg mb-4">Áp dụng cho khối</Text>
          <View className="flex-row gap-3 mb-6">
            {[10, 11, 12].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => {
                  setSelectedGrade(g);
                  setClassYearId(""); // Reset class selection when grade changes
                }}
                className={`px-6 py-2.5 rounded-xl border ${
                  selectedGrade === g 
                    ? "bg-blue-600 border-blue-600" 
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <Text 
                  style={{ fontFamily: "Poppins-Bold", fontSize: 13 }} 
                  className={selectedGrade === g ? "text-white" : "text-gray-600"}
                >
                  KHỐI {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedGrade && (
            <>
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-lg mb-4">Chọn lớp</Text>
              {loadingClasses ? (
                <ActivityIndicator size="small" color="#136ADA" />
              ) : (
                <View className="flex-row flex-wrap gap-3">
                  {classes
                    .filter((cls) => cls.grade === selectedGrade)
                    .map((cls) => (
                    <TouchableOpacity
                      key={cls.id || cls.classYearId}
                      onPress={() => setClassYearId(cls.id || cls.classYearId)}
                      className={`px-4 py-2.5 rounded-xl border ${
                        classYearId === (cls.id || cls.classYearId) 
                          ? "bg-blue-50 border-blue-400" 
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <Text 
                        style={{ fontFamily: "Poppins-Bold", fontSize: 13 }} 
                        className={classYearId === (cls.id || cls.classYearId) ? "text-blue-600" : "text-gray-600"}
                      >
                        LỚP {cls.className}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {classes.filter((cls) => cls.grade === selectedGrade).length === 0 && (
                     <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-sm italic">Không có lớp nào thuộc khối này</Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>

      </ScrollView>
      <FormActionButton
        title="Tạo khoản phí"
        onPress={handleCreate}
        loading={loading}
      />
    </AdminPageWrapper>
  );
}
