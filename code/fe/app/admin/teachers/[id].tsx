import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { teacherService } from '../../../services/teacher.service';
import { subjectService } from '../../../services/subject.service';
import { teacherSubjectService } from '../../../services/teacherSubject.service';
import { TeacherResponse, TeacherSubject } from '../../../types/teacher';
import { SubjectResponse } from '../../../types/subject';
import { getErrorMessage } from '../../../utils/error';

export default function AdminTeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [teacher, setTeacher] = useState<TeacherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Subject management state
  const [assignedSubjects, setAssignedSubjects] = useState<TeacherSubject[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectResponse[]>([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthday: '',
  });

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [res, subjects, availableSubjects] = await Promise.all([
        teacherService.getTeacherById(id),
        teacherService.getTeacherSubjects(id),
        subjectService.getSubjects()
      ]);
      
      setTeacher(res);
      setAssignedSubjects(subjects);
      setAllSubjects(Array.isArray(availableSubjects) ? availableSubjects : []);
      
      setForm({
        fullName: res.fullName || '',
        email: res.email || '',
        phoneNumber: res.phoneNumber || '',
        address: res.address || '',
        birthday: res.birthday ? res.birthday.split('T')[0] : '',
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not fetch teacher details');
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
      const updated = await teacherService.updateTeacher(id, {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        birthday: form.birthday || undefined,
      });
      setTeacher(updated);
      setIsEditing(false);
      Alert.alert('Success', 'Teacher details updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSubject = async (subjectId: string) => {
    if (!id) return;
    try {
      setSubjectLoading(true);
      await teacherSubjectService.assignSubject({ teacherId: id, subjectId });
      // Refresh subjects
      const updated = await teacherService.getTeacherSubjects(id);
      setAssignedSubjects(updated);
      setShowSubjectModal(false);
      Alert.alert('Success', 'Subject assigned successfully!');
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleRemoveSubject = (teacherSubjectId: string, subjectName: string) => {
    Alert.alert(
      'Remove Subject',
      `Are you sure you want to remove "${subjectName}" from this teacher?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubjectLoading(true);
              await teacherSubjectService.removeSubject(teacherSubjectId);
              // Refresh subjects
              const updated = await teacherService.getTeacherSubjects(id!);
              setAssignedSubjects(updated);
            } catch (err: any) {
              Alert.alert('Error', getErrorMessage(err));
            } finally {
              setSubjectLoading(false);
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

  if (!teacher) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Teacher not found</Text>
    </SafeAreaView>
  );

  const InfoRow = ({ label, value, icon }: any) => (
    <View className="flex-row items-center p-4 border-b border-gray-50 bg-white">
      <View className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#9CA3AF" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px] uppercase tracking-wider">{label}</Text>
        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm">{value || 'N/A'}</Text>
      </View>
    </View>
  );

  const EditField = ({ label, value, onChangeText, keyboardType = 'default' }: any) => (
    <View className="mb-4">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType as any}
        className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-black text-sm"
        style={{ fontFamily: 'Poppins-Regular' }}
        placeholderTextColor="#9CA3AF"
      />
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
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">
             {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white items-center py-8 border-b border-gray-100">
           <View className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center mb-4 border-4 border-white shadow-sm">
              <Text style={{ fontFamily: 'Poppins-Bold', color: '#A855F7', fontSize: 36 }}>{teacher.fullName.charAt(0)}</Text>
           </View>
           <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl">{teacher.fullName}</Text>
        </View>

        {isEditing ? (
          <View className="p-6">
            <EditField label="Full Name" value={form.fullName} onChangeText={(t: string) => setForm({...form, fullName: t})} />
            <EditField label="Email" value={form.email} onChangeText={(t: string) => setForm({...form, email: t})} keyboardType="email-address" />
            <EditField label="Phone" value={form.phoneNumber} onChangeText={(t: string) => setForm({...form, phoneNumber: t})} keyboardType="phone-pad" />
            <EditField label="Address" value={form.address} onChangeText={(t: string) => setForm({...form, address: t})} />
            <EditField label="Birthday (YYYY-MM-DD)" value={form.birthday} onChangeText={(t: string) => setForm({...form, birthday: t})} placeholder="1980-05-15" />

            <TouchableOpacity 
              className="bg-bright-blue rounded-3xl py-4 items-center mt-4 shadow-md shadow-blue-200"
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="white" /> : (
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-4">
             <View className="px-6 py-2">
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-400 text-[10px] uppercase tracking-wider">Basic Information</Text>
             </View>
             <InfoRow label="Email" value={teacher.email} icon="mail-outline" />
             <InfoRow label="Phone" value={teacher.phoneNumber} icon="call-outline" />
             <InfoRow label="Address" value={teacher.address} icon="location-outline" />
             <InfoRow label="Birthday" value={teacher.birthday ? new Date(teacher.birthday).toLocaleDateString('en-GB') : 'N/A'} icon="calendar-outline" />
             <InfoRow label="User ID" value={teacher.userId} icon="finger-print-outline" />

             {/* Subject Management Section */}
             <View className="px-6 py-4 mt-2">
                <View className="flex-row justify-between items-center mb-3">
                   <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-400 text-[10px] uppercase tracking-wider">Teaching Subjects</Text>
                   <TouchableOpacity 
                    onPress={() => setShowSubjectModal(true)}
                    className="bg-bright-blue/10 px-3 py-1 rounded-full items-center"
                   >
                      <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 11, color: '#136ADA' }}>Assign</Text>
                   </TouchableOpacity>
                </View>

                {subjectLoading && assignedSubjects.length === 0 ? (
                  <ActivityIndicator size="small" color="#136ADA" />
                ) : assignedSubjects.length === 0 ? (
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs italic">No subjects assigned</Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {assignedSubjects.map(sub => (
                      <View key={sub.teacherSubjectId} className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 flex-row items-center">
                        <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 13, color: '#9333EA' }} className="mr-2">{sub.subjectName}</Text>
                        <TouchableOpacity onPress={() => handleRemoveSubject(sub.teacherSubjectId, sub.subjectName)}>
                          <Ionicons name="close-circle" size={16} color="#A855F7" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
             </View>
          </View>
        )}
      </ScrollView>

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] h-[60%] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-xl">Assign Subject</Text>
              <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={allSubjects.filter(sub => !assignedSubjects.some(a => a.subjectId === sub.subjectId))}
              keyExtractor={item => item.subjectId}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAssignSubject(item.subjectId)}
                  className="flex-row items-center py-4 border-b border-gray-50"
                  disabled={subjectLoading}
                >
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
                    <Ionicons name="book-outline" size={20} color="#136ADA" />
                  </View>
                  <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-base flex-1">{item.subjectName}</Text>
                  <Ionicons name="add-circle-outline" size={24} color="#136ADA" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center py-10">
                   <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400">All subjects have been assigned</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
