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
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { studentService } from "../../../services/student.service";
import { StudentResponse } from "../../../types/student";
import { getErrorMessage } from "../../../utils/error";

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    phone: "",
    birthday: "",
  });

  useEffect(() => {
    if (id) fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const data = await studentService.getStudentById(id);
      setStudent(data);
      setForm({
        fullName: data.fullName || "",
        email: data.email || "",
        address: data.address || "",
        phone: data.phoneNumber || "",
        birthday: data.birthday ? data.birthday.split("T")[0] : "",
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin học sinh.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.fullName || !form.email) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên và email.");
      return;
    }

    setSaving(true);
    try {
      await studentService.updateStudent(id, form);
      Alert.alert("Thành công", "Cập nhật thông tin học sinh thành công!");
      setIsEditing(false);
      fetchStudent();
    } catch (error: any) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, value, editable, onChangeText, icon }: any) => (
    <View className="mb-4">
      <Text
        style={{ fontFamily: "Poppins-Medium" }}
        className="text-gray-500 text-xs mb-1.5"
      >
        {label}
      </Text>
      <View
        className={`flex-row items-center border rounded-xl px-3 gap-2 ${editable ? "bg-white border-gray-200" : "bg-gray-50 border-transparent"}`}
      >
        <Ionicons name={icon} size={16} color="#9CA3AF" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          className="flex-1 py-3 text-black text-sm"
          style={{ fontFamily: "Poppins-Regular" }}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-lg flex-1"
        >
          Hồ sơ học sinh
        </Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-bright-blue"
            >
              Sửa
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1 px-6 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-2">
            <Text
              style={{
                fontFamily: "Poppins-Bold",
                color: "#136ADA",
                fontSize: 30,
              }}
            >
              {student?.fullName?.charAt(0)}
            </Text>
          </View>
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-black text-lg"
          >
            {student?.fullName}
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-500"
          >
            Khối {student?.classYearSub?.[0]?.grade} •{" "}
            {student?.classYearSub?.[0]?.className}
          </Text>
          <View className="bg-gray-100 px-3 py-1 rounded-full mt-2">
            <Text
              style={{ fontFamily: "Poppins-Regular", fontSize: 12 }}
              className="text-gray-600"
            >
              Năm học: {student?.classYearSub?.[0]?.schoolYear}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-sm mb-6 border border-gray-100">
          <View className="flex-row justify-between items-center mb-4">
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-black text-base"
            >
              Thông tin cá nhân
            </Text>
          </View>

          <Field
            label="Họ và tên"
            value={form.fullName}
            editable={isEditing}
            onChangeText={(v: string) =>
              setForm((f) => ({ ...f, fullName: v }))
            }
            icon="person-outline"
          />
          <Field
            label="Email"
            value={form.email}
            editable={isEditing}
            onChangeText={(v: string) => setForm((f) => ({ ...f, email: v }))}
            icon="mail-outline"
          />
          <Field
            label="Ngày sinh"
            value={form.birthday}
            editable={isEditing}
            onChangeText={(v: string) =>
              setForm((f) => ({ ...f, birthday: v }))
            }
            icon="calendar-outline"
          />
          <Field
            label="Số điện thoại"
            value={form.phone}
            editable={isEditing}
            onChangeText={(v: string) => setForm((f) => ({ ...f, phone: v }))}
            icon="call-outline"
          />
          <Field
            label="Địa chỉ"
            value={form.address}
            editable={isEditing}
            onChangeText={(v: string) => setForm((f) => ({ ...f, address: v }))}
            icon="location-outline"
          />

          {isEditing && (
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 items-center"
                onPress={() => {
                  setIsEditing(false);
                  fetchStudent();
                }}
                disabled={saving}
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-500"
                >
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-bright-blue rounded-2xl py-3 items-center"
                onPress={handleUpdate}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-white"
                  >
                    Lưu
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
