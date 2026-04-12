import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { subjectService } from '../../../services/subject.service';
import { teacherService } from '../../../services/teacher.service';
import { SubjectResponse, SubjectTeacherItem } from '../../../types/subject';
import { TeacherListItem } from '../../../types/teacher';
import { getErrorMessage } from '../../../utils/error';

export default function AdminSubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [subject, setSubject] = useState<SubjectResponse | null>(null);
  const [teachers, setTeachers] = useState<SubjectTeacherItem[]>([]);
  const [allTeachers, setAllTeachers] = useState<TeacherListItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    subjectName: '',
    maxPeriod: ''
  });

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [subRes, teaRes] = await Promise.all([
        subjectService.getSubjectById(id),
        subjectService.getTeachersBySubject(id)
      ]);
      setSubject(subRes);
      
      const teacherData = Array.isArray(teaRes) ? teaRes : (teaRes as any).items || [];
      setTeachers(teacherData);
      
      setEditForm({
        subjectName: subRes.subjectName,
        maxPeriod: subRes.maxPeriod.toString()
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not fetch subject details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAllTeachers = async () => {
    try {
      const res = await teacherService.getTeachers({ PageSize: 100 });
      setAllTeachers(Array.isArray(res) ? res : (res as any).items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleUpdateSubject = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const updated = await subjectService.updateSubject(id, {
        subjectName: editForm.subjectName,
        maxPeriod: parseInt(editForm.maxPeriod) || 0
      });
      setSubject(updated);
      setIsEditing(false);
      Alert.alert('Success', 'Subject updated successfully');
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAssignTeacher = async (teacherId: string) => {
    if (!id) return;
    try {
      setAssignLoading(true);
      await subjectService.assignTeacherToSubject(teacherId, id);
      setShowAssignModal(false);
      await fetchData(); 
      Alert.alert('Success', 'Teacher assigned successfully');
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveTeacher = (teacherSubjectId: string, teacherName: string) => {
    Alert.alert(
      'Remove Teacher',
      `Are you sure you want to remove ${teacherName} from this subject?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await subjectService.removeTeacherFromSubject(teacherSubjectId);
              await fetchData();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            }
          }
        }
      ]
    );
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  if (!subject) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Subject not found</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Premium Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black flex-1">Subject Details</Text>
        <TouchableOpacity 
          onPress={() => setIsEditing(true)}
          className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xs text-[#136ADA]">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
      >
        {/* Hero Identity Section */}
        <View className="px-6 py-8 items-center bg-gray-50/50">
           <View className="w-24 h-24 rounded-[32px] bg-white items-center justify-center shadow-sm border border-gray-100 mb-4">
              <View className="w-20 h-20 rounded-[28px] bg-indigo-500 items-center justify-center">
                 <Ionicons name="book" size={44} color="white" />
              </View>
           </View>
           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-2xl mb-1">{subject.subjectName}</Text>
           <View className="bg-indigo-50 px-4 py-1 rounded-full border border-indigo-100">
              <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-indigo-600 text-[10px] uppercase tracking-wider">ACADEMIC CONTENT</Text>
           </View>
        </View>

        {/* Quick Stats Dashboard */}
        <View className="flex-row px-6 -mt-6">
           <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex-row items-center justify-evenly">
              <View className="items-center">
                 <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#136ADA] text-lg">{teachers.length}</Text>
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-tighter">Teachers</Text>
              </View>
              <View className="w-[1px] h-8 bg-gray-100" />
              <View className="items-center">
                 <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">{subject.maxPeriod}</Text>
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-tighter">Periods/Wk</Text>
              </View>
           </View>
        </View>

        <View className="px-6 pt-10 pb-20">
           {/* Section Header */}
           <View className="flex-row items-center justify-between mb-6 px-1">
              <View>
                 <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl">Faculty Members</Text>
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase">Assigned Educators</Text>
              </View>
              <TouchableOpacity 
                 onPress={() => {
                    fetchAllTeachers();
                    setShowAssignModal(true);
                 }}
                 className="w-10 h-10 rounded-2xl bg-[#136ADA] items-center justify-center shadow-lg shadow-blue-200"
              >
                 <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
           </View>

           {/* Teacher Roll */}
           {teachers.length > 0 ? (
             <View className="gap-4">
               {teachers.map(t => (
                 <View key={t.teacherSubjectId} className="flex-row items-center p-5 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                   <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center mr-4 border border-indigo-100">
                     <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-indigo-600 text-lg">{t.fullName.charAt(0)}</Text>
                   </View>
                   <View className="flex-1 justify-center">
                     <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base leading-tight">{t.fullName}</Text>
                     <Text numberOfLines={1} style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase tracking-tighter">{t.email}</Text>
                   </View>
                   <TouchableOpacity 
                     onPress={() => handleRemoveTeacher(t.teacherSubjectId, t.fullName)}
                     className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center border border-red-100"
                   >
                     <Ionicons name="trash-outline" size={18} color="#EF4444" />
                   </TouchableOpacity>
                 </View>
               ))}
             </View>
           ) : (
             <View className="items-center py-16 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
               <View className="w-16 h-16 rounded-full bg-white items-center justify-center mb-4">
                  <Ionicons name="people-outline" size={32} color="#D1D5DB" />
               </View>
               <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-sm">No teachers assigned as specialists</Text>
             </View>
           )}
        </View>
      </ScrollView>

      {/* Edit Subject Bottom Sheet */}
      <Modal visible={isEditing} animationType="slide" transparent={true}>
         <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] pt-8 px-6 pb-12 shadow-2xl">
               <View className="flex-row items-center justify-between mb-8">
                  <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-2xl">Edit Subject</Text>
                  <TouchableOpacity onPress={() => setIsEditing(false)} className="bg-gray-100 p-2 rounded-full">
                     <Ionicons name="close" size={24} color="gray" />
                  </TouchableOpacity>
               </View>

               <View className="gap-6">
                  <View>
                     <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-900 text-sm mb-2 ml-1">Subject Title</Text>
                     <TextInput
                        value={editForm.subjectName}
                        onChangeText={(t) => setEditForm({...editForm, subjectName: t})}
                        className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-black text-sm"
                        style={{ fontFamily: 'Poppins-Medium' }}
                        placeholder="Enter subject name..."
                     />
                  </View>
                  
                  <View>
                     <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-900 text-sm mb-2 ml-1">Weekly Periods</Text>
                     <TextInput
                        value={editForm.maxPeriod}
                        onChangeText={(t) => setEditForm({...editForm, maxPeriod: t})}
                        keyboardType="numeric"
                        className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-black text-sm"
                        style={{ fontFamily: 'Poppins-Medium' }}
                        placeholder="e.g. 5"
                     />
                  </View>

                  <TouchableOpacity 
                     className="bg-[#136ADA] rounded-3xl py-4 items-center mt-4 shadow-xl shadow-blue-200"
                     onPress={handleUpdateSubject}
                     disabled={saving}
                  >
                     {saving ? <ActivityIndicator color="white" /> : (
                        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Update Module</Text>
                     )}
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>

      {/* Assign Teacher Bottom Sheet */}
      <Modal visible={showAssignModal} animationType="slide" transparent={true}>
         <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] h-[80%] pt-8 px-6">
               <View className="flex-row items-center justify-between mb-6">
                  <View>
                     <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-2xl">Select Faculty</Text>
                     <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-xs uppercase">Available Specialists</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowAssignModal(false)} className="bg-gray-100 p-2 rounded-full">
                     <Ionicons name="close" size={24} color="gray" />
                  </TouchableOpacity>
               </View>

               <FlatList
                  data={allTeachers.filter(at => !teachers.some(t => t.teacherId === at.teacherId))}
                  keyExtractor={(item) => item.teacherId}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  renderItem={({ item }) => (
                     <View className="flex-row items-center p-4 bg-gray-50/50 rounded-[32px] border border-gray-100 mb-4">
                        <View className="w-12 h-12 rounded-2xl bg-white border border-gray-100 items-center justify-center mr-4">
                           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-[#136ADA] text-lg">{item.fullName.charAt(0)}</Text>
                        </View>
                        <View className="flex-1">
                           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm">{item.fullName}</Text>
                           <Text numberOfLines={1} style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 text-[10px] uppercase">
                              {item.subjectNames?.join(" • ") || "General Faculty"}
                           </Text>
                        </View>
                        <TouchableOpacity 
                           onPress={() => handleAssignTeacher(item.teacherId)}
                           disabled={assignLoading}
                           className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center border border-blue-100"
                        >
                           {assignLoading ? <ActivityIndicator size="small" color="#136ADA" /> : (
                              <Ionicons name="add" size={24} color="#136ADA" />
                           )}
                        </TouchableOpacity>
                     </View>
                  )}
                  ListEmptyComponent={
                     <View className="items-center py-20">
                        <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-4 text-center px-10">No additional teachers found for assignment</Text>
                     </View>
                  }
               />
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}
