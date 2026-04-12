import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import { UserResponse } from '../../../types/user';
import { RoleResponse } from '../../../types/role';
import { getErrorMessage } from '../../../utils/error';

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  Admin:   { bg: '#EFF6FF', text: '#136ADA', label: "Quản trị" },
  Teacher: { bg: '#F3E8FF', text: '#A855F7', label: "Giáo viên" },
  Student: { bg: '#F0FDF4', text: '#22C55E', label: "Học sinh" },
};

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
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
    fetchUser();
    fetchRoles();
  }, [id]);

  const fetchUser = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await userService.getUserById(id);
      setUser(res);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await roleService.getRoles();
      const rolesData = Array.isArray(res) ? res : (res as any).items || [];
      setRoles(rolesData);
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = () => {
    if (!user) return;
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      birthday: user.birthday ? user.birthday.split("T")[0] : "",
    });
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const updated = await userService.updateUser(user!.userId, {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phoneNumber,
        address: editForm.address,
        birthday: editForm.birthday ? new Date(editForm.birthday).toISOString() : undefined,
      });
      setUser(updated);
      setEditVisible(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin người dùng.");
    } catch (error: any) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  if (!user) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Không tìm thấy người dùng</Text>
      <TouchableOpacity onPress={() => router.back()} className="mt-4">
        <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue">Quay lại</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const isLocked = !!user.lockoutEnd;
  const roleColor = ROLE_COLORS[user.role] ?? { bg: '#F3F4F6', text: '#6B7280' };

  const handleResetPassword = () => {
    Alert.prompt(
      'Đặt lại mật khẩu',
      'Nhập mật khẩu mới cho người dùng này:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lại',
          onPress: async (password?: string) => {
            if (!password) return;

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
              Alert.alert('Mật khẩu không hợp lệ', 'Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số.');
              return;
            }

            try {
              await userService.resetPassword(user.userId, { newPassword: password });
              Alert.alert('Thành công', 'Mật khẩu đã được đặt lại.');
            } catch (err: any) {
              Alert.alert('Lỗi', getErrorMessage(err));
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleToggleStatus = async () => {
    const nextLocked = !isLocked;
    Alert.alert(
      nextLocked ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      `Bạn có chắc chắn muốn ${nextLocked ? 'khóa' : 'mở khóa'} tài khoản này không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              // Lock until 2099 if nextLocked is true, else null
              const lockoutEnd = nextLocked ? new Date('2099-12-31').toISOString() : null;
              await userService.updateStatus(user.userId, { lockoutEnd });
              Alert.alert('Thành công', `Đã ${nextLocked ? 'khóa' : 'mở khóa'} tài khoản.`);
              fetchUser(); // Refresh UI
            } catch (err: any) {
              Alert.alert('Lỗi', getErrorMessage(err));
            }
          }
        }
      ]
    );
  };

  const handleChangeRole = () => {
    Alert.alert(
      'Thay đổi vai trò',
      'Chọn vai trò mới:',
      roles.map((r: any) => ({
        text: r.name === 'Admin' ? 'Quản trị' : (r.name === 'Teacher' ? 'Giáo viên' : (r.name === 'Student' ? 'Học sinh' : r.name)),
        onPress: async () => {
          try {
            await userService.updateRole(user.userId, { roleId: r.name }); 
            Alert.alert('Thành công', 'Đã cập nhật vai trò.');
            fetchUser();
          } catch (err: any) {
            Alert.alert('Lỗi', getErrorMessage(err));
          }
        }
      })).concat([{ text: 'Hủy', style: 'cancel' } as any])
    );
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <View className="flex-row items-center gap-3 py-3 border-b border-gray-50">
      <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
        <Ionicons name={icon} size={16} color="#9CA3AF" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{label}</Text>
        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm">{value || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Chi tiết người dùng</Text>
        <TouchableOpacity onPress={openEdit}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white mx-4 mt-4 rounded-3xl p-5 border border-gray-100 items-center">
          <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-3">
            <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA', fontSize: 30 }}>
              {user.fullName ? user.fullName.charAt(0) : '?'}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl mb-1 text-center">{user.fullName}</Text>
          <View style={{ backgroundColor: roleColor.bg }} className="px-3 py-1 rounded-full mb-2">
            <Text style={{ fontFamily: 'Poppins-Medium', color: roleColor.text, fontSize: 12 }}>{roleColor.label || user.role}</Text>
          </View>
          {isLocked && (
            <View className="flex-row items-center gap-1 bg-red-50 px-3 py-1 rounded-full">
              <Ionicons name="lock-closed" size={12} color="#EF4444" />
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11 }} className="text-red-500">Tài khoản bị khóa</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="bg-white mx-4 mt-3 rounded-2xl px-4 border border-gray-100">
          <InfoRow icon="mail-outline" label="Địa chỉ Email" value={user.email} />
          <InfoRow icon="call-outline" label="Số điện thoại" value={user.phoneNumber} />
          <InfoRow icon="location-outline" label="Địa chỉ" value={user.address} />
          <InfoRow icon="calendar-outline" label="Ngày sinh" value={user.birthday ? user.birthday.split('T')[0] : 'Chưa cập nhật'} />
          <InfoRow icon="person-outline" label="Tên đăng nhập" value={user.userName} />
        </View>

        {/* Actions */}
        <View className="mx-4 mt-3 gap-2 pb-10">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-500 text-xs mb-1 px-1">HÀNH ĐỘNG</Text>

          <TouchableOpacity
            className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={handleResetPassword}
          >
            <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="key-outline" size={18} color="#136ADA" />
            </View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm flex-1">Đặt lại mật khẩu</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className={`border rounded-2xl p-4 flex-row items-center gap-3 shadow-sm ${isLocked ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}
            onPress={handleToggleStatus}
          >
            <View className={`w-9 h-9 rounded-full items-center justify-center ${isLocked ? 'bg-green-100' : 'bg-orange-50'}`}>
              <Ionicons name={isLocked ? 'lock-open-outline' : 'lock-closed-outline'} size={18} color={isLocked ? '#22C55E' : '#F97316'} />
            </View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm flex-1">{isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={handleChangeRole}
          >
            <View className="w-9 h-9 rounded-full bg-purple-50 items-center justify-center">
              <Ionicons name="shield-outline" size={18} color="#A855F7" />
            </View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm flex-1">Thay đổi vai trò</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Text className="text-gray-500 text-base" style={{ fontFamily: "Poppins-Regular" }}>Hủy</Text>
            </TouchableOpacity>
            <Text className="text-black text-base" style={{ fontFamily: "Poppins-Bold" }}>Sửa thông tin người dùng</Text>
            <TouchableOpacity onPress={handleSaveEdit} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#136ADA" /> : (
                <Text className="text-blue-600 text-base" style={{ fontFamily: "Poppins-SemiBold" }}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
            <View className="gap-5">
              <EditInput label="Họ và tên" value={editForm.fullName} onChangeText={(v: string) => setEditForm({ ...editForm, fullName: v })} />
              <EditInput label="Email" value={editForm.email} onChangeText={(v: string) => setEditForm({ ...editForm, email: v })} keyboardType="email-address" />
              <EditInput label="Số điện thoại" value={editForm.phoneNumber} onChangeText={(v: string) => setEditForm({ ...editForm, phoneNumber: v })} keyboardType="phone-pad" />
              <EditInput label="Địa chỉ" value={editForm.address} onChangeText={(v: string) => setEditForm({ ...editForm, address: v })} />
              <EditInput label="Ngày sinh (YYYY-MM-DD)" value={editForm.birthday} onChangeText={(v: string) => setEditForm({ ...editForm, birthday: v })} placeholder="1990-01-01" />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
