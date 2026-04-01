import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { scheduleService } from '../../../services/schedule.service';
import { classYearService } from '../../../services/classYear.service';
import { ClassYearResponse } from '../../../types/classYear';

export default function AdminCreateScheduleScreen() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    name: '',
    classYearId: '',
    term: '1',
    schoolYear: '2026',
    isActive: true
  });

  const fetchClasses = async () => {
    try {
      setFetching(true);
      const res = await classYearService.getClassYears({ schoolYear: '2026' });
      const cdata = Array.isArray(res) ? res : (res as any).items || [];
      setClasses(cdata);
      if (cdata.length > 0) setForm(f => ({ ...f, classYearId: cdata[0].classYearId }));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async () => {
    if (!form.classYearId || !form.schoolYear) {
      Alert.alert('Missing Info', 'Class and School Year are required.');
      return;
    }

    try {
      setLoading(true);
      await scheduleService.createSchedule(form);
      Alert.alert('Success', 'Schedule created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Creation failed.');
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">Create Schedule</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        <View className="gap-8 pb-40">
           <View className="items-center mb-2">
              <View className="w-20 h-20 bg-amber-50 items-center justify-center rounded-3xl">
                 <Ionicons name="calendar-outline" size={40} color="#D97706" />
              </View>
           </View>

           <View>
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">Schedule Name (Optional)</Text>
              <TextInput
                placeholder="e.g. Timetable Term 1 - 10A1"
                value={form.name}
                onChangeText={(t) => setForm({...form, name: t})}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black text-base"
                style={{ fontFamily: 'Poppins-Regular' }}
                placeholderTextColor="#9CA3AF"
              />
           </View>

           <View>
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-2 ml-1">Select Class *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                 {classes.map(c => (
                    <TouchableOpacity key={c.classYearId} 
                      onPress={() => setForm({...form, classYearId: c.classYearId})}
                      className={`px-6 py-3 rounded-2xl border ${form.classYearId === c.classYearId ? 'bg-bright-blue border-bright-blue shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}
                    >
                       <Text style={{ fontFamily: 'Poppins-Bold', color: form.classYearId === c.classYearId ? 'white' : '#6B7280' }}>{c.className}</Text>
                    </TouchableOpacity>
                 ))}
                 {classes.length === 0 && <Text className="text-gray-400 text-xs italic">No classes found</Text>}
              </ScrollView>
           </View>

           <View className="flex-row gap-4">
              <View className="flex-1">
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">Term *</Text>
                 <View className="flex-row gap-2">
                    {['1', '2'].map(t => (
                       <TouchableOpacity key={t} 
                         onPress={() => setForm({...form, term: t})}
                         className={`flex-1 py-4 rounded-2xl border items-center ${form.term === t ? 'bg-indigo-500 border-indigo-500 shadow-md' : 'bg-gray-50 border-gray-200'}`}
                       >
                          <Text style={{ fontFamily: 'Poppins-Bold', color: form.term === t ? 'white' : '#6B7280' }}>{t}</Text>
                       </TouchableOpacity>
                    ))}
                 </View>
              </View>
              <View className="flex-1">
                 <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 ml-1">School Year *</Text>
                 <TextInput
                   placeholder="2026"
                   value={form.schoolYear}
                   onChangeText={(t) => setForm({...form, schoolYear: t})}
                   className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black text-base text-center"
                   style={{ fontFamily: 'Poppins-Regular' }}
                 />
              </View>
           </View>

           <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-3xl border border-gray-100">
              <View className="flex-row items-center gap-3">
                 <Ionicons name="flash-outline" size={24} color="#136ADA" />
                 <View>
                    <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm">Activate Now</Text>
                    <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-[10px]">Set as the primary schedule for this class</Text>
                 </View>
              </View>
              <Switch 
                value={form.isActive}
                onValueChange={(v) => setForm({...form, isActive: v})}
                trackColor={{ false: '#D1D5DB', true: '#136ADA' }}
                thumbColor="white"
              />
           </View>

           <TouchableOpacity 
             className="bg-bright-blue rounded-3xl py-4 items-center mt-4 shadow-xl shadow-blue-200"
             onPress={handleSubmit}
             disabled={loading}
           >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">Initialize Schedule</Text>
              )}
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
