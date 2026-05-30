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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { userService } from "../../services/user.service";
import { useAuthStore } from "../../store/authStore";
import { UserResponse } from "../../types/user";

export default function AdminProfileScreen() {
  const router = useRouter();
  const { userInfo, updateUserInfo } = useAuthStore();
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
    avatarUri: "",
    avatarFile: null as any,
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
      console.log("Error loading admin profile:", error);
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
      avatarUri: profile.avatarUrl || "",
      avatarFile: null,
    });
    setEditVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setEditForm((prev) => ({
        ...prev,
        avatarUri: asset.uri,
        avatarFile: {
          uri: asset.uri,
          type: asset.mimeType || "image/jpeg",
          name: asset.fileName || "avatar.jpg",
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("FullName", editForm.fullName);
      formData.append("Email", editForm.email);
      if (editForm.phoneNumber) formData.append("PhoneNumber", editForm.phoneNumber);
      if (editForm.address) formData.append("Address", editForm.address);
      if (editForm.birthday) formData.append("Birthday", editForm.birthday);
      if (editForm.avatarFile) {
        formData.append("Avatar", editForm.avatarFile as any);
      }

      const updated = await userService.updateMe(formData as any);
      setProfile(updated);
      
      // Update global auth store to reflect changes in SideMenu/Headers
      updateUserInfo({
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl
      });
      
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
      title="Hồ sơ"
      centerTitle={true}
      rightComponent={
        <TouchableOpacity onPress={openEdit} className="p-2">
          <Ionicons name="create-outline" size={24} color="#136ADA" />
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
            <View className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
              {profile?.avatarUrl ? (
                <Image className="rounded-full" 
                  source={{ uri: profile.avatarUrl }} 
                  style={{ width: 96, height: 96, borderRadius: 9999 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 36,
                  color: "#136ADA",
                }}
              >
                {profile?.fullName?.charAt(0) || "A"}
              </Text>
              )}
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
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
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
            <View className="items-center mb-6">
              <TouchableOpacity onPress={pickImage} className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                {editForm.avatarUri ? (
                  <Image className="rounded-full" 
                    source={{ uri: editForm.avatarUri }} 
                    style={{ width: 96, height: 96, borderRadius: 9999 }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <Ionicons name="camera-outline" size={32} color="#136ADA" />
                )}
              </TouchableOpacity>
              <Text className="text-blue-600 mt-2 text-xs" style={{ fontFamily: "Poppins-Medium" }}>Thay đổi ảnh đại diện</Text>
            </View>

            <View className="gap-5 pb-20">
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
          </KeyboardAvoidingView>
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
          style={{ fontFamily: "Poppins-Medium" }}
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
