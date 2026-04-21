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
import { useRouter, useLocalSearchParams } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect } from "react";
import { studentService } from "../../../services/student.service";
import { StudentResponse } from "../../../types/student";
import { FormActionButton } from "../../../components/ui/FormActionButton";
import { getErrorMessage } from "../../../utils/error";

export default function AdminStudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    birthday: "",
  });

  const fetchStudent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await studentService.getStudentById(id);
      setStudent(res);
      setForm({
        fullName: res.fullName || "",
        email: res.email || "",
        phone: res.phoneNumber || "",
        address: res.address || "",
        birthday: res.birthday ? res.birthday.split("T")[0] : "",
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể tải thông tin học sinh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const updated = await studentService.updateStudent(id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        birthday: form.birthday
          ? new Date(form.birthday).toISOString()
          : undefined,
      });
      setStudent(updated);
      setIsEditing(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin học sinh thành công!");
    } catch (err: any) {
      Alert.alert("Lỗi", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </SafeAreaView>
    );

  if (!student)
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text
          style={{ fontFamily: "Poppins-Medium" }}
          className="text-gray-400"
        >
          Không tìm thấy học sinh
        </Text>
      </SafeAreaView>
    );

  const InfoRow = ({ label, value, icon }: any) => (
    <View className="flex-row items-center p-4 border-b border-gray-50 bg-white">
      <View className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#9CA3AF" />
      </View>
      <View className="flex-1">
        <Text
          style={{ fontFamily: "Poppins-Regular" }}
          className="text-gray-400 text-[10px] uppercase tracking-wider"
        >
          {label}
        </Text>
        <Text
          style={{ fontFamily: "Poppins-Medium" }}
          className="text-black text-sm"
        >
          {value || "Chưa cập nhật"}
        </Text>
      </View>
    </View>
  );

  const EditField = ({
    label,
    value,
    onChangeText,
    keyboardType = "default",
  }: any) => (
    <View className="mb-4">
      <Text
        style={{ fontFamily: "Poppins-Medium" }}
        className="text-gray-500 text-xs mb-1 ml-1"
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType as any}
        className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-black text-sm"
        style={{ fontFamily: "Poppins-Regular" }}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  return (
    <AdminPageWrapper
      title="Chi tiết Học sinh"
      rightComponent={
        <TouchableOpacity 
          onPress={() => setIsEditing(!isEditing)}
          className={`w-10 h-10 rounded-full items-center justify-center ${isEditing ? "bg-gray-100" : "bg-blue-50 border border-blue-100"}`}
        >
          <Ionicons 
            name={isEditing ? "close-outline" : "create-outline"} 
            size={20} 
            color={isEditing ? "#6B7280" : "#136ADA"} 
          />
        </TouchableOpacity>
      }
    >

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white items-center py-8 border-b border-gray-100">
          <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4 border-4 border-white shadow-sm">
            <Text
              style={{
                fontFamily: "Poppins-Bold",
                color: "#136ADA",
                fontSize: 36,
              }}
            >
              {student.fullName.charAt(0)}
            </Text>
          </View>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-black text-xl"
          >
            {student.fullName}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className="bg-teal-50 px-3 py-1 rounded-full">
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: 10,
                  color: "#0D9488",
                }}
              >
                Lớp {student.classYearSub?.[0]?.className}
              </Text>
            </View>
            <Text
              style={{ fontFamily: "Poppins-Regular" }}
              className="text-gray-400 text-xs"
            >
              Khối {student.classYearSub?.[0]?.grade}
            </Text>
          </View>
        </View>

        {isEditing ? (
          <View className="p-6">
            <EditField
              label="Họ và tên"
              value={form.fullName}
              onChangeText={(t: string) => setForm({ ...form, fullName: t })}
            />
            <EditField
              label="Email"
              value={form.email}
              onChangeText={(t: string) => setForm({ ...form, email: t })}
              keyboardType="email-address"
            />
            <EditField
              label="Số điện thoại"
              value={form.phone}
              onChangeText={(t: string) => setForm({ ...form, phone: t })}
              keyboardType="phone-pad"
            />
            <EditField
              label="Địa chỉ"
              value={form.address}
              onChangeText={(t: string) => setForm({ ...form, address: t })}
            />
            <EditField
              label="Ngày sinh (YYYY-MM-DD)"
              value={form.birthday}
              onChangeText={(t: string) => setForm({ ...form, birthday: t })}
              placeholder="2005-10-10"
            />
          </View>
        ) : (
          <View className="py-6">
            <InfoRow label="Họ và tên" value={student.fullName} icon="person-outline" />
            <InfoRow label="Email" value={student.email} icon="mail-outline" />
            <InfoRow label="Số điện thoại" value={student.phoneNumber} icon="call-outline" />
            <InfoRow label="Địa chỉ" value={student.address} icon="location-outline" />
            <InfoRow
              label="Ngày sinh"
              value={student.birthday ? student.birthday.split("T")[0] : ""}
              icon="calendar-outline"
            />
          </View>
        )}
        </ScrollView>
        {isEditing && (
          <FormActionButton
            title="Lưu thay đổi"
            onPress={handleUpdate}
            loading={saving}
          />
        )}
      </AdminPageWrapper>
    );
}
