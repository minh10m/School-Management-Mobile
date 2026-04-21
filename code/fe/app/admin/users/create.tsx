import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { userService } from "../../../services/user.service";
import { roleService } from "../../../services/role.service";
import { classYearService } from "../../../services/classYear.service";
import { subjectService } from "../../../services/subject.service";
import { FormActionButton } from "../../../components/ui/FormActionButton";
import { RoleResponse } from "../../../types/role";
import { ClassYearResponse } from "../../../types/classYear";
import { SubjectResponse } from "../../../types/subject";
import { getErrorMessage } from "../../../utils/error";

const FormLabel = ({ children }: { children: string }) => (
  <Text
    style={{ fontFamily: "Poppins-SemiBold" }}
    className="text-gray-500 text-xs mb-2 uppercase tracking-widest ml-1"
  >
    {children}
  </Text>
);

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry = false,
  isPasswordField = false,
  onToggleSecure,
}: any) => (
  <View className="mb-6">
    <FormLabel>{label}</FormLabel>
    <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center border border-gray-50">
      {icon && (
        <Ionicons name={icon} size={20} color="#9CA3AF" className="mr-3" />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-black text-sm"
        style={{ fontFamily: "Poppins-Medium" }}
      />
      {isPasswordField && (
        <TouchableOpacity onPress={onToggleSecure} className="pl-2">
          <Ionicons
            name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function AdminCreateUserScreen() {
  const router = useRouter();
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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

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

  const set = (key: string, val: string) => {
    if (key === "roleId") {
      setSelectedGrade(null);
      setForm((f) => ({ ...f, roleId: val, classYearId: "", subjectId: "" }));
    } else {
      setForm((f) => ({ ...f, [key]: val }));
    }
  };

  const isStudent = form.roleId.toLowerCase() === "student";
  const isTeacher = form.roleId.toLowerCase() === "teacher";

  const handleSubmit = async () => {
    if (
      !form.username ||
      !form.password ||
      !form.fullName ||
      !form.email ||
      !form.roleId ||
      !form.address
    ) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ các thông tin bắt buộc (*).",
      );
      return;
    }

    if (isStudent && !form.classYearId) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn lớp học cho học sinh.");
      return;
    }

    if (isTeacher && !form.subjectId) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng chọn môn học chuyên môn cho giáo viên.",
      );
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
      Alert.alert("Thành công", `Đã tạo tài khoản cho ${form.fullName}`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Lỗi", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const insets = useSafeAreaInsets();

  if (fetching)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 100,
        }}
      >
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );

  return (
    <AdminPageWrapper title="Tạo tài khoản mới">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 40,
          }}
        >
          <Field
            label="Tên đăng nhập *"
            icon="at-outline"
            value={form.username}
            onChangeText={(v: string) => set("username", v)}
            placeholder="Ví dụ: nhanvien_01"
          />
          <Field
            label="Mật khẩu *"
            icon="lock-closed-outline"
            value={form.password}
            onChangeText={(v: string) => set("password", v)}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            isPasswordField
            onToggleSecure={() => setShowPassword(!showPassword)}
          />

          <View className="mb-4">
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-black text-base mb-6"
            >
              Thông tin cá nhân
            </Text>

            <Field
              label="Họ và tên *"
              icon="person-outline"
              value={form.fullName}
              onChangeText={(v: string) => set("fullName", v)}
              placeholder="Nguyễn Văn A"
            />
            <Field
              label="Địa chỉ Email *"
              icon="mail-outline"
              value={form.email}
              onChangeText={(v: string) => set("email", v)}
              placeholder="user@school.edu.vn"
            />
            <Field
              label="Số điện thoại"
              icon="call-outline"
              value={form.phone}
              onChangeText={(v: string) => set("phone", v)}
              placeholder="09xxxxxxxx"
            />
            <Field
              label="Địa chỉ *"
              icon="location-outline"
              value={form.address}
              onChangeText={(v: string) => set("address", v)}
              placeholder="Số 123, Đường ABC..."
            />
            <Field
              label="Ngày sinh"
              icon="calendar-outline"
              value={form.birthday}
              onChangeText={(v: string) => set("birthday", v)}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={{ marginBottom: 40 }}>
            <FormLabel>Vai trò hệ thống *</FormLabel>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
            >
              {roles.map((r: any) => {
                const roleLower = r.name.toLowerCase();
                const isActive = form.roleId.toLowerCase() === roleLower;
                const roleName =
                  r.name === "Admin"
                    ? "Quản trị"
                    : r.name === "Teacher"
                      ? "Giáo viên"
                      : r.name === "Student"
                        ? "Học sinh"
                        : r.name;

                return (
                  <View
                    key={r.roleId || r.name}
                    style={{ marginRight: 10, marginBottom: 10 }}
                  >
                    <Pressable
                      onPress={() => set("roleId", r.name)}
                      style={{
                        paddingHorizontal: 24,
                        paddingVertical: 14,
                        borderRadius: 16,
                        borderWidth: 1,
                        backgroundColor: isActive ? "#2563EB" : "#FFFFFF",
                        borderColor: isActive ? "#2563EB" : "#F3F4F6",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isActive ? 0.2 : 0,
                        shadowRadius: 2,
                        elevation: isActive ? 3 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 12,
                          color: isActive ? "white" : "#6B7280",
                        }}
                      >
                        {roleName}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          {isStudent && (
            <View
              style={{
                marginBottom: 40,
                backgroundColor: "#F8FAFC",
                padding: 24,
                borderRadius: 32,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  color: "#1E3A8A",
                  fontSize: 13,
                  marginBottom: 20,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Gán lớp học học sinh
              </Text>

              <FormLabel>Chọn khối lớp</FormLabel>
              <View
                style={{ flexDirection: "row", marginTop: 8, marginBottom: 14 }}
              >
                {[10, 11, 12].map((grade) => (
                  <View
                    key={grade}
                    style={{
                      flex: 1,
                      marginRight: grade === 12 ? 0 : 8,
                      marginBottom: 12,
                    }}
                  >
                    <Pressable
                      onPress={() => setSelectedGrade(grade)}
                      style={{
                        paddingVertical: 12,
                        borderRadius: 16,
                        borderWidth: 1.5,
                        backgroundColor:
                          selectedGrade === grade ? "#2563EB" : "#FFFFFF",
                        borderColor:
                          selectedGrade === grade ? "#2563EB" : "#F1F5F9",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: selectedGrade === grade ? 0.2 : 0.05,
                        shadowRadius: 4,
                        elevation: selectedGrade === grade ? 4 : 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 11,
                          color: selectedGrade === grade ? "white" : "#64748B",
                        }}
                      >
                        Khối {grade}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>

              {selectedGrade && (
                <>
                  <FormLabel>Danh sách lớp</FormLabel>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginTop: 8,
                    }}
                  >
                    {classes
                      .filter((c) => c.grade === selectedGrade)
                      .map((c) => (
                        <View
                          key={c.classYearId}
                          style={{ marginRight: 8, marginBottom: 8 }}
                        >
                          <Pressable
                            onPress={() => set("classYearId", c.classYearId)}
                            style={{
                              paddingHorizontal: 18,
                              paddingVertical: 10,
                              borderRadius: 14,
                              borderWidth: 1,
                              backgroundColor:
                                form.classYearId === c.classYearId
                                  ? "#2563EB"
                                  : "#FFFFFF",
                              borderColor:
                                form.classYearId === c.classYearId
                                  ? "#2563EB"
                                  : "#E2E8F0",
                              elevation:
                                form.classYearId === c.classYearId ? 3 : 1,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Poppins-Bold",
                                fontSize: 11,
                                color:
                                  form.classYearId === c.classYearId
                                    ? "white"
                                    : "#475569",
                              }}
                            >
                              {c.className}
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                  </View>
                </>
              )}
            </View>
          )}

          {isTeacher && (
            <View
              style={{
                marginBottom: 40,
                backgroundColor: "#F5F3FF",
                padding: 24,
                borderRadius: 32,
                borderWidth: 1,
                borderColor: "#EDE9FE",
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  color: "#4C1D95",
                  fontSize: 13,
                  marginBottom: 20,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Chuyên môn giáo viên
              </Text>
              <FormLabel>Chọn môn học giảng dạy</FormLabel>
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
              >
                {subjects.map((s) => (
                  <View
                    key={s.subjectId}
                    style={{ marginRight: 10, marginBottom: 10 }}
                  >
                    <Pressable
                      onPress={() => set("subjectId", s.subjectId)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 16,
                        borderWidth: 1,
                        backgroundColor:
                          form.subjectId === s.subjectId
                            ? "#4F46E5"
                            : "#FFFFFF",
                        borderColor:
                          form.subjectId === s.subjectId
                            ? "#4F46E5"
                            : "#F1F5F9",
                        elevation: form.subjectId === s.subjectId ? 3 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 11,
                          color:
                            form.subjectId === s.subjectId
                              ? "white"
                              : "#6B7280",
                        }}
                      >
                        {s.subjectName}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <FormActionButton
        title="Tạo tài khoản"
        onPress={handleSubmit}
        loading={loading}
      />
    </AdminPageWrapper>
  );
}
