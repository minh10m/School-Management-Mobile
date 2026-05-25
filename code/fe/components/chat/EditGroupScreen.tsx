import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { conversationService } from "../../services/conversation.service";

interface EditGroupScreenProps {
  rolePrefix?: "admin" | "teacher" | "student";
}

// Color constant based on the app's theme
const PRIMARY_COLOR = "#136ADA";
const PRIMARY_LIGHT = "#E7F0FB";

export default function EditGroupScreen({ rolePrefix: rolePrefixProp }: EditGroupScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string, currentName?: string, currentAvatarUrl?: string, rolePrefix?: string }>();
  
  const conversationId = params.conversationId;
  const rolePrefix = rolePrefixProp || params.rolePrefix || "student";
  
  // Initialize with current values from params
  const [editGroupName, setEditGroupName] = useState(params.currentName || "");
  const [editGroupAvatar, setEditGroupAvatar] = useState<{ uri: string; file?: any } | null>(null);
  const [updatingGroup, setUpdatingGroup] = useState(false);

  const handlePickGroupAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setEditGroupAvatar({
        uri: asset.uri,
        file: {
          uri: asset.uri,
          type: asset.mimeType || "image/jpeg",
          name: asset.fileName || "group_avatar.jpg",
        },
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!editGroupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
      return;
    }
    
    if (!conversationId) {
      Alert.alert("Lỗi", "Không tìm thấy ID cuộc trò chuyện");
      return;
    }

    try {
      setUpdatingGroup(true);
      const formData = new FormData();
      formData.append("ConversationName", editGroupName.trim());
      if (editGroupAvatar?.file) {
        formData.append("Avatar", editGroupAvatar.file as any);
      }

      await conversationService.updateGroup(conversationId, formData);
      router.navigate({
        pathname: `/${rolePrefix}/chat/${conversationId}` as any,
        params: {
          name: editGroupName.trim(),
          avatarUrl: editGroupAvatar?.uri || params.currentAvatarUrl || "",
          t: Date.now().toString()
        }
      });
      // Hiện thông báo sau khi đã quay lại list chat
      setTimeout(() => {
        Alert.alert("Thành công", "Cập nhật thông tin nhóm thành công");
      }, 300);
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin nhóm");
    } finally {
      setUpdatingGroup(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header Section */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827", marginLeft: 8 }}>
            Chỉnh sửa nhóm
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <TouchableOpacity
              onPress={handlePickGroupAvatar}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 4,
                borderColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                overflow: "hidden"
              }}
            >
              {editGroupAvatar?.uri ? (
                <Image className="rounded-full"
                  source={{ uri: editGroupAvatar.uri }}
                  style={{ width: 120, height: 120, borderRadius: 9999 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : params.currentAvatarUrl ? (
                <Image className="rounded-full"
                  source={{ uri: params.currentAvatarUrl }}
                  style={{ width: 120, height: 120, borderRadius: 9999 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Ionicons name="camera-outline" size={40} color="#6366F1" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickGroupAvatar}>
              <Text
                style={{ fontFamily: "Poppins-Medium", fontSize: 14 }}
                className="text-indigo-600 mt-4"
              >
                Thay đổi ảnh nhóm
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 8, marginBottom: 40 }}>
            <Text
              style={{ fontFamily: "Poppins-Medium", fontSize: 13 }}
              className="text-gray-500 ml-1"
            >
              Tên nhóm
            </Text>
            <TextInput
              value={editGroupName}
              onChangeText={setEditGroupName}
              placeholder="Nhập tên nhóm mới..."
              style={{
                backgroundColor: "#F9FAFB",
                borderWidth: 1,
                borderColor: "#F3F4F6",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: "#111827",
                fontSize: 15,
                fontFamily: "Poppins-Regular"
              }}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center"
              }}
              onPress={() => router.back()}
              disabled={updatingGroup}
            >
              <Text
                style={{ fontFamily: "Poppins-SemiBold", fontSize: 16 }}
                className="text-gray-600"
              >
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#4F46E5",
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: "#4F46E5",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4
              }}
              onPress={handleUpdateGroup}
              disabled={updatingGroup}
            >
              {updatingGroup ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  style={{ fontFamily: "Poppins-SemiBold", fontSize: 16 }}
                  className="text-white"
                >
                  Lưu thay đổi
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
