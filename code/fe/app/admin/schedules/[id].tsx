import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { scheduleService } from '../../../services/schedule.service';
import { subjectService } from '../../../services/subject.service';
import { teacherService } from '../../../services/teacher.service';
import { ScheduleDetailItem } from '../../../types/schedule';
import { SubjectResponse } from '../../../types/subject';
import { TeacherListItem } from '../../../types/teacher';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminScheduleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [details, setDetails] = useState<ScheduleDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  // For Adding Period
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachersBySubject, setTeachersBySubject] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherSubjectId, setSelectedTeacherSubjectId] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [finishTime, setFinishTime] = useState('08:45');

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [res, subjectsRes] = await Promise.all([
        scheduleService.getScheduleDetails(id),
        subjectService.getSubjects()
      ]);
      setDetails(Array.isArray(res) ? res : []);
      setSubjects(Array.isArray(subjectsRes) ? subjectsRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const loadTeachersForSubject = async (subId: string) => {
    setSelectedSubjectId(subId);
    try {
      const res = await subjectService.getTeachersBySubject(subId);
      setTeachersBySubject(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPeriod = async () => {
    if (!id || !selectedTeacherSubjectId) {
      Alert.alert('Missing Info', 'Select subject and teacher.');
      return;
    }
    try {
      await scheduleService.createScheduleDetail(id, {
        teacherSubjectId: selectedTeacherSubjectId,
        dayOfWeek: selectedDay,
        startTime: `${startTime}:00`,
        finishTime: `${finishTime}:00`
      });
      Alert.alert('Success', 'Period added!');
      setAssignModal(false);
      fetchDetails();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Conflict detected.');
    }
  };

  const handleDeletePeriod = (detailId: string) => {
    Alert.alert('Delete', 'Delete this period?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await scheduleService.deleteScheduleDetail(detailId);
          fetchDetails();
        } catch (err: any) {
          Alert.alert('Error', 'Deletion failed.');
        }
      }}
    ]);
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#136ADA" />
    </SafeAreaView>
  );

  const filteredDetails = details.filter(d => d.dayOfWeek === selectedDay);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Periods Management</Text>
        <TouchableOpacity onPress={() => setAssignModal(true)}>
           <Ionicons name="add-circle" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <View className="bg-white border-b border-gray-100 py-3">
         <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 flex-row gap-4">
            {DAYS.map((day, idx) => (
               <TouchableOpacity key={day} 
                 onPress={() => setSelectedDay(idx + 1)}
                 className={`px-6 py-2 rounded-2xl border ${selectedDay === idx + 1 ? 'bg-amber-500 border-amber-500' : 'bg-gray-50 border-gray-100'}`}
               >
                  <Text style={{ fontFamily: 'Poppins-Bold', color: selectedDay === idx + 1 ? 'white' : '#6B7280' }}>{day}</Text>
               </TouchableOpacity>
            ))}
         </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
         {/* Period List */}
         <View className="gap-4 pb-20">
            {filteredDetails.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => (
                <View key={item.scheduleDetailId} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex-row items-center justify-between">
                   <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                         <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10, color: '#136ADA' }}>{item.startTime.substring(0, 5)} - {item.finishTime.substring(0, 5)}</Text>
                         </View>
                         <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-base">{item.subjectName}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                         <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                         <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Instructor: {item.teacherName}</Text>
                      </View>
                   </View>
                   <TouchableOpacity onPress={() => handleDeletePeriod(item.scheduleDetailId)}>
                      <Ionicons name="trash-outline" size={20} color="#F43F5E" />
                   </TouchableOpacity>
                </View>
            ))}

            {filteredDetails.length === 0 && (
               <View className="items-center py-20">
                  <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                  <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No periods scheduled for this day</Text>
               </View>
            )}
         </View>
      </ScrollView>

      {/* Add Period Modal */}
      <Modal visible={assignModal} animationType="slide" presentationStyle="pageSheet">
         <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
               <TouchableOpacity onPress={() => setAssignModal(false)}>
                  <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Cancel</Text>
               </TouchableOpacity>
               <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-lg">Add New Period</Text>
               <View className="w-10" />
            </View>

            <ScrollView className="p-6 gap-6" showsVerticalScrollIndicator={false}>
               <View>
                  <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black mb-3">1. Select Subject</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                     {subjects.map(s => (
                        <TouchableOpacity key={s.subjectId} 
                          onPress={() => loadTeachersForSubject(s.subjectId)}
                          className={`px-4 py-2 rounded-2xl border ${selectedSubjectId === s.subjectId ? 'bg-bright-blue border-bright-blue' : 'bg-gray-50 border-gray-100'}`}
                        >
                           <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: selectedSubjectId === s.subjectId ? 'white' : '#6B7280' }}>{s.subjectName}</Text>
                        </TouchableOpacity>
                     ))}
                  </ScrollView>
               </View>

               {selectedSubjectId !== '' && (
                  <View>
                     <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black mb-3">2. Select Teacher</Text>
                     <View className="flex-row flex-wrap gap-2">
                        {teachersBySubject.map(t => (
                           <TouchableOpacity key={t.teacherId} 
                             onPress={() => setSelectedTeacherSubjectId(t.teacherSubjectId)}
                             className={`px-4 py-2 rounded-2xl border ${selectedTeacherSubjectId === t.teacherSubjectId ? 'bg-purple-500 border-purple-500' : 'bg-white border-gray-100'}`}
                           >
                              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 11, color: selectedTeacherSubjectId === t.teacherSubjectId ? 'white' : '#6B7280' }}>{t.fullName}</Text>
                           </TouchableOpacity>
                        ))}
                     </View>
                  </View>
               )}

               <View className="flex-row gap-4">
                  <View className="flex-1">
                     <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black mb-2 text-xs">Start Time</Text>
                     <TextInput 
                        placeholder="08:00"
                        value={startTime}
                        onChangeText={setStartTime}
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-black text-center"
                     />
                  </View>
                  <View className="flex-1">
                     <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black mb-2 text-xs">Finish Time</Text>
                     <TextInput 
                        placeholder="08:45"
                        value={finishTime}
                        onChangeText={setFinishTime}
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-black text-center"
                     />
                  </View>
               </View>

               <TouchableOpacity 
                 className="bg-bright-blue rounded-3xl py-4 items-center mt-6 shadow-xl shadow-blue-200 mb-20"
                 onPress={handleAddPeriod}
               >
                  <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Add Slot</Text>
               </TouchableOpacity>
            </ScrollView>
         </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
