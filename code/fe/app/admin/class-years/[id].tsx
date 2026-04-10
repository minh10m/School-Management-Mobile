import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
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
    schoolYear: '',
    homeRoomId: ''
  });


  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await classYearService.getClassYearById(id);
      const [teaRes, studentsRes, allClassesRes] = await Promise.all([
        teacherService.getTeachers({ pageSize: 100 }),
        studentService.getStudents({ className: res.className, pageSize: 100 }),
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
      Alert.alert('Validation Error', 'Class Name is required.');
      return;
    }
    if (!form.homeRoomId) {
      Alert.alert('Validation Error', 'Please select an Advisor (Homeroom Teacher).');
      return;
    }

    try {
      await classYearService.updateClassYear(id, form);
      Alert.alert('Success', 'Class updated successfully!');
      setEditing(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Update failed.');
    }
  };


  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  if (!classData) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Class not found</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Class Detail</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">
             {editing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Detail Card */}
        <View className="bg-white p-6 border-b border-gray-100 items-center">
           <View className="w-20 h-20 rounded-3xl bg-blue-100 items-center justify-center mb-3">
              <Ionicons name="school" size={40} color="#136ADA" />
           </View>
           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-2xl">{classData.className}</Text>
           <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-sm">Grade {classData.grade} • Year {classData.schoolYear}</Text>
        </View>

        {editing ? (
          <View className="p-6 gap-4">
             <View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1">Class Name</Text>
                <TextInput
                   value={form.className}
                   onChangeText={(t) => setForm({...form, className: t})}
                   className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-black"
                   style={{ fontFamily: 'Poppins-Regular' }}
                />
             </View>
             
             <View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1">Grade</Text>
                <View className="flex-row gap-2">
                   {[10, 11, 12].map(g => (
                      <TouchableOpacity key={g} 
                        onPress={() => setForm({...form, grade: g})}
                        className={`flex-1 py-3 rounded-2xl border items-center ${form.grade === g ? 'bg-bright-blue border-bright-blue' : 'bg-white border-gray-200'}`}
                      >
                         <Text style={{ fontFamily: 'Poppins-SemiBold', color: form.grade === g ? 'white' : '#6B7280' }}>{g}</Text>
                      </TouchableOpacity>
                   ))}
                </View>
             </View>

             <View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1">Advisor (Teacher)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                   {teachers.map(t => (
                      <TouchableOpacity key={t.teacherId} 
                        onPress={() => setForm({...form, homeRoomId: t.teacherId})}
                        className={`px-4 py-2 rounded-2xl border items-center ${form.homeRoomId === t.teacherId ? 'bg-indigo-500 border-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                      >
                         <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: form.homeRoomId === t.teacherId ? 'white' : '#6B7280' }}>
                            {t.fullName}
                         </Text>
                      </TouchableOpacity>
                   ))}
                </ScrollView>
             </View>

             <TouchableOpacity 
               className="bg-bright-blue rounded-3xl py-4 items-center mt-2 shadow-lg shadow-blue-200"
               onPress={handleUpdate}
             >
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white">Save Changes</Text>
             </TouchableOpacity>
          </View>
        ) : (
          <View className="p-6">
             <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-400 text-[10px] uppercase tracking-wider mb-2">Homeroom Teacher</Text>
                <View className="flex-row items-center gap-3">
                   <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                      <Ionicons name="person" size={20} color="#A855F7" />
                   </View>
                   <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">
                     {classData.homeRoomTeacher || (classData.homeRoomId ? teachers.find(t => t.teacherId === classData.homeRoomId)?.fullName : null) || 'Not Assigned'}
                   </Text>
                </View>
             </View>

             <View className="flex-row items-center justify-between mb-4 px-2">
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-base">Students ({studentsInClass.length})</Text>
             </View>

             {studentsInClass.length > 0 ? (
               <View className="gap-2">
                 {studentsInClass.map(s => (
                   <View key={s.studentId} className="flex-row items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                     <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                       <Ionicons name="person" size={20} color="#136ADA" />
                     </View>
                     <View className="justify-center">
                       <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">{s.fullName}</Text>
                     </View>
                   </View>
                 ))}
               </View>
             ) : (
               <View className="items-center py-6">
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">No students assigned yet</Text>
               </View>
             )}


          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
