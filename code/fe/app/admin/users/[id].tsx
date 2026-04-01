import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import { UserResponse } from '../../../types/user';
import { RoleResponse } from '../../../types/role';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Admin:   { bg: '#EFF6FF', text: '#136ADA' },
  Teacher: { bg: '#F3E8FF', text: '#A855F7' },
  Student: { bg: '#F0FDF4', text: '#22C55E' },
};

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleResponse[]>([]);

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
      Alert.alert('Error', 'Could not fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await roleService.getRoles();
      setRoles(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  if (!user) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">User not found</Text>
      <TouchableOpacity onPress={() => router.back()} className="mt-4">
        <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue">Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const isLocked = !!(user as any).lockoutEnd; // The UserListItem has lockoutEnd, UserResponse might not if not in swagger
  const roleColor = ROLE_COLORS[user.role] ?? { bg: '#F3F4F6', text: '#6B7280' };

  const handleResetPassword = () => {
    Alert.prompt(
      'Reset Password',
      'Enter new password for this user:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async (password?: string) => {
            if (!password) return;
            try {
              await userService.resetPassword(user.userId, { newPassword: password });
              Alert.alert('Success', 'Password has been reset.');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Reset failed.');
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
      nextLocked ? 'Lock Account' : 'Unlock Account',
      `Are you sure you want to ${nextLocked ? 'lock' : 'unlock'} this account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              // Lock until 2099 if nextLocked is true, else null
              const lockoutEnd = nextLocked ? new Date('2099-12-31').toISOString() : null;
              await userService.updateStatus(user.userId, { lockoutEnd });
              Alert.alert('Success', `Account ${nextLocked ? 'locked' : 'unlocked'}.`);
              fetchUser(); // Refresh UI
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Action failed.');
            }
          }
        }
      ]
    );
  };

  const handleChangeRole = () => {
    Alert.alert(
      'Change Role',
      'Select new role:',
      roles.map(r => ({
        text: r.name,
        onPress: async () => {
          try {
            await userService.updateRole(user.userId, { roleId: r.name }); // Backend expects name or ID, mapping string r.name for current type
            Alert.alert('Success', 'Role updated.');
            fetchUser();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Update failed.');
          }
        }
      })).concat([{ text: 'Cancel', style: 'cancel' } as any])
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
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">User Detail</Text>
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
            <Text style={{ fontFamily: 'Poppins-Medium', color: roleColor.text, fontSize: 12 }}>{user.role}</Text>
          </View>
          {isLocked && (
            <View className="flex-row items-center gap-1 bg-red-50 px-3 py-1 rounded-full">
              <Ionicons name="lock-closed" size={12} color="#EF4444" />
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11 }} className="text-red-500">Account Locked</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="bg-white mx-4 mt-3 rounded-2xl px-4 border border-gray-100">
          <InfoRow icon="mail-outline" label="Email" value={user.email} />
          <InfoRow icon="call-outline" label="Phone" value={user.phoneNumber} />
          <InfoRow icon="location-outline" label="Address" value={user.address} />
          <InfoRow icon="calendar-outline" label="Birthday" value={user.birthday ? user.birthday.split('T')[0] : 'N/A'} />
          <InfoRow icon="person-outline" label="Username" value={user.username} />
        </View>

        {/* Actions */}
        <View className="mx-4 mt-3 gap-2 pb-10">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-500 text-xs mb-1 px-1">ACTIONS</Text>

          <TouchableOpacity
            className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={handleResetPassword}
          >
            <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="key-outline" size={18} color="#136ADA" />
            </View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm flex-1">Reset Password</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className={`border rounded-2xl p-4 flex-row items-center gap-3 shadow-sm ${isLocked ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}
            onPress={handleToggleStatus}
          >
            <View className={`w-9 h-9 rounded-full items-center justify-center ${isLocked ? 'bg-green-100' : 'bg-orange-50'}`}>
              <Ionicons name={isLocked ? 'lock-open-outline' : 'lock-closed-outline'} size={18} color={isLocked ? '#22C55E' : '#F97316'} />
            </View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm flex-1">{isLocked ? 'Unlock Account' : 'Lock Account'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
            onPress={handleChangeRole}
          >
            <View className="w-9 h-9 rounded-full bg-purple-50 items-center justify-center">
              <Ionicons name="shield-outline" size={18} color="#A855F7" />
            </View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm flex-1">Change Role</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
