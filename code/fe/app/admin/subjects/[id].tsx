import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { subjectService } from '../../../services/subject.service';
import { teacherService } from '../../../services/teacher.service';
import { SubjectResponse, SubjectTeacherItem } from '../../../types/subject';
import { TeacherListItem } from '../../../types/teacher';

export default function AdminSubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subject, setSubject] = useState<SubjectResponse | null>(null);
  const [teachers, setTeachers] = useState<SubjectTeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    subjectName: '',
    maxPeriod: 0
  });

  // For Teacher Assignment
  const [allTeachers, setAllTeachers] = useState<TeacherListItem[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [sRes, tRes] = await Promise.all([
        subjectService.getSubjectById(id),
        subjectService.getTeachersBySubject(id)
      ]);
      setSubject(sRes);
      setForm({
        subjectName: sRes.subjectName,
        maxPeriod: sRes.maxPeriod
      });
      setTeachers(Array.isArray(tRes) ? tRes : []);
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
    try {
      setSaving(true);
      await subjectService.updateSubject(id, form);
      Alert.alert('Success', 'Subject updated successfully!');
      setEditing(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const openAssignModal = async () => {
    setAssignModal(true);
    try {
      const res = await teacherService.getTeachers({ pageSize: 100 });
      const tdata = Array.isArray(res) ? res : (res as any).items || [];
      setAllTeachers(tdata);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTeacher = async (teacherId: string) => {
    if (!id) return;
    try {
      await subjectService.assignTeacherToSubject(teacherId, id);
      Alert.alert('Success', 'Teacher assigned successfully!');
      setAssignModal(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Assignment failed.');
    }
  };

  const handleRemoveTeacher = (teacherSubjectId: string) => {
     Alert.alert('Unassign', 'Are you sure you want to remove this teacher from this subject?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
           try {
              await subjectService.removeTeacherFromSubject(teacherSubjectId);
              fetchData();
           } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Remove failed');
           }
        }}
     ]);
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Subject Detail</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">
             {editing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View className="bg-white p-6 border-b border-gray-100 items-center">
           <View className="w-16 h-16 rounded-2xl bg-blue-100 items-center justify-center mb-3">
              <Ionicons name="book" size={32} color="#136ADA" />
           </View>
           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-2xl">{subject.subjectName}</Text>
           <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="time" size={12} color="#9CA3AF" />
              <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-sm">{subject.maxPeriod} periods per week</Text>
           </View>
        </View>

        {editing ? (
          <View className="p-6 gap-6">
             <View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">Subject Name</Text>
                <TextInput
                   value={form.subjectName}
                   onChangeText={(t) => setForm({...form, subjectName: t})}
                   className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-black text-base"
                   style={{ fontFamily: 'Poppins-Regular' }}
                />
             </View>
             
             <View>
                <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">Max Periods / Week</Text>
                <TextInput
                   value={form.maxPeriod.toString()}
                   onChangeText={(t) => setForm({...form, maxPeriod: parseInt(t) || 0})}
                   keyboardType="numeric"
                   className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-black text-base"
                   style={{ fontFamily: 'Poppins-Regular' }}
                />
             </View>

             <TouchableOpacity 
               className="bg-bright-blue rounded-3xl py-4 items-center mt-2 shadow-lg shadow-blue-200"
               onPress={handleUpdate}
               disabled={saving}
             >
                {saving ? <ActivityIndicator color="white" /> : (
                   <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Save Changes</Text>
                )}
             </TouchableOpacity>
          </View>
        ) : (
          <View className="p-6">
             <View className="flex-row items-center justify-between mb-4">
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">Assigned Teachers</Text>
                <TouchableOpacity 
                  className="bg-blue-50 px-4 py-2 rounded-full flex-row items-center gap-1"
                  onPress={openAssignModal}
                >
                   <Ionicons name="person-add" size={14} color="#136ADA" />
                   <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 10, color: '#136ADA' }}>Assign</Text>
                </TouchableOpacity>
             </View>

             {teachers.map(t => (
                <View key={t.teacherId} className="bg-white rounded-2xl p-4 border border-gray-50 mb-3 shadow-sm flex-row items-center justify-between">
                   <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center">
                         <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7' }}>{t.fullName.charAt(0)}</Text>
                      </View>
                      <View>
                         <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-sm text-black">{t.fullName}</Text>
                         <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-xs text-gray-400">{t.email}</Text>
                      </View>
                   </View>
                   {t.teacherSubjectId && (
                      <TouchableOpacity onPress={() => handleRemoveTeacher(t.teacherSubjectId!)}>
                         <Ionicons name="close-circle-outline" size={24} color="#F43F5E" />
                      </TouchableOpacity>
                   )}
                </View>
             ))}

             {teachers.length === 0 && (
                <Text className="text-center text-gray-400 py-10 italic">No teachers assigned to this subject</Text>
             )}
          </View>
        )}
      </ScrollView>

      {/* Assign Modal */}
      <Modal visible={assignModal} animationType="slide" presentationStyle="pageSheet">
         <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
               <TouchableOpacity onPress={() => setAssignModal(false)}>
                  <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Close</Text>
               </TouchableOpacity>
               <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-lg text-black">Assign Teacher</Text>
               <View className="w-10" />
            </View>

            <View className="px-6 pt-6">
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-1 mb-4 border border-gray-100">
                   <Ionicons name="search" size={18} color="#9CA3AF" />
                   <TextInput
                      placeholder="Search name..."
                      value={teacherSearch}
                      onChangeText={setTeacherSearch}
                      className="flex-1 ml-2 py-3 text-black text-sm"
                      style={{ fontFamily: 'Poppins-Regular' }}
                   />
                </View>

                <FlatList
                   data={allTeachers.filter(t => t.fullName.toLowerCase().includes(teacherSearch.toLowerCase()))}
                   keyExtractor={t => t.teacherId}
                   renderItem={({ item }) => (
                      <TouchableOpacity 
                        className="flex-row items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl mb-2 shadow-sm"
                        onPress={() => handleAssignTeacher(item.teacherId)}
                      >
                         <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                               <Ionicons name="person" size={20} color="#136ADA" />
                            </View>
                            <View>
                               <Text style={{ fontFamily: 'Poppins-Bold' }}>{item.fullName}</Text>
                               <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">{item.subjectName || 'No Subject'}</Text>
                            </View>
                         </View>
                         <Ionicons name="add-circle" size={24} color="#136ADA" />
                      </TouchableOpacity>
                   )}
                   ListEmptyComponent={<Text className="text-center text-gray-400 py-10">No teachers found</Text>}
                />
            </View>
         </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
