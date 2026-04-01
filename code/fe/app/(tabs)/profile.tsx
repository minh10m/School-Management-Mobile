import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { studentService } from "../../services/student.service";
import { useAuthStore } from "../../store/authStore";
import { StudentResponse, UpdateStudentSelfPayload } from "../../types/student";

export default function ProfileScreen() {
  const { userInfo } = useAuthStore();
  const role = userInfo?.role?.toLowerCase() ?? "student";

  const [studentProfile, setStudentProfile] = useState<StudentResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<UpdateStudentSelfPayload>({});

  useEffect(() => {
    if (role === "student") {
      loadStudentProfile();
    }
  }, [role]);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMe();
      setStudentProfile(data);
    } catch (error) {
      console.error("Lỗi khi tải thông tin học sinh:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    if (!studentProfile) return;
    setEditForm({
      fullName: studentProfile.fullName,
      email: studentProfile.email,
      phoneNumber: studentProfile.phoneNumber,
      address: studentProfile.address,
      birthday: studentProfile.birthday
        ? studentProfile.birthday.split("T")[0]
        : "",
    });
    setEditVisible(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await studentService.updateMe(editForm);
      setStudentProfile(updated);
      setEditVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Update failed. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 relative">
        <TouchableOpacity
          className="absolute left-6 z-10 p-2"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text
            className="text-black text-lg"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Profile
          </Text>
        </View>
        {role === "student" && (
          <TouchableOpacity
            className="absolute right-6 z-10 p-2"
            onPress={openEdit}
          >
            <Ionicons name="pencil-outline" size={22} color="#136ADA" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 pb-10"
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex-row items-center">
            <View className="w-24 h-24 rounded-full border-4 border-blue-500 items-center justify-center p-1 mr-6">
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                className="w-full h-full rounded-full"
              />
            </View>

            <View className="flex-1">
              <Text
                className="text-black text-lg mb-1"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {role === "student"
                  ? (studentProfile?.fullName ??
                    userInfo?.fullName ??
                    "Student")
                  : "Teacher : Ms. Elena"}
              </Text>

              {role === "student" ? (
                <>
                  {studentProfile?.classYearSub?.[0]?.className ? (
                    <Text
                      className="text-gray-600 text-sm mb-1"
                      style={{ fontFamily: "Poppins-Regular" }}
                    >
                      Class : {studentProfile.classYearSub[0].className}
                    </Text>
                  ) : null}
                  {studentProfile?.classYearSub?.[0]?.grade ? (
                    <Text
                      className="text-gray-600 text-sm"
                      style={{ fontFamily: "Poppins-Regular" }}
                    >
                      Grade : {studentProfile.classYearSub[0].grade}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text
                  className="text-gray-600 text-sm mb-1"
                  style={{ fontFamily: "Poppins-Regular" }}
                >
                  Subject : Mathematics
                </Text>
              )}
            </View>
          </View>

          {/* Details Section */}
          <View className="space-y-6 gap-6 pb-10">
            {role === "student" ? (
              <>
                <DetailField
                  label="Date of birth"
                  value={
                    studentProfile?.birthday
                      ? new Date(studentProfile.birthday).toLocaleDateString(
                          "en-GB",
                        )
                      : "—"
                  }
                />
                <DetailField
                  label="Email"
                  value={studentProfile?.email ?? "—"}
                />
                <DetailField
                  label="Phone Number"
                  value={studentProfile?.phoneNumber ?? "—"}
                />
                <DetailField
                  label="Address"
                  value={studentProfile?.address ?? "—"}
                  multiline
                />
              </>
            ) : (
              <>
                <DetailField label="Email" value="elena.math@school.edu" />
                <DetailField label="Phone" value="+84 987 654 321" />
                <DetailField label="Birthday" value="15-05-1990" />
                <DetailField label="Joined Date" value="2022-09-01" />
              </>
            )}
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
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Text
                className="text-gray-500 text-base"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              className="text-black text-base"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              Edit Profile
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#136ADA" />
              ) : (
                <Text
                  className="text-blue-600 text-base"
                  style={{ fontFamily: "Poppins-SemiBold" }}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-6 pt-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5">
              <EditField
                label="Full Name"
                value={editForm.fullName ?? ""}
                onChangeText={(v) => setEditForm({ ...editForm, fullName: v })}
              />
              <EditField
                label="Email"
                value={editForm.email ?? ""}
                onChangeText={(v) => setEditForm({ ...editForm, email: v })}
                keyboardType="email-address"
              />
              <EditField
                label="Phone Number"
                value={editForm.phoneNumber ?? ""}
                onChangeText={(v) =>
                  setEditForm({ ...editForm, phoneNumber: v })
                }
                keyboardType="phone-pad"
              />
              <EditField
                label="Address"
                value={editForm.address ?? ""}
                onChangeText={(v) => setEditForm({ ...editForm, address: v })}
                multiline
              />
              <EditField
                label="Birthday (YYYY-MM-DD)"
                value={editForm.birthday ?? ""}
                onChangeText={(v) => setEditForm({ ...editForm, birthday: v })}
                placeholder="2005-10-10"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function DetailField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View className="relative border border-gray-300 rounded-xl p-4 pt-5">
      <View className="absolute -top-3 left-4 bg-white px-1">
        <Text
          className="text-gray-400 text-xs"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          {label}
        </Text>
      </View>
      <Text
        className={`text-black text-sm ${multiline ? "leading-5" : ""}`}
        style={{ fontFamily: "Poppins-Medium" }}
      >
        {value}
      </Text>
    </View>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType = "default",
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  placeholder?: string;
}) {
  return (
    <View className="relative border border-gray-300 rounded-xl px-4 pt-5 pb-3">
      <View className="absolute -top-3 left-4 bg-white px-1">
        <Text
          className="text-gray-400 text-xs"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          {label}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className={`text-black text-sm ${multiline ? "min-h-[60px]" : ""}`}
        style={{ fontFamily: "Poppins-Medium" }}
        autoCapitalize="none"
      />
    </View>
  );
}
