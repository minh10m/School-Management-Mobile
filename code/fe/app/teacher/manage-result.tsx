import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { resultService } from '../../services/result.service';
import { StudentResultSubject, CreateResultRequest, UpdateResultPayload } from '../../types/result';
import { SCHOOL_YEAR } from '../../constants/config';
import { getErrorMessage } from '../../utils/error';

export default function ManageStudentResult() {
  const { studentId, studentName, classYearId, subjectId, term } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<StudentResultSubject | null>(null);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResult, setEditingResult] = useState<any | null>(null);
  const [formType, setFormType] = useState('Thường xuyên');
  const [formValue, setFormValue] = useState('');
  const [formWeight, setFormWeight] = useState('1');

  // ─── Lifecycle & Data Fetching ──────────────────────────────────────────────

  useEffect(() => {
    fetchData();
  }, [studentId, classYearId, subjectId, term]);

  /**
   * Fetches detailed results for a specific student, class, and term.
   */
  const fetchData = async () => {
    if (!classYearId || !studentId || !term) {
      console.warn('[AGENT] Missing required parameters for fetchData:', { classYearId, studentId, term });
      return;
    }
    try {
      setLoading(true);
      const data = await resultService.getOneStudentResultForTeacher(
        classYearId as string,
        studentId as string,
        { term: Number(term) }
      );
      
      if (subjectId) {
        // Show specific subject
        const subjectResult = data.find(r => r.subjectId === subjectId);
        setResults(subjectResult || null);
      } else {
        // [AGENT] If no subjectId provided (from Admin), default to first subject
        if (data.length > 0) {
            setResults(data[0]);
        }
      }
    } catch (error) {
      console.error('[AGENT] Error fetching student result:', error);
      Alert.alert('Lỗi', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves a new grade entry or updates an existing one.
   */
  const handleSave = async () => {
    if (!formValue || isNaN(Number(formValue))) {
      Alert.alert('Lỗi', 'Vui lòng nhập điểm số hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const commonPayload = {
        type: formType,
        value: Number(formValue),
        weight: Number(formWeight),
        term: Number(term),
        schoolYear: Number(SCHOOL_YEAR)
      };

      if (editingResult && editingResult.resultId) {
        // [UPDATE]
        await resultService.updateResult(editingResult.resultId, commonPayload as UpdateResultPayload);
        Alert.alert('Thành công', 'Đã cập nhật điểm số');
      } else {
        // [CREATE]
        const payload: CreateResultRequest = {
          ...commonPayload,
          studentId: studentId as string,
          subjectId: subjectId as string,
        };
        await resultService.createResults([payload]);
        Alert.alert('Thành công', 'Đã lưu điểm số');
      }
      
      setModalVisible(false);
      setEditingResult(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving result:', error);
      Alert.alert('Lỗi', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const scoreTypes = [
    { label: 'Thường xuyên', weight: 1 },
    { label: '15p', weight: 1 },
    { label: 'Giữa kì', weight: 2 },
    { label: 'Cuối kì', weight: 3 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-lg">Chi tiết điểm số</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {loading && !results ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : (
          <>
            {/* Student Info Card Redesigned */}
            <View className="bg-white rounded-[40px] p-8 mb-8 border border-gray-100 shadow-sm overflow-hidden relative">
              <View className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16" />
              
              <View className="flex-row justify-between items-start mb-8 relative z-10">
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] mb-2 uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Thông tin học sinh</Text>
                  <Text className="text-gray-900 text-2xl mb-1" style={{ fontFamily: 'Poppins-Bold' }}>{studentName || '---'}</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-emerald-500" />
                    <Text className="text-emerald-600 text-[11px]" style={{ fontFamily: 'Poppins-Bold' }}>{results?.subjectName || '---'}</Text>
                  </View>
                </View>
                <View className="bg-blue-600 px-4 py-2 rounded-2xl">
                  <Text className="text-white text-[10px]" style={{ fontFamily: 'Poppins-Bold' }}>Kỳ {term}</Text>
                </View>
              </View>

              <View className="border-t border-gray-50 pt-8 flex-row justify-between items-end relative z-10">
                <View>
                  <Text className="text-gray-400 text-[10px] mb-1 uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Điểm trung bình</Text>
                  <Text className="text-blue-600 text-4xl" style={{ fontFamily: 'Poppins-Bold' }}>{results?.average.toFixed(1) || '0.0'}</Text>
                </View>
                <TouchableOpacity 
                   onPress={() => {
                     setEditingResult(null);
                     setFormValue('');
                     setFormType('Thường xuyên');
                     setFormWeight('1');
                     setModalVisible(true);
                   }}
                   className="bg-blue-600 px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-200"
                >
                  <Text className="text-white text-xs" style={{ fontFamily: 'Poppins-Bold' }}>+ Thêm điểm</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Scores List */}
            <Text className="text-gray-500 text-xs mb-4 uppercase tracking-widest" style={{ fontFamily: 'Poppins-SemiBold' }}>Danh sách cột điểm</Text>
            
            {results?.detailResults && results.detailResults.length > 0 ? (
              results.detailResults.map((res, index) => (
                <View key={index} className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-100">
                  <View className="w-10 h-10 rounded-2xl bg-gray-100/50 items-center justify-center mr-4">
                    <Ionicons name="document-text-outline" size={18} color="#94A3B8" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 text-sm" style={{ fontFamily: 'Poppins-Bold' }}>{res.type}</Text>
                    <Text className="text-gray-400 text-[10px]" style={{ fontFamily: 'Poppins-Medium' }}>Hệ số: {res.weight}</Text>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <Text className="text-blue-600 text-xl" style={{ fontFamily: 'Poppins-Bold' }}>{res.value}</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingResult(res);
                        setFormType(res.type);
                        setFormValue(res.value.toString());
                        setFormWeight(res.weight.toString());
                        setModalVisible(true);
                      }}
                      className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center"
                    >
                      <Ionicons name="create-outline" size={14} color="#136ADA" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="py-10 items-center">
                <Text className="text-gray-400" style={{ fontFamily: 'Poppins-Regular' }}>Chưa có đầu điểm nào</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Grade Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setEditingResult(null);
              }}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
                 <Text className="text-gray-800 text-xl" style={{ fontFamily: 'Poppins-Bold' }}>
                   {editingResult ? 'Cập nhật điểm' : 'Nhập điểm mới'}
                 </Text>
            </View>

            {!editingResult && (
              <View className="mb-6">
                   <Text className="text-gray-400 text-xs mb-2 uppercase" style={{ fontFamily: 'Poppins-SemiBold' }}>Loại điểm</Text>
                   <View className="flex-row gap-2">
                      {scoreTypes.map(st => (
                          <TouchableOpacity 
                              key={st.label}
                              onPress={() => {
                                  setFormType(st.label);
                                  setFormWeight(st.weight.toString());
                              }}
                              className={`flex-1 py-3 rounded-2xl border ${formType === st.label ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-transparent'}`}
                          >
                              <Text className={`text-center text-[10px] ${formType === st.label ? 'text-blue-600' : 'text-gray-500'}`} style={{ fontFamily: 'Poppins-Bold' }}>{st.label}</Text>
                          </TouchableOpacity>
                      ))}
                   </View>
              </View>
            )}

            <View className="mb-8">
                 <Text className="text-gray-400 text-xs mb-2 uppercase" style={{ fontFamily: 'Poppins-SemiBold' }}>Điểm số (0 - 10)</Text>
                 <TextInput 
                    className="bg-gray-50 rounded-2xl px-5 py-4 text-lg text-gray-800"
                    placeholder="Nhập số..."
                    keyboardType="numeric"
                    value={formValue}
                    onChangeText={setFormValue}
                    style={{ fontFamily: 'Poppins-Bold' }}
                 />
            </View>

            <TouchableOpacity 
                onPress={handleSave}
                disabled={loading}
                className="bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-200"
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-base" style={{ fontFamily: 'Poppins-Bold' }}>
                      {editingResult ? 'Cập nhật điểm số' : 'Lưu điểm số'}
                    </Text>
                )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
