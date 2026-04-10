import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import { classYearService } from '../../../services/classYear.service';
import { subjectService } from '../../../services/subject.service';
import { RoleResponse } from '../../../types/role';
import { ClassYearResponse } from '../../../types/classYear';
import { SubjectResponse } from '../../../types/subject';

const Field = ({ label, value, onChangeText, placeholder, secureTextEntry = false }: any) => (
  <View className="mb-4">
    <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-1">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#9CA3AF"
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-black text-sm"
      style={{ fontFamily: 'Poppins-Regular' }}
    />
  </View>
);

export default function AdminCreateUserScreen() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    fullName: '',
    address: '',
    birthday: '',
    roleId: '',
    classYearId: '',
    subjectId: '',
  });

  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setFetching(true);
      const [roleRes, subjectRes, classRes] = await Promise.all([
        roleService.getRoles(),
        subjectService.getSubjects(),
        classYearService.getClassYears({ schoolYear: '2026' })
      ]);

      const rolesData = Array.isArray(roleRes) ? roleRes : (roleRes as any).items || [];
      const subjectsData = Array.isArray(subjectRes) ? subjectRes : (subjectRes as any).items || [];
      const classesData = Array.isArray(classRes) ? classRes : (classRes as any).items || [];

      setRoles(rolesData);
      setSubjects(subjectsData);
      setClasses(classesData);
      
      const studentRole = rolesData.find((r: any) => r.name === 'Student');
      if (studentRole) setForm(f => ({ ...f, roleId: studentRole.name.toLowerCase() }));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const selectedRoleName = form.roleId.charAt(0).toUpperCase() + form.roleId.slice(1);

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.fullName || !form.email || !form.roleId) {
      Alert.alert('Missing info', 'Please fill in all required fields (*).');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters long and contain uppercase letters, lowercase letters, and numbers.');
      return;
    }

    if (selectedRoleName === 'Student' && !form.classYearId) {
      Alert.alert('Missing info', 'Please select a class for the student.');
      return;
    }

    if (selectedRoleName === 'Teacher' && !form.subjectId) {
      Alert.alert('Missing info', 'Please select a subject for the teacher.');
      return;
    }

    try {
      setLoading(true);
      await userService.createUser({
        username: form.username,
        password: form.password,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        birthday: form.birthday,
        roleId: form.roleId,
        classYearId: form.classYearId,
        subjectId: form.subjectId ? [form.subjectId] : []
      });
      Alert.alert('Success', `Account created for ${form.fullName}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Create failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">Create User</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white p-5 rounded-3xl border border-gray-100 mb-6">
          <Field label="Username *" value={form.username} onChangeText={(v: string) => set('username', v)} placeholder="username" />
          <Field label="Password *" value={form.password} onChangeText={(v: string) => set('password', v)} placeholder="••••••••" secureTextEntry />
          <Field label="Full Name *" value={form.fullName} onChangeText={(v: string) => set('fullName', v)} placeholder="Nguyen Van A" />
          <Field label="Email *" value={form.email} onChangeText={(v: string) => set('email', v)} placeholder="user@school.edu" />
          <Field label="Phone" value={form.phone} onChangeText={(v: string) => set('phone', v)} placeholder="09xxxxxxxx" />
          <Field label="Address" value={form.address} onChangeText={(v: string) => set('address', v)} placeholder="123 Road ABC..." />
          <Field label="Birthday (YYYY-MM-DD)" value={form.birthday} onChangeText={(v: string) => set('birthday', v)} placeholder="2000-01-15" />

          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">Role *</Text>
            <View className="flex-row flex-wrap gap-2">
              {roles.map((r: any) => (
                <TouchableOpacity
                  key={r.id || r.roleId || r.name} 
                  onPress={() => set('roleId', r.name.toLowerCase())}
                  className={`px-4 py-2 rounded-xl border items-center ${form.roleId === r.name.toLowerCase() ? 'bg-bright-blue border-bright-blue' : 'bg-gray-50 border-gray-200'}`}
                >
                  <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: form.roleId === r.name.toLowerCase() ? 'white' : '#6B7280' }}>{r.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedRoleName === 'Student' && (
            <View className="mb-4">
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">Class *</Text>
              <View className="flex-row flex-wrap gap-2">
                {classes.map(c => (
                  <TouchableOpacity key={c.classYearId} onPress={() => set('classYearId', c.classYearId)}
                    className={`px-3 py-2 rounded-xl border ${form.classYearId === c.classYearId ? 'bg-indigo-500 border-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: form.classYearId === c.classYearId ? 'white' : '#6B7280' }}>
                      {c.className} ({c.grade})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {classes.length === 0 && <Text className="text-gray-400 text-xs italic">No classes found for 2026</Text>}
            </View>
          )}

          {selectedRoleName === 'Teacher' && (
            <View className="mb-4">
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-2">Subject *</Text>
              <View className="flex-row flex-wrap gap-2">
                {subjects.map(s => (
                  <TouchableOpacity key={s.subjectId} onPress={() => set('subjectId', s.subjectId)}
                    className={`px-3 py-2 rounded-xl border ${form.subjectId === s.subjectId ? 'bg-purple-500 border-purple-500' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: form.subjectId === s.subjectId ? 'white' : '#6B7280' }}>{s.subjectName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          className={`${loading ? 'bg-gray-300' : 'bg-bright-blue'} rounded-2xl py-4 items-center mb-10 shadow-md`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : (
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Create Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
