import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

const MOCK_TEACHERS: Record<string, any> = {
  '1': { teacherId: '1', fullName: 'Tran Thi Mai',   email: 'mai@school.edu', phone: '0901111111', birthday: '1985-05-20', subjects: [{ subjectId: 's1', subjectName: 'Mathematics' }] },
  '2': { teacherId: '2', fullName: 'Pham Thi Lan',   email: 'lan@school.edu', phone: '0902222222', birthday: '1990-07-22', subjects: [{ subjectId: 's2', subjectName: 'Chemistry' }] },
  '3': { teacherId: '3', fullName: 'Do Van Duc',      email: 'duc@school.edu', phone: '0903333333', birthday: '1988-11-08', subjects: [{ subjectId: 's3', subjectName: 'Physics' }] },
  '4': { teacherId: '4', fullName: 'Nguyen Thi Hoa', email: 'hoa@school.edu', phone: '0904444444', birthday: '1992-03-15', subjects: [{ subjectId: 's4', subjectName: 'Literature' }, { subjectId: 's5', subjectName: 'History' }] },
  '5': { teacherId: '5', fullName: 'Le Van Nam',      email: 'nam@school.edu', phone: '0905555555', birthday: '1987-09-30', subjects: [{ subjectId: 's6', subjectName: 'English' }] },
  '6': { teacherId: '6', fullName: 'Vo Thi Bich',    email: 'bich@school.edu', phone: '0906666666', birthday: '1991-06-18', subjects: [{ subjectId: 's5', subjectName: 'History' }] },
  '7': { teacherId: '7', fullName: 'Phan Van Hung',  email: 'hung@school.edu', phone: '0907777777', birthday: '1983-12-01', subjects: [{ subjectId: 's7', subjectName: 'Physical Ed' }] },
};

const ALL_SUBJECTS = ['Mathematics', 'Chemistry', 'Physics', 'Literature', 'English', 'History', 'Physical Ed'];

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics:   { bg: '#EFF6FF', text: '#136ADA' },
  Chemistry:     { bg: '#F0FDF4', text: '#22C55E' },
  Physics:       { bg: '#FFF7ED', text: '#F97316' },
  Literature:    { bg: '#FDF4FF', text: '#A855F7' },
  English:       { bg: '#F0FDFA', text: '#14B8A6' },
  History:       { bg: '#FEFCE8', text: '#EAB308' },
  'Physical Ed': { bg: '#FFF1F2', text: '#F43F5E' },
};

export default function AdminTeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const teacher = MOCK_TEACHERS[id ?? '1'];

  const [isEditing, setIsEditing] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [form, setForm] = useState({
    fullName: teacher?.fullName ?? '',
    email: teacher?.email ?? '',
    phone: teacher?.phone ?? '',
    birthday: teacher?.birthday ?? '',
  });

  if (!teacher) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Teacher not found</Text>
    </SafeAreaView>
  );

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    Alert.alert('Thành công', `Đã cập nhật thông tin của ${form.fullName}`, [
      { text: 'OK', onPress: () => setIsEditing(false) }
    ]);
  };

  const handleAssignSubject = (subjectName: string) => {
    setShowSubjectPicker(false);
    Alert.alert('Thành công', `Đã gán môn "${subjectName}" cho ${teacher.fullName}`);
  };

  const handleRemoveSubject = (subjectName: string) => {
    Alert.alert('Xác nhận', `Xóa môn "${subjectName}" khỏi giáo viên?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => {} },
    ]);
  };

  const EditableField = ({ label, fieldKey, icon }: { label: string; fieldKey: keyof typeof form; icon: string }) => (
    <View className={`flex-row items-center gap-3 py-3.5 ${fieldKey !== 'birthday' ? 'border-b border-gray-50' : ''}`}>
      <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
        <Ionicons name={icon as any} size={16} color="#9CA3AF" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{label}</Text>
        {isEditing ? (
          <TextInput
            value={form[fieldKey]}
            onChangeText={v => set(fieldKey, v)}
            className="text-black text-sm mt-0.5 py-0 border-b border-blue-200"
            style={{ fontFamily: 'Poppins-Medium' }}
          />
        ) : (
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm mt-0.5">{form[fieldKey]}</Text>
        )}
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
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Teacher Detail</Text>
        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-4 py-1.5 rounded-full ${isEditing ? 'bg-bright-blue' : 'bg-gray-100'}`}
        >
          <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 12, color: isEditing ? 'white' : '#374151' }}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white mx-4 mt-4 rounded-3xl p-5 border border-gray-100 items-center">
          <View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center mb-3">
            <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7', fontSize: 30 }}>
              {teacher.fullName.charAt(0)}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl mb-1">{form.fullName}</Text>
          <View className="flex-row flex-wrap justify-center gap-2 mt-1">
            {teacher.subjects.map((s: any) => {
              const col = SUBJECT_COLORS[s.subjectName] ?? { bg: '#F3F4F6', text: '#6B7280' };
              return (
                <View key={s.subjectId} style={{ backgroundColor: col.bg }} className="px-3 py-1 rounded-full">
                  <Text style={{ fontFamily: 'Poppins-Medium', color: col.text, fontSize: 12 }}>{s.subjectName}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Info fields */}
        <View className="bg-white mx-4 mt-3 rounded-2xl px-4 border border-gray-100">
          <EditableField label="Full Name"  fieldKey="fullName" icon="person-outline" />
          <EditableField label="Email"      fieldKey="email"    icon="mail-outline" />
          <EditableField label="Phone"      fieldKey="phone"    icon="call-outline" />
          <EditableField label="Birthday"   fieldKey="birthday" icon="calendar-outline" />
        </View>

        {/* Subjects section */}
        <View className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 px-4 pb-4">
          <View className="flex-row items-center justify-between py-3 border-b border-gray-50 mb-2">
            <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">Subjects Taught</Text>
            <TouchableOpacity onPress={() => setShowSubjectPicker(true)} className="flex-row items-center gap-1">
              <Ionicons name="add-circle-outline" size={18} color="#136ADA" />
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12 }} className="text-bright-blue">Assign</Text>
            </TouchableOpacity>
          </View>

          {teacher.subjects.map((s: any) => {
            const col = SUBJECT_COLORS[s.subjectName] ?? { bg: '#F3F4F6', text: '#6B7280' };
            return (
              <View key={s.subjectId} className="flex-row items-center justify-between py-2">
                <View style={{ backgroundColor: col.bg }} className="flex-row items-center gap-2 px-3 py-1.5 rounded-full">
                  <Ionicons name="book-outline" size={13} color={col.text} />
                  <Text style={{ fontFamily: 'Poppins-Medium', color: col.text, fontSize: 12 }}>{s.subjectName}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveSubject(s.subjectName)}>
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Subject Picker overlay */}
      {showSubjectPicker && (
        <View className="absolute inset-0 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-5" />
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base mb-4">Assign Subject</Text>
            {ALL_SUBJECTS.map(sub => {
              const col = SUBJECT_COLORS[sub] ?? { bg: '#F3F4F6', text: '#6B7280' };
              const alreadyAssigned = teacher.subjects.some((s: any) => s.subjectName === sub);
              return (
                <TouchableOpacity
                  key={sub}
                  disabled={alreadyAssigned}
                  onPress={() => handleAssignSubject(sub)}
                  className="flex-row items-center gap-3 py-3 border-b border-gray-50"
                >
                  <View style={{ backgroundColor: col.bg }} className="w-8 h-8 rounded-full items-center justify-center">
                    <Ionicons name="book-outline" size={15} color={col.text} />
                  </View>
                  <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 13, color: alreadyAssigned ? '#9CA3AF' : '#111827' }}>
                    {sub}
                  </Text>
                  {alreadyAssigned && (
                    <View className="ml-auto bg-gray-100 px-2 py-0.5 rounded-full">
                      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 10 }} className="text-gray-400">Assigned</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity onPress={() => setShowSubjectPicker(false)} className="mt-4 py-3 items-center">
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
