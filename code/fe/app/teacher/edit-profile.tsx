import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { teacherService } from "../../services/teacher.service";
import { useAuthStore } from "../../store/authStore";
import { TeacherResponse } from "../../types/teacher";
import { getErrorMessage } from "../../utils/error";

export default function TeacherProfileScreen() {
  const { clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<TeacherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthday: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getMe();
      setProfile(data);
    } catch (error) {
      console.error("Error loading teacher profile:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin cá nhân.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    if (!profile) return;
    setEditForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
      address: profile.address || "",
      birthday: profile.birthday ? profile.birthday.split("T")[0] : "",
    });
    setEditVisible(true);
  };

  const handleSave = async () => {
    if (!editForm.fullName || !editForm.email) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Họ tên và Email.");
      return;
    }
    
    try {
      setSaving(true);
      const updated = await teacherService.updateMe({
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        birthday: editForm.birthday || undefined,
      });
      setProfile(updated);
      setEditVisible(false);
      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>
          Hồ sơ Giáo viên
        </Text>
        <TouchableOpacity className="p-2" onPress={openEdit}>
          <Ionicons name="pencil-outline" size={22} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View className="bg-white items-center py-10 border-b border-gray-50">
            <View className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center mb-4 border-4 border-white shadow-sm">
              <Text style={{ fontFamily: "Poppins-Bold", fontSize: 36, color: "#136ADA" }}>
                {profile?.fullName?.charAt(0) || "T"}
              </Text>
            </View>
            <Text className="text-black text-xl mb-1" style={{ fontFamily: "Poppins-Bold" }}>
              {profile?.fullName || "Giáo viên"}
            </Text>
            <View className="bg-indigo-100 px-4 py-1 rounded-full mt-2">
              <Text className="text-indigo-700 text-[10px] uppercase" style={{ fontFamily: "Poppins-Bold" }}>
                GIÁO VIÊN {profile?.subjectNames?.length ? `• ${profile.subjectNames.join(', ')}` : ''}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View className="p-6 gap-6">
            <InfoField label="Email" value={profile?.email ?? "—"} icon="mail-outline" />
            <InfoField label="Số điện thoại" value={profile?.phoneNumber ?? "—"} icon="call-outline" />
            <InfoField label="Địa chỉ" value={profile?.address ?? "—"} icon="location-outline" />
            <InfoField 
              label="Ngày sinh" 
              value={profile?.birthday ? new Date(profile.birthday).toLocaleDateString("en-GB") : "—"} 
              icon="calendar-outline" 
            />
          </View>


        </ScrollView>
      )}

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Text className="text-gray-500 text-base" style={{ fontFamily: "Poppins-Regular" }}>
                Hủy
              </Text>
            </TouchableOpacity>
            <Text className="text-black text-base" style={{ fontFamily: "Poppins-Bold" }}>
              Chỉnh sửa thông tin
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#136ADA" />
              ) : (
                <Text className="text-blue-600 text-base" style={{ fontFamily: "Poppins-SemiBold" }}>
                  Lưu
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
            {/* Note Banner */}
            <View className="bg-blue-50 rounded-xl px-4 py-3 mb-5 flex-row gap-2">
              <Ionicons name="information-circle-outline" size={18} color="#136ADA" />
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-bright-blue text-xs flex-1">
                Bạn chỉ có thể thay đổi Họ tên, Email, SĐT, Địa chỉ và Ngày sinh. Các môn học do Admin quản lý.
              </Text>
            </View>

            <View className="gap-5">
              <EditInput label="Họ và tên" value={editForm.fullName} onChangeText={(v: string) => setEditForm({ ...editForm, fullName: v })} />
              <EditInput label="Email" value={editForm.email} onChangeText={(v: string) => setEditForm({ ...editForm, email: v })} keyboardType="email-address" />
              <EditInput label="Số điện thoại" value={editForm.phoneNumber} onChangeText={(v: string) => setEditForm({ ...editForm, phoneNumber: v })} keyboardType="phone-pad" />
              <EditInput label="Địa chỉ" value={editForm.address} onChangeText={(v: string) => setEditForm({ ...editForm, address: v })} />
              <EditInput label="Ngày sinh (Năm-Tháng-Ngày)" value={editForm.birthday} onChangeText={(v: string) => setEditForm({ ...editForm, birthday: v })} placeholder="1990-01-01" />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function InfoField({ label, value, icon }: any) {
  return (
    <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-white">
      <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4">
         <Ionicons name={icon} size={20} color="#6366F1" />
      </View>
      <View className="flex-1">
         <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px] uppercase tracking-wider">{label}</Text>
         <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm">{value}</Text>
      </View>
    </View>
  );
}

function EditInput({ label, value, onChangeText, ...props }: { label: string; value: string; onChangeText: (v: string) => void; [key: string]: any }) {
  return (
    <View className="gap-1">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs ml-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-black text-sm"
        style={{ fontFamily: 'Poppins-Regular' }}
        {...props}
      />
    </View>
  );
}
