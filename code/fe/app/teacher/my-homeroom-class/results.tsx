import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { resultService } from '../../../services/result.service';
import { classYearService } from '../../../services/classYear.service';
import { StudentResultForTeacherResponse } from '../../../types/result';
import { useConfigStore } from '../../../store/configStore';

export default function HomeroomResultsScreen() {
  const { schoolYear, term: globalTerm } = useConfigStore();
  const [homeroomClass, setHomeroomClass] = useState<any>(null);
  const [term, setTerm] = useState<number>(globalTerm);
  const [termModalVisible, setTermModalVisible] = useState(false);
  const [results, setResults] = useState<StudentResultForTeacherResponse[]>([]);
  const [allSubjectsInClass, setAllSubjectsInClass] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHomeroomInfo();
  }, [schoolYear]);

  useEffect(() => {
    if (homeroomClass?.classYearId) {
      fetchResults();
    }
  }, [homeroomClass, term]);

  useEffect(() => {
    if (Array.isArray(results) && results.length > 0) {
      const subjectMap = new Map<string, string>();
      results.forEach(student => {
        if (student.subjectResults && Array.isArray(student.subjectResults)) {
            student.subjectResults.forEach(sub => {
              subjectMap.set(sub.subjectId, sub.subjectName);
            });
        }
      });
      const uniqueSubjects = Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
      setAllSubjectsInClass(uniqueSubjects);
    } else {
      setAllSubjectsInClass([]);
    }
  }, [results]);

  const fetchHomeroomInfo = async () => {
    try {
      setLoading(true);
      const hr = await classYearService.getHomeroomClass(schoolYear);
      if (hr) {
        setHomeroomClass(hr);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching homeroom info:', error);
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    if (!homeroomClass?.classYearId) return;
    try {
      setLoading(true);
      const data = await resultService.getClassResults(homeroomClass.classYearId, { term: term });
      setResults(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching class results:', error);
      if (error.response?.status === 403) {
          Alert.alert('Truy cập bị từ chối', 'Hệ thống báo thầy không phải giáo viên chủ nhiệm của lớp này.');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchResults();
    setRefreshing(false);
  }, [homeroomClass, term]);

  const getClassStats = () => {
    const totalStudents = Array.isArray(results) ? results.length : 0;
    const totalSubjects = allSubjectsInClass.length;
    let totalScore = 0;
    let scoreCount = 0;
    if (Array.isArray(results)) {
        results.forEach(s => {
          if (s.subjectResults && Array.isArray(s.subjectResults)) {
              s.subjectResults.forEach(sub => {
                totalScore += sub.average;
                scoreCount++;
              });
          }
        });
    }
    const classAverage = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '0.0';
    return { totalStudents, totalSubjects, classAverage };
  };

  const { totalStudents, totalSubjects, classAverage } = getClassStats();

  if (loading && !refreshing && !homeroomClass) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#136ADA" />
        <Text className="mt-4 text-gray-400" style={{ fontFamily: 'Poppins-Regular' }}>Đang tải dữ liệu lớp chủ nhiệm...</Text>
      </View>
    );
  }

  if (!homeroomClass && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
        <Text className="text-xl mt-4 text-center" style={{ fontFamily: 'Poppins-Bold' }}>Không tìm thấy lớp chủ nhiệm</Text>
        <Text className="text-gray-400 text-center mt-2" style={{ fontFamily: 'Poppins-Regular' }}>Thầy có thể liên hệ quản trị viên để cập nhật thông tin lớp chủ nhiệm năm học {schoolYear} ạ.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-blue-600 px-8 py-3 rounded-2xl">
          <Text className="text-white" style={{ fontFamily: 'Poppins-Bold' }}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <View className="items-center">
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">Bảng điểm lớp {homeroomClass?.className}</Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1" 
        stickyHeaderIndices={[0]} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
      >
        <View className="bg-white pb-4 border-b border-gray-100">
          <View className="flex-row px-6 gap-3 pt-6 mb-4">
            <StatCard label="Học sinh" value={totalStudents} color="text-gray-800" bg="bg-white" />
            <StatCard label="Điểm TB Lớp" value={classAverage} color="text-[#0D9488]" bg="bg-white" />
            <StatCard label="Môn học" value={totalSubjects} color="text-gray-800" bg="bg-white" />
          </View>

          <View className="px-6 flex-row items-center justify-between">
            <Text className="text-gray-400 text-[10px] uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Chi tiết điểm số</Text>
            <TouchableOpacity 
                onPress={() => setTermModalVisible(true)}
                className="flex-row bg-gray-100 rounded-xl px-3 py-1.5 items-center gap-2"
            >
              <Text className="text-[10px] text-blue-600" style={{ fontFamily: 'Poppins-Bold' }}>Học kỳ {term}</Text>
              <Ionicons name="chevron-down" size={10} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 pt-6 pb-20">
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#136ADA" className="py-20" />
          ) : results.length === 0 ? (
            <View className="py-20 items-center">
              <Ionicons name="clipboard-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4" style={{ fontFamily: 'Poppins-Regular' }}>Chưa có dữ liệu điểm số học kỳ này</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <View className="bg-white">
                <View className="flex-row items-center bg-blue-50/50 border-b border-gray-100 py-4">
                  <View className="w-40 px-6">
                    <Text className="text-gray-500 text-[10px] uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Học sinh</Text>
                  </View>
                  {allSubjectsInClass.map(sub => (
                    <View key={sub.id} className="w-28 items-center border-l border-gray-100">
                      <Text className="text-gray-500 text-[10px] uppercase tracking-widest text-center" style={{ fontFamily: 'Poppins-Bold' }}>{sub.name}</Text>
                    </View>
                  ))}
                </View>

                {results.map((student) => (
                  <View key={student.studentId} className="flex-row items-center border-b border-gray-100 py-4">
                    <View className="w-40 px-6">
                      <Text className="text-gray-800 text-sm" style={{ fontFamily: 'Poppins-Bold' }}>{student.studentName}</Text>
                    </View>
                    {allSubjectsInClass.map(sub => {
                      const subjectResult = Array.isArray(student.subjectResults) ? student.subjectResults.find(r => r.subjectId === sub.id) : null;
                      const avg = subjectResult?.average || 0;
                      return (
                        <TouchableOpacity key={sub.id} className="w-28 items-center border-l border-gray-100" onPress={() => router.push(`/teacher/manage-result?studentId=${student.studentId}&classYearId=${homeroomClass?.classYearId}&subjectId=${sub.id}&term=${term}` as any)}>
                          {subjectResult ? (
                            <ScoreBadge value={avg} />
                          ) : (
                            <Text className="text-gray-300">—</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Term Selection Modal (Dropdown) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={termModalVisible}
        onRequestClose={() => setTermModalVisible(false)}
      >
        <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setTermModalVisible(false)}
            className="flex-1 bg-black/20 justify-center items-center px-10"
        >
            <View className="bg-white w-full rounded-[32px] p-6 shadow-2xl overflow-hidden">
                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-gray-800 text-base mb-6 text-center">Chọn học kỳ</Text>
                {[1, 2].map((t) => (
                    <TouchableOpacity 
                        key={t}
                        onPress={() => {
                            setTerm(t);
                            setTermModalVisible(false);
                        }}
                        className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${term === t ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent'}`}
                    >
                        <View className="flex-row items-center">
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${term === t ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-[10px]">{t}</Text>
                            </View>
                            <Text style={{ fontFamily: 'Poppins-Bold' }} className={`text-sm ${term === t ? 'text-blue-600' : 'text-gray-500'}`}>Học kỳ {t}</Text>
                        </View>
                        {term === t && <Ionicons name="checkmark-circle" size={20} color="#136ADA" />}
                    </TouchableOpacity>
                ))}
            </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, bg }: any) {
  return (
    <View className={`flex-1 rounded-2xl p-4 py-5 ${bg} items-center border border-gray-100 shadow-sm`}>
      <Text className="text-gray-400 text-[10px] uppercase mb-1" style={{ fontFamily: 'Poppins-Medium' }}>{label}</Text>
      <Text className={`text-2xl ${color}`} style={{ fontFamily: 'Poppins-Bold' }}>{value}</Text>
    </View>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const getColors = () => {
    if (value >= 8.5) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    if (value >= 8.0) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (value >= 5.0) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
  };
  const colors = getColors();
  return (
    <View className={`px-3 py-1 rounded-full border ${colors.bg} ${colors.border}`}>
      <Text className={`text-xs ${colors.text}`} style={{ fontFamily: 'Poppins-Bold' }}>
        {value.toFixed(1)}
      </Text>
    </View>
  );
}
