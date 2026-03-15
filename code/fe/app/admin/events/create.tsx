import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

const MOCK_EVENTS: Record<string, any> = {
  '1': { title: 'Sports Day 2025', body: 'Toàn trường tham gia đại hội thể thao tại sân vận động.', startTime: '2025-11-03T07:00:00', finishTime: '2025-11-03T17:00:00', schoolYear: '2025-2026', term: 'HK1' },
};

export default function AdminCreateEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    body: '',
    startTime: '2025-11-03T07:00:00',
    finishTime: '2025-11-03T17:00:00',
    schoolYear: '2025-2026',
    term: 'HK1'
  });

  useEffect(() => {
    if (id && MOCK_EVENTS[id]) {
      setForm(MOCK_EVENTS[id]);
    }
  }, [id]);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.title || !form.body) {
      Alert.alert('Lỗi', 'Vui lòng điền tiêu đề và nội dung sự kiện.');
      return;
    }
    Alert.alert('Thành công', `Đã ${isEdit ? 'cập nhật' : 'tạo'} sự kiện "${form.title}"`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const Field = ({ label, value, onChangeText, placeholder, multiline = false }: any) => (
    <View className="mb-4">
      <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        placeholderTextColor="#9CA3AF"
        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black text-sm ${multiline ? 'h-24 text-start' : ''}`}
        style={{ fontFamily: 'Poppins-Regular', textAlignVertical: multiline ? 'top' : 'center' }}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">{isEdit ? 'Edit Event' : 'Create Event'}</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-5" showsVerticalScrollIndicator={false}>
        <Field label="Event Title *" value={form.title} onChangeText={(v: string) => set('title', v)} placeholder="Ví dụ: Đại hội thể thao" />
        <Field label="Description *" value={form.body} onChangeText={(v: string) => set('body', v)} placeholder="Nội dung sự kiện..." multiline />
        
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="Start (ISO) *" value={form.startTime} onChangeText={(v: string) => set('startTime', v)} placeholder="2025-11-03T07:00:00" />
          </View>
          <View className="flex-1">
             <Field label="Finish (ISO) *" value={form.finishTime} onChangeText={(v: string) => set('finishTime', v)} placeholder="2025-11-03T17:00:00" />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-600 text-xs mb-1">Term *</Text>
            <View className="flex-row gap-2">
              {['HK1', 'HK2'].map(t => (
                <TouchableOpacity key={t} onPress={() => set('term', t)}
                  className={`flex-1 py-3 rounded-xl border items-center ${form.term === t ? 'bg-bright-blue border-bright-blue' : 'bg-white border-gray-200'}`}
                >
                  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 13, color: form.term === t ? 'white' : '#6B7280' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="flex-1">
            <Field label="School Year *" value={form.schoolYear} onChangeText={(v: string) => set('schoolYear', v)} placeholder="2025-2026" />
          </View>
        </View>

        <TouchableOpacity
          className="bg-bright-blue rounded-2xl py-4 items-center mt-6 mb-10"
          onPress={handleSubmit}
        >
          <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">{isEdit ? 'Update Event' : 'Create Event'}</Text>
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity
            className="border border-red-100 bg-red-50 rounded-2xl py-4 items-center mb-10"
            onPress={() => Alert.alert('Xóa sự kiện', 'Bạn có chắc chắn muốn xóa sự kiện này?', [{ text: 'Hủy' }, { text: 'Xóa', style: 'destructive', onPress: () => router.back() }])}
          >
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-red-500 text-base">Delete Event</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
