import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { userService } from "../../../services/user.service";
import { roleService } from "../../../services/role.service";
import { classYearService } from "../../../services/classYear.service";
import { subjectService } from "../../../services/subject.service";
import { RoleResponse } from "../../../types/role";
import { ClassYearResponse } from "../../../types/classYear";
import { SubjectResponse } from "../../../types/subject";
import { getErrorMessage } from "../../../utils/error";

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry = false,
}: any) => (
  <View className="mb-6">
    <Text
      style={{ fontFamily: "Poppins-Medium" }}
      className="text-gray-400 text-[10px] mb-2 ml-1 uppercase tracking-widest"
    >
      {label}
    </Text>
    <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-0.5 flex-row items-center gap-3">
      {icon && <Ionicons name={icon} size={18} color="#9CA3AF" />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9CA3AF"
        className="flex-1 py-4 text-black text-base"
        style={{ fontFamily: "Poppins-Regular" }}
      />
    </View>
  </View>
);

export default function AdminCreateUserScreen() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    fullName: "",
    address: "",
    birthday: "",
    roleId: "",
    classYearId: "",
    subjectId: "",
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
        classYearService.getClassYears({ schoolYear: "2026" }),
      ]);

      const rolesData = Array.isArray(roleRes)
        ? roleRes
        : (roleRes as any).items || [];
      const subjectsData = Array.isArray(subjectRes)
        ? subjectRes
        : (subjectRes as any).items || [];
      const classesData = Array.isArray(classRes)
        ? classRes
        : (classRes as any).items || [];

      setRoles(rolesData);
      setSubjects(subjectsData);
      setClasses(classesData);

      const studentRole = rolesData.find(
        (r: any) => r.name.toLowerCase() === "student",
      );
      if (studentRole) setForm((f) => ({ ...f, roleId: studentRole.name }));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const isStudent = form.roleId.toLowerCase() === "student";
  const isTeacher = form.roleId.toLowerCase() === "teacher";

  const handleSubmit = async () => {
    if (
      !form.username ||
      !form.password ||
      !form.fullName ||
      !form.email ||
      !form.roleId
    ) {
      Alert.alert("Missing info", "Please fill in all required fields (*).");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters long and contain uppercase letters, lowercase letters, and numbers.",
      );
      return;
    }

    if (isStudent && !form.classYearId) {
      Alert.alert("Missing info", "Please select a class for the student.");
      return;
    }

    if (isTeacher && !form.subjectId) {
      Alert.alert("Missing info", "Please select a subject for the teacher.");
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
        subjectId: form.subjectId ? [form.subjectId] : [],
      });
      Alert.alert("Success", `Account created for ${form.fullName}`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-xl ml-2"
        >
          New Account
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 100 }}
      >
        <View className="gap-2">
           {/* Section 1: Basic Info */}
          <Field
            label="Username *"
            icon="key-outline"
            value={form.username}
            onChangeText={(v: string) => set("username", v)}
            placeholder="username_101"
          />
          <Field
            label="Password *"
            icon="lock-closed-outline"
            value={form.password}
            onChangeText={(v: string) => set("password", v)}
            placeholder="••••••••"
            secureTextEntry
          />
          <Field
            label="Full Name *"
            icon="person-outline"
            value={form.fullName}
            onChangeText={(v: string) => set("fullName", v)}
            placeholder="Nguyen Van A"
          />
          <Field
            label="Email Address *"
            icon="mail-outline"
            value={form.email}
            onChangeText={(v: string) => set("email", v)}
            placeholder="user@school.edu"
          />
          <Field
            label="Phone Number"
            icon="call-outline"
            value={form.phone}
            onChangeText={(v: string) => set("phone", v)}
            placeholder="09xxxxxxxx"
          />
          <Field
            label="Address"
            icon="location-outline"
            value={form.address}
            onChangeText={(v: string) => set("address", v)}
            placeholder="123 Road ABC..."
          />
          <Field
            label="Birthday (YYYY-MM-DD)"
            icon="calendar-outline"
            value={form.birthday}
            onChangeText={(v: string) => set("birthday", v)}
            placeholder="2000-01-15"
          />

          {/* Section 2: Role Selection */}
          <View className="mb-8">
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-3 ml-1 uppercase tracking-widest"
            >
              System Role *
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {roles && roles.length > 0 ? (
                roles.map((r: any) => {
                  if (!r || !r.name) return null;
                  const roleLower = r.name.toLowerCase();
                  const isActive = form.roleId.toLowerCase() === roleLower;
                  return (
                    <TouchableOpacity
                      key={r.roleId || r.name}
                      onPress={() => set("roleId", r.name)}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 16,
                        borderWidth: 1,
                        alignItems: 'center',
                        backgroundColor: isActive ? '#136ADA' : '#F9FAFB',
                        borderColor: isActive ? '#136ADA' : '#F3F4F6',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 12,
                          color: isActive ? "white" : "#6B7280",
                        }}
                      >
                        {r.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={{ color: '#9CA3AF', fontSize: 12, fontStyle: 'italic' }}>Loading roles...</Text>
              )}
            </View>
          </View>

          {/* Section 3: Dynamic Assignment */}
          {isStudent && (
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{ fontFamily: "Poppins-Medium", fontSize: 10, color: '#9CA3AF', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 2 }}
              >
                Assign to Class *
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {classes.map((c) => {
                  const isActive = form.classYearId === c.classYearId;
                  return (
                    <TouchableOpacity
                      key={c.classYearId}
                      onPress={() => set("classYearId", c.classYearId)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        backgroundColor: isActive ? '#4F46E5' : '#F9FAFB',
                        borderColor: isActive ? '#4F46E5' : '#F3F4F6',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 11,
                          color: isActive ? "white" : "#6B7280",
                        }}
                      >
                        {c.className} ({c.grade})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {classes.length === 0 && (
                <Text style={{ color: '#9CA3AF', fontSize: 12, fontStyle: 'italic' }}>
                  No classes found for 2026
                </Text>
              )}
            </View>
          )}

          {isTeacher && (
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{ fontFamily: "Poppins-Medium", fontSize: 10, color: '#9CA3AF', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 2 }}
              >
                Specialize Subject *
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {subjects.map((s) => {
                  const isActive = form.subjectId === s.subjectId;
                  return (
                    <TouchableOpacity
                      key={s.subjectId}
                      onPress={() => set("subjectId", s.subjectId)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        backgroundColor: isActive ? '#4F46E5' : '#F9FAFB',
                        borderColor: isActive ? '#4F46E5' : '#F3F4F6',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 11,
                          color: isActive ? "white" : "#6B7280",
                        }}
                      >
                        {s.subjectName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            className={`${
              loading ? "bg-gray-100" : "bg-bright-blue"
            } rounded-[24px] py-5 items-center mt-10 shadow-xl shadow-blue-200`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#136ADA" />
            ) : (
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-white text-lg"
              >
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
