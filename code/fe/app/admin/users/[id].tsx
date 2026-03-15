import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const MOCK_USERS: Record<string, any> = {
  '1': { userId: '1', username: 'admin01', fullName: 'Nguyen Van Admin', role: 'Admin', email: 'admin@school.edu', phone: '0901111111', address: '123 ABC', birthday: '1980-01-01', lockoutEnd: null },
  '2': { userId: '2', username: 'teacher01', fullName: 'Tran Thi Mai', role: 'Teacher', email: 'mai@school.edu', phone: '0902222222', address: '456 XYZ', birthday: '1985-05-20', lockoutEnd: null },
  '3': { userId: '3', username: 'student01', fullName: 'Le Van Minh', role: 'Student', email: 'minh@school.edu', phone: '0903333333', address: '789 DEF', birthday: '2006-03-15', lockoutEnd: null },
  '4': { userId: '4', username: 'teacher02', fullName: 'Pham Thi Lan', role: 'Teacher', email: 'lan@school.edu', phone: '0904444444', address: '12 GHI', birthday: '1990-07-22', lockoutEnd: null },
  '5': { userId: '5', username: 'student02', fullName: 'Hoang Van Nam', role: 'Student', email: 'nam@school.edu', phone: '0905555555', address: '34 JKL', birthday: '2007-11-08', lockoutEnd: '2099-12-31' },
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Admin:   { bg: '#EFF6FF', text: '#136ADA' },
  Teacher: { bg: '#F3E8FF', text: '#A855F7' },
  Student: { bg: '#F0FDF4', text: '#22C55E' },
};

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = MOCK_USERS[id ?? '1'];

  if (!user) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">User not found</Text>
    </SafeAreaView>
  );

  const isLocked = !!user.lockoutEnd;
  const roleColor = ROLE_COLORS[user.role] ?? { bg: '#F3F4F6', text: '#6B7280' };

  const mockAction = (title: string, msg: string) =>
    Alert.alert(title, msg, [{ text: 'OK' }]);

  const InfoRow = ({ icon, label, value }: any) => (
    <View className="flex-row items-center gap-3 py-3 border-b border-gray-50">
      <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
        <Ionicons name={icon} size={16} color="#9CA3AF" />
      </View>
      <View>
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{label}</Text>
        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm">{value}</Text>
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
              {user.fullName.charAt(0)}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl mb-1">{user.fullName}</Text>
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
          <InfoRow icon="call-outline" label="Phone" value={user.phone} />
          <InfoRow icon="location-outline" label="Address" value={user.address} />
          <InfoRow icon="calendar-outline" label="Birthday" value={user.birthday} />
          <InfoRow icon="person-outline" label="Username" value={user.username} />
        </View>

        {/* Actions */}
        <View className="mx-4 mt-3 gap-2 pb-10">
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-500 text-xs mb-1 px-1">ACTIONS</Text>

          <TouchableOpacity
            className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center gap-3"
            onPress={() => mockAction('Reset Password', `Password for ${user.fullName} has been reset.`)}
          >
            <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="key-outline" size={18} color="#136ADA" />
            </View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm flex-1">Reset Password</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className={`border rounded-2xl p-4 flex-row items-center gap-3 ${isLocked ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}
            onPress={() => mockAction(isLocked ? 'Unlock Account' : 'Lock Account', `Account has been ${isLocked ? 'unlocked' : 'locked'}.`)}
          >
            <View className={`w-9 h-9 rounded-full items-center justify-center ${isLocked ? 'bg-green-100' : 'bg-orange-50'}`}>
              <Ionicons name={isLocked ? 'lock-open-outline' : 'lock-closed-outline'} size={18} color={isLocked ? '#22C55E' : '#F97316'} />
            </View>
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm flex-1">{isLocked ? 'Unlock Account' : 'Lock Account'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center gap-3"
            onPress={() => mockAction('Change Role', 'Role has been updated successfully.')}
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
