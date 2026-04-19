import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
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
import { userService } from "../../services/user.service";
import { useAuthStore } from "../../store/authStore";
import { UserResponse } from "../../types/user";

export default function AdminProfileScreen() {
  const router = useRouter();
  const { userInfo } = useAuthStore();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);
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
      const data = await userService.getMe();
      setProfile(data);
    } catch (error) {
      console.error("Error loading admin profile:", error);
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
    try {
      setSaving(true);
      const updated = await userService.updateMe({
        email: editForm.email,
        phone: editForm.phoneNumber,
        fullName: editForm.fullName,
        address: editForm.address,
        birthday: editForm.birthday
          ? new Date(editForm.birthday).toISOString()
          : undefined,
      });
      setProfile(updated);
      setEditVisible(false);
      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Cập nhật thất bại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageWrapper
      title="Hồ sơ Quản trị viên"
      rightComponent={
        <TouchableOpacity onPress={openEdit}>
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-bright-blue text-sm"
          >
            Sửa
          </Text>
        </TouchableOpacity>
      }
    >

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View className="bg-white items-center py-10 border-b border-gray-50">
            <View className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center mb-4 border-4 border-white shadow-sm">
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 36,
                  color: "#136ADA",
                }}
              >
                {profile?.fullName?.charAt(0) || "A"}
              </Text>
            </View>
            <Text
              className="text-black text-xl mb-1"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              {profile?.fullName || "Quản trị viên"}
            </Text>
            <View className="bg-indigo-100 px-4 py-1 rounded-full">
              <Text
                className="text-indigo-700 text-[10px] uppercase"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                QUẢN TRỊ VIÊN HỆ THỐNG
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View className="p-6 gap-6">
            <InfoField
              label="Tên đăng nhập"
              value={profile?.userName ?? "—"}
              icon="person-outline"
            />
            <InfoField
              label="Email"
              value={profile?.email ?? "—"}
              icon="mail-outline"
            />
            <InfoField
              label="Số điện thoại"
              value={profile?.phoneNumber ?? "—"}
              icon="call-outline"
            />
            <InfoField
              label="Địa chỉ"
              value={profile?.address ?? "—"}
              icon="location-outline"
            />
            <InfoField
              label="Ngày sinh"
              value={
                profile?.birthday
                  ? new Date(profile.birthday).toLocaleDateString("en-GB")
                  : "—"
              }
              icon="calendar-outline"
            />
          </View>
        </ScrollView>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Text
                className="text-gray-500 text-base"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Hủy
              </Text>
            </TouchableOpacity>
            <Text
              className="text-black text-base"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              Sửa Thông tin Quản trị
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#136ADA" />
              ) : (
                <Text
                  className="text-blue-600 text-base"
                  style={{ fontFamily: "Poppins-SemiBold" }}
                >
                  Lưu
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-6 pt-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5">
              <EditInput
                label="Họ và Tên"
                value={editForm.fullName}
                onChangeText={(v: string) =>
                  setEditForm({ ...editForm, fullName: v })
                }
              />
              <EditInput
                label="Email"
                value={editForm.email}
                onChangeText={(v: string) =>
                  setEditForm({ ...editForm, email: v })
                }
                keyboardType="email-address"
              />
              <EditInput
                label="Số điện thoại"
                value={editForm.phoneNumber}
                onChangeText={(v: string) =>
                  setEditForm({ ...editForm, phoneNumber: v })
                }
                keyboardType="phone-pad"
              />
              <EditInput
                label="Địa chỉ"
                value={editForm.address}
                onChangeText={(v: string) =>
                  setEditForm({ ...editForm, address: v })
                }
              />
              <EditInput
                label="Ngày sinh (YYYY-MM-DD)"
                value={editForm.birthday}
                onChangeText={(v: string) =>
                  setEditForm({ ...editForm, birthday: v })
                }
                placeholder="1990-01-01"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </AdminPageWrapper>
  );
}

function InfoField({ label, value, icon }: any) {
  return (
    <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-white">
      <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color="#6366F1" />
      </View>
      <View className="flex-1">
        <Text
          style={{ fontFamily: "Poppins-Regular" }}
          className="text-gray-400 text-[10px] uppercase tracking-wider"
        >
          {label}
        </Text>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-sm"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function EditInput({
  label,
  value,
  onChangeText,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  [key: string]: any;
}) {
  return (
    <View className="gap-1">
      <Text
        style={{ fontFamily: "Poppins-Medium" }}
        className="text-gray-500 text-xs ml-1"
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-black text-sm"
        style={{ fontFamily: "Poppins-Regular" }}
        {...props}
      />
    </View>
  );
}
