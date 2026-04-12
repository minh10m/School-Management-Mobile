import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { classYearService } from '../../../services/classYear.service';
import { teacherService } from '../../../services/teacher.service';
import { studentService } from '../../../services/student.service';
import { ClassYearResponse } from '../../../types/classYear';
import { TeacherListItem } from '../../../types/teacher';
import { StudentListItem } from '../../../types/student';
import { getErrorMessage } from '../../../utils/error';

export default function AdminClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [classData, setClassData] = useState<ClassYearResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [studentsInClass, setStudentsInClass] = useState<StudentListItem[]>([]);
  
  // Form for Edit
  const [form, setForm] = useState({
    className: '',
    grade: 0,
    schoolYear: 0,
    homeRoomId: ''
  });


  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await classYearService.getClassYearById(id);
      const [teaRes, studentsRes, allClassesRes] = await Promise.all([
        teacherService.getTeachers({ PageSize: 100 }),
        studentService.getStudents({ ClassName: res.className, PageSize: 100 }),
        classYearService.getClassYears()
      ]);
      setClassData(res);
      setForm({
        className: res.className,
        grade: res.grade,
        schoolYear: res.schoolYear,
        homeRoomId: res.homeRoomId || ''
      });
      let tdata: TeacherListItem[] = Array.isArray(teaRes) ? teaRes : (teaRes as any).items || [];
      const sdata = Array.isArray(studentsRes) ? studentsRes : (studentsRes as any).items || [];
      const cdata = Array.isArray(allClassesRes) ? allClassesRes : (allClassesRes as any).items || [];

      // Workaround: Filter out teachers already assigned to OTHER classes to prevent DB 500 constraint Error
      const usedTeacherIds = new Set(
         cdata.map((c: any) => c.homeRoomId).filter((tid: string) => tid && tid !== res.homeRoomId)
      );
      tdata = tdata.filter(t => !usedTeacherIds.has(t.teacherId));

      setTeachers(tdata);
      setStudentsInClass(sdata);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    
    if (!form.className.trim()) {
      Alert.alert('Lỗi xác thực', 'Tên lớp không được để trống.');
      return;
    }
    if (!form.homeRoomId) {
      Alert.alert('Lỗi xác thực', 'Vui lòng chọn Giáo viên Chủ nhiệm.');
      return;
    }

    try {
      await classYearService.updateClassYear(id, {
        ...form,
        schoolYear: parseInt(String(form.schoolYear), 10)
      });
      Alert.alert('Thành công', 'Cập nhật lớp học thành công!');
      setEditing(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };


  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  if (!classData) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Không tìm thấy lớp học</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black flex-1">Chi tiết Lớp học</Text>
        <TouchableOpacity 
          onPress={() => setEditing(!editing)}
          className={`px-4 py-1.5 rounded-full ${editing ? 'bg-gray-100' : 'bg-blue-50 border border-blue-100'}`}
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className={`text-xs ${editing ? 'text-gray-500' : 'text-[#136ADA]'}`}>{editing ? 'Hủy' : 'Chỉnh sửa'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Identity Card */}
        <View className="px-6 py-8 items-center bg-gray-50/50">
           <View className="w-24 h-24 rounded-[32px] bg-white items-center justify-center shadow-sm border border-gray-100 mb-4">
              <View className="w-20 h-20 rounded-[28px] bg-[#136ADA] items-center justify-center">
                 <Ionicons name="school" size={44} color="white" />
              </View>
           </View>
           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-2xl mb-1">{classData.className}</Text>
           <View className="bg-blue-50 px-4 py-1 rounded-full border border-blue-100">
              <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#136ADA] text-[10px]">KHỐI {classData.grade}</Text>
           </View>
        </View>

        {/* Stats Section Bar */}
        <View className="flex-row px-6 -mt-6">
           <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex-row items-center justify-evenly">
              <View className="items-center">
                 <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#136ADA] text-lg">{studentsInClass.length}</Text>
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-tighter">Học sinh</Text>
              </View>
              <View className="w-[1px] h-8 bg-gray-100" />
              <View className="items-center">
                 <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">{classData.schoolYear ? String(classData.schoolYear).split('-')[0] : 'N/A'}</Text>
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-tighter">Năm học</Text>
              </View>
           </View>
        </View>

        {editing ? (
          <View className="p-8 gap-6">
             <View>
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-900 text-sm mb-2 ml-1">Tên Lớp</Text>
                <TextInput
                   value={form.className}
                   onChangeText={(t) => setForm({...form, className: t})}
                   className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-black text-sm"
                   style={{ fontFamily: 'Poppins-Medium' }}
                   placeholder="Nhập tên lớp..."
                />
             </View>
             
             <View>
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-900 text-sm mb-3 ml-1">Khối lớp</Text>
                <View className="flex-row gap-3">
                   {[10, 11, 12].map(g => (
                      <TouchableOpacity key={g} 
                        onPress={() => setForm({...form, grade: g})}
                        className={`flex-1 py-4 rounded-2xl border items-center ${form.grade === g ? 'bg-[#136ADA] border-[#136ADA]' : 'bg-white border-gray-100'}`}
                      >
                         <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: form.grade === g ? 'white' : '#6B7280' }}>{g}</Text>
                      </TouchableOpacity>
                   ))}
                </View>
             </View>

             <View>
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-900 text-sm mb-3 ml-1 text-center">Chọn Chủ nhiệm</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                   {teachers.map(t => (
                      <TouchableOpacity key={t.teacherId} 
                        onPress={() => setForm({...form, homeRoomId: t.teacherId})}
                        className={`mr-3 px-6 py-3 rounded-2xl border items-center ${form.homeRoomId === t.teacherId ? 'bg-indigo-500 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}
                      >
                         <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 12, color: form.homeRoomId === t.teacherId ? 'white' : '#9CA3AF' }}>
                            {t.fullName}
                         </Text>
                      </TouchableOpacity>
                   ))}
                </ScrollView>
             </View>

             <TouchableOpacity 
               className="bg-[#136ADA] rounded-3xl py-4 items-center mt-4 shadow-xl shadow-blue-200"
               onPress={handleUpdate}
             >
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Lưu Cấu hình</Text>
             </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 py-10">
             {/* Advisor Information Card */}
             <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-400 text-[10px] uppercase tracking-widest mb-4 ml-1">Thông tin Chủ nhiệm</Text>
             <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => {
                  if (classData.homeRoomId) {
                    router.push(`/admin/teachers/${classData.homeRoomId}` as any);
                  }
                }}
                className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm mb-10 flex-row items-center gap-4"
             >
                <View className="w-14 h-14 rounded-2xl bg-purple-50 items-center justify-center border border-purple-100">
                   <Ionicons name="medal-outline" size={28} color="#A855F7" />
                </View>
                <View className="flex-1">
                   <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">
                     {classData.homeRoomTeacher || (classData.homeRoomId ? teachers.find(t => t.teacherId === classData.homeRoomId)?.fullName : null) || 'Chưa phân công'}
                   </Text>
                   <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs text-uppercase">Giáo viên Chủ nhiệm</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#E5E7EB" />
             </TouchableOpacity>

             {/* Students List Roll */}
             <View className="flex-row items-center justify-between mb-6 px-1">
                <View>
                   <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl">Danh sách Lớp</Text>
                   <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-tighter">{studentsInClass.length} HỌC SINH ĐÃ NHẬP HỌC</Text>
                </View>
             </View>

             {studentsInClass.length > 0 ? (
               <View className="gap-3">
                 {studentsInClass.map(s => (
                   <View key={s.studentId} className="flex-row items-center p-5 bg-white border border-gray-100 rounded-[28px] shadow-sm">
                     <View className="w-11 h-11 rounded-2xl bg-blue-50 items-center justify-center mr-4 border border-blue-100">
                       <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#136ADA] text-lg">{s.fullName.charAt(0)}</Text>
                     </View>
                     <View className="flex-1 justify-center">
                       <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base leading-tight">{s.fullName}</Text>
                       <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-tighter">Học sinh</Text>
                     </View>
                     <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                   </View>
                 ))}
               </View>
             ) : (
               <View className="items-center py-12 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                 <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-4">Chưa có học sinh trong lớp này</Text>
               </View>
             )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
