import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { resultService } from '../../services/result.service';
import { StudentResultSubject, CreateResultRequest, UpdateResultPayload } from '../../types/result';
import { useConfigStore } from '../../store/configStore';
import { getErrorMessage } from '../../utils/error';

type ResultGroupKey = 'MIENG' | '15P' | 'GK' | 'CK' | 'OTHER';

function getAverageGradeMeta(avg: number | undefined) {
  if (avg === undefined) {
    return { label: 'Chưa có điểm', text: 'text-gray-500', bg: 'bg-gray-100' };
  }
  if (avg >= 9) return { label: 'Xuất sắc', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (avg >= 8) return { label: 'Giỏi', text: 'text-blue-700', bg: 'bg-blue-50' };
  if (avg >= 6.5) return { label: 'Khá', text: 'text-indigo-700', bg: 'bg-indigo-50' };
  if (avg >= 5) return { label: 'Trung bình', text: 'text-amber-700', bg: 'bg-amber-50' };
  return { label: 'Yếu', text: 'text-red-700', bg: 'bg-red-50' };
}

function getScoreValueMeta(value: number) {
  if (value >= 8) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (value >= 5) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
}

function normalizeScoreType(type: string): ResultGroupKey {
  const normalized = type.trim().toLowerCase();
  if (normalized.includes('cuối') || normalized === 'ck') return 'CK';
  if (normalized.includes('giữa') || normalized === 'gk') return 'GK';
  if (normalized.includes('15') || normalized === '15p') return '15P';
  if (normalized.includes('miệng') || normalized.includes('tx')) return 'MIENG';
  return 'OTHER';
}

const GROUP_META: Record<ResultGroupKey, { title: string; icon: string; iconBg: string; iconColor: string }> = {
  MIENG: { title: 'Miệng', icon: '🗣️', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  '15P': { title: '15 phút', icon: '📝', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  GK: { title: 'Giữa kì', icon: '📋', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  CK: { title: 'Cuối kì', icon: '📄', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  OTHER: { title: 'Khác', icon: '📘', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
};

export default function ManageStudentResult() {
  const { studentId, studentName, classYearId, subjectId, term } = useLocalSearchParams();
  const { schoolYear } = useConfigStore();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<StudentResultSubject | null>(null);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResult, setEditingResult] = useState<any | null>(null);
   const [formType, setFormType] = useState('Miệng');
   const [formValue, setFormValue] = useState('');
   const [formWeight, setFormWeight] = useState('1');

  // ─── Lifecycle & Data Fetching ──────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [studentId, classYearId, subjectId, term])
  );

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
        const subjectResult = data.subjectResults?.find((r: StudentResultSubject) => r.subjectId === subjectId);
        setResults(subjectResult || null);
      } else {
        // [AGENT] If no subjectId provided (from Admin), default to first subject
        if (data.subjectResults?.length > 0) {
            setResults(data.subjectResults[0]);
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
      Keyboard.dismiss();
      setLoading(true);
      const commonPayload = {
        type: formType,
        value: Number(formValue),
        weight: Number(formWeight),
        term: Number(term),
        schoolYear: schoolYear
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
    { label: 'Miệng', weight: 1 },
    { label: '15 phút', weight: 1 },
    { label: 'Giữa kì', weight: 2 },
    { label: 'Cuối kì', weight: 3 },
  ];

  const calculatedAverage = useMemo(() => {
    const details = results?.detailResults || [];
    if (details.length === 0) return undefined;
    
    let totalWeight = 0;
    let totalScore = 0;
    
    details.forEach(res => {
      totalScore += res.value * res.weight;
      totalWeight += res.weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : undefined;
  }, [results?.detailResults]);

  const averageValue = results?.average ?? calculatedAverage;
  const averageGradeMeta = getAverageGradeMeta(averageValue);
  const scoreCount = results?.detailResults?.length ?? 0;

  const groupedResults = useMemo(() => {
    const grouped: Record<Exclude<ResultGroupKey, 'OTHER'>, NonNullable<StudentResultSubject['detailResults']>> = {
      MIENG: [],
      '15P': [],
      GK: [],
      CK: [],
    };

    (results?.detailResults ?? []).forEach((res) => {
      const type = normalizeScoreType(res.type);
      if (type !== 'OTHER') {
        grouped[type].push(res);
      }
    });

    return (['MIENG', '15P', 'GK', 'CK'] as Exclude<ResultGroupKey, 'OTHER'>[])
      .map((key) => ({ key, items: grouped[key] }));
  }, [results?.detailResults]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      
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
              <View className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24" />
              <View className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50/30 rounded-full -ml-16 -mb-16" />
              
              <View className="flex-row justify-between items-start mb-8 relative z-10">
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] mb-2 uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Thông tin học sinh</Text>
                  <Text className="text-gray-900 text-2xl mb-1" style={{ fontFamily: 'Poppins-Bold' }}>{studentName || '---'}</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-emerald-500" />
                    <Text className="text-emerald-600 text-[11px]" style={{ fontFamily: 'Poppins-Bold' }}>{results?.subjectName || '---'}</Text>
                  </View>
                </View>
                <View className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/10">
                  <Text className="text-primary text-[10px]" style={{ fontFamily: 'Poppins-Bold' }}>Học kỳ {term}</Text>
                </View>
              </View>

              <View className="border-t border-gray-50 pt-8 flex-row justify-between items-end relative z-10">
                <View>
                  <Text className="text-gray-400 text-[10px] mb-1 uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Điểm trung bình môn</Text>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-primary text-4xl" style={{ fontFamily: 'Poppins-Bold' }}>
                      {averageValue && averageValue > 0 ? averageValue.toFixed(1) : '---'}
                    </Text>
                    <View className={`px-3 py-1 rounded-xl ${averageValue && averageValue > 0 ? averageGradeMeta.bg : 'bg-gray-100'}`}>
                      <Text className={`text-[11px] ${averageValue && averageValue > 0 ? averageGradeMeta.text : 'text-gray-500'}`} style={{ fontFamily: 'Poppins-Bold' }}>
                        {averageValue && averageValue > 0 ? averageGradeMeta.label : 'Chưa có điểm'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                   onPress={() => {
                     setEditingResult(null);
                     setFormValue('');
                     setFormType('Miệng');
                     setFormWeight('1');
                     setModalVisible(true);
                   }}
                   activeOpacity={0.8}
                   className="bg-primary px-6 py-4 rounded-3xl shadow-xl shadow-primary/30"
                >
                  <Text className="text-white text-xs" style={{ fontFamily: 'Poppins-Bold' }}>+ Thêm điểm</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Scores List */}
            <Text className="text-gray-500 text-xs mb-4 uppercase tracking-widest" style={{ fontFamily: 'Poppins-SemiBold' }}>Danh sách cột điểm</Text>
            
            {scoreCount > 0 ? (
              groupedResults.map((group) => {
                const meta = GROUP_META[group.key];
                return (
                  <View key={group.key} className="mb-4">
                    <View className="flex-row items-center mb-2">
                      <View className={`w-7 h-7 rounded-lg items-center justify-center mr-2 ${meta.iconBg}`}>
                        <Text className={`text-xs ${meta.iconColor}`}>{meta.icon}</Text>
                      </View>
                      <Text className="text-gray-700 text-xs uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>
                        {meta.title}
                      </Text>
                    </View>

                    {group.items.length > 0 ? (
                      group.items.map((res, index) => {
                        const scoreMeta = getScoreValueMeta(res.value);
                        return (
                          <View key={`${group.key}-${index}`} className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-100">
                            <View className={`w-10 h-10 rounded-2xl ${meta.iconBg} items-center justify-center mr-4`}>
                              <Text className="text-lg">{meta.icon}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-800 text-sm" style={{ fontFamily: 'Poppins-Bold' }}>{res.type}</Text>
                              <Text className="text-gray-400 text-[10px]" style={{ fontFamily: 'Poppins-Medium' }}>Hệ số: {res.weight}</Text>
                            </View>
                            <View className="flex-row items-center gap-4">
                              <View className={`px-3 py-1 rounded-xl border ${scoreMeta.bg} ${scoreMeta.border}`}>
                                <Text className={`text-base ${scoreMeta.text}`} style={{ fontFamily: 'Poppins-Bold' }}>
                                  {res.value}
                                </Text>
                              </View>
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
                        );
                      })
                    ) : (
                      <View className="bg-gray-50/50 rounded-2xl p-4 mb-3 border border-gray-100 border-dashed items-center py-6">
                        <Text className="text-gray-300 text-[10px] uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Chưa có điểm</Text>
                      </View>
                    )}
                  </View>
                );
              })
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
        onRequestClose={() => {
          setModalVisible(false);
          setEditingResult(null);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => {
                setModalVisible(false);
                setEditingResult(null);
              }}
              className="flex-1 bg-black/50 justify-end"
            >
              <TouchableWithoutFeedback>
                <View className="bg-white rounded-t-[40px] p-8 pb-12">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-gray-800 text-xl" style={{ fontFamily: 'Poppins-Bold' }}>
                      {editingResult ? 'Cập nhật điểm' : 'Nhập điểm mới'}
                    </Text>
                    <TouchableOpacity onPress={() => {
                      setModalVisible(false);
                      setEditingResult(null);
                    }}>
                      <Ionicons name="close" size={24} color="#999" />
                    </TouchableOpacity>
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
                          autoFocus
                          onSubmitEditing={handleSave}
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
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
