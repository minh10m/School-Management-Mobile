import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
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
import { studentService } from "../../services/student.service";
import { useAuthStore } from "../../store/authStore";
import { StudentResponse } from "../../types/student";

export default function StudentProfileScreen() {
  const { clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);

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
      const data = await studentService.getMe();
      setProfile(data);
    } catch (error) {
      console.error("Error loading student profile:", error);
      Alert.alert("Error", "Cannot load profile information.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    if (!profile) return;
    setEditForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phoneNumber: (profile as any).phoneNumber || "",
      address: profile.address || "",
      birthday: profile.birthday ? profile.birthday.split("T")[0] : "",
    });
    setEditVisible(true);
  };

  const handleSave = async () => {
    if (!editForm.fullName || !editForm.email) {
      Alert.alert("Error", "Please provide full name and email.");
      return;
    }
    try {
      setSaving(true);
      const updated = await studentService.updateMe({
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        birthday: editForm.birthday || undefined,
      });
      setProfile(updated);
      setEditVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Update failed. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  // Derive class info
  const classInfo = (profile as any)?.classYearSub?.[0];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>
          Student Profile
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
                {profile?.fullName?.charAt(0) || "S"}
              </Text>
            </View>
            <Text className="text-black text-xl mb-1" style={{ fontFamily: "Poppins-Bold" }}>
              {profile?.fullName || "Student"}
            </Text>
            <View className="bg-indigo-100 px-4 py-1 rounded-full mt-2">
              <Text className="text-indigo-700 text-[10px] uppercase" style={{ fontFamily: "Poppins-Bold" }}>
                STUDENT{classInfo ? ` • ${classInfo.className} (${classInfo.grade})` : ""}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View className="p-6 gap-6">
            <InfoField label="Email" value={profile?.email ?? "—"} icon="mail-outline" />
            <InfoField label="Phone" value={(profile as any)?.phoneNumber ?? "—"} icon="call-outline" />
            <InfoField label="Address" value={profile?.address ?? "—"} icon="location-outline" />
            <InfoField
              label="Birthday"
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
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-black text-base" style={{ fontFamily: "Poppins-Bold" }}>
              Edit Profile
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#136ADA" />
              ) : (
                <Text className="text-blue-600 text-base" style={{ fontFamily: "Poppins-SemiBold" }}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
            <View className="gap-5">
              <EditInput label="Full Name" value={editForm.fullName} onChangeText={(v: string) => setEditForm({ ...editForm, fullName: v })} />
              <EditInput label="Email" value={editForm.email} onChangeText={(v: string) => setEditForm({ ...editForm, email: v })} keyboardType="email-address" />
              <EditInput label="Phone Number" value={editForm.phoneNumber} onChangeText={(v: string) => setEditForm({ ...editForm, phoneNumber: v })} keyboardType="phone-pad" />
              <EditInput label="Address" value={editForm.address} onChangeText={(v: string) => setEditForm({ ...editForm, address: v })} />
              <EditInput label="Birthday (YYYY-MM-DD)" value={editForm.birthday} onChangeText={(v: string) => setEditForm({ ...editForm, birthday: v })} placeholder="2005-10-10" />
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
        <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px] uppercase tracking-wider">{label}</Text>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-sm">{value}</Text>
      </View>
    </View>
  );
}

function EditInput({ label, value, onChangeText, ...props }: { label: string; value: string; onChangeText: (v: string) => void; [key: string]: any }) {
  return (
    <View className="gap-1">
      <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs ml-1">{label}</Text>
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
