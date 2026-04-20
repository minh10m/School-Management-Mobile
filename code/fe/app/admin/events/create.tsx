import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AdminPageWrapper } from '../../../components/ui/AdminPageWrapper';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { eventService } from '../../../services/event.service';
import { getErrorMessage } from '../../../utils/error';

export default function AdminCreateEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = !!id;
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    body: '',
    eventDate: new Date().toISOString().split('T')[0],
    startTime: '09:00:00',
    finishTime: '11:30:00',
    schoolYear: 2026,
    term: 1
  });

  // Picker States
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerType, setPickerType] = useState<'date' | 'start' | 'finish'>('date');

  useEffect(() => {
    if (isEdit) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setFetching(true);
      const res = await eventService.getEvents({ Title: '' });
      const event = res.items.find(e => e.eventId === id);
      if (event) {
        setForm({
          title: event.title,
          body: event.body,
          eventDate: event.eventDate,
          startTime: event.startTime,
          finishTime: event.finishTime,
          schoolYear: event.schoolYear,
          term: event.term
        });
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết sự kiện');
    } finally {
      setFetching(false);
    }
  };

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title || !form.body || !form.eventDate || !form.startTime || !form.finishTime) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        await eventService.updateEvent(id!, form);
      } else {
        await eventService.createEvent(form);
      }
      Alert.alert('Thành công', `Đã ${isEdit ? 'cập nhật' : 'tạo'} sự kiện thành công.`, [
        { text: 'Đồng ý', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.log(err);
      const msg = getErrorMessage(err);
      Alert.alert('Thất bại', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) {
      if (pickerType === 'date') {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        set('eventDate', formattedDate);
      } else if (pickerType === 'start') {
        const hh = selectedDate.getHours().toString().padStart(2, '0');
        const mm = selectedDate.getMinutes().toString().padStart(2, '0');
        set('startTime', `${hh}:${mm}:00`);
      } else if (pickerType === 'finish') {
        const hh = selectedDate.getHours().toString().padStart(2, '0');
        const mm = selectedDate.getMinutes().toString().padStart(2, '0');
        set('finishTime', `${hh}:${mm}:00`);
      }
    }
  };

  const currentPickerValue = () => {
    if (pickerType === 'date') return new Date(form.eventDate);
    const [h, m] = (pickerType === 'start' ? form.startTime : form.finishTime).split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0);
    return d;
  };

  if (fetching) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#136ADA" />
      </SafeAreaView>
    );
  }

  return (
    <AdminPageWrapper
      title={isEdit ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện mới'}
    >

      <ScrollView className="flex-1 px-6 pt-5" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="mb-5">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Tiêu đề Sự kiện *</Text>
          <TextInput
            value={form.title}
            onChangeText={(v) => set('title', v)}
            placeholder="Nhập tiêu đề sự kiện..."
            placeholderTextColor="#9CA3AF"
            className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-black text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
          />
        </View>

        {/* Body */}
        <View className="mb-5">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Mô tả Sự kiện *</Text>
          <TextInput
            value={form.body}
            onChangeText={(v) => set('body', v)}
            placeholder="Mô tả chi tiết về sự kiện..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-black text-sm h-32 text-start"
            style={{ fontFamily: 'Poppins-Regular', textAlignVertical: 'top' }}
          />
        </View>

        {/* Date Picker Trigger */}
        <View className="mb-5">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Ngày diễn ra *</Text>
          <TouchableOpacity
            onPress={() => {
              setPickerType('date');
              setPickerMode('date');
              setShowPicker(true);
            }}
            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
          >
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm">
              {form.eventDate}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#136ADA" />
          </TouchableOpacity>
        </View>

        {/* Times Pickers */}
        <View className="flex-row gap-4 mb-5">
          <View className="flex-1">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Giờ bắt đầu *</Text>
            <TouchableOpacity
              onPress={() => {
                setPickerType('start');
                setPickerMode('time');
                setShowPicker(true);
              }}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
            >
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm">
                {form.startTime.substring(0, 5)}
              </Text>
              <Ionicons name="time-outline" size={20} color="#136ADA" />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Giờ kết thúc *</Text>
            <TouchableOpacity
              onPress={() => {
                setPickerType('finish');
                setPickerMode('time');
                setShowPicker(true);
              }}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
            >
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-black text-sm">
                {form.finishTime.substring(0, 5)}
              </Text>
              <Ionicons name="time-outline" size={20} color="#136ADA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Year and Term */}
        <View className="flex-row gap-4 mb-5">
          <View className="flex-1">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Năm học *</Text>
            <TextInput
              value={form.schoolYear.toString()}
              onChangeText={(v) => set('schoolYear', parseInt(v) || 2026)}
              keyboardType="numeric"
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-black text-sm"
              style={{ fontFamily: 'Poppins-Regular' }}
            />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Học kỳ *</Text>
            <View className="flex-row gap-2">
              {[1, 2].map(t => (
                <TouchableOpacity 
                  key={t} onPress={() => set('term', t)}
                  className={`flex-1 py-3.5 rounded-2xl border items-center ${form.term === t ? 'bg-bright-blue border-bright-blue' : 'bg-white border-gray-100'}`}
                >
                  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 13, color: form.term === t ? 'white' : '#9CA3AF' }}>Học kỳ {t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          className={`${submitting ? 'bg-blue-300' : 'bg-[#136ADA]'} rounded-2xl py-4 items-center mt-6 mb-10 shadow-sm shadow-blue-100`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white text-base">
              {isEdit ? 'Cập nhật Sự kiện' : 'Lưu Sự kiện'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date/Time Picker Modal (iOS Style) */}
      {showPicker && Platform.OS === 'ios' && (
        <View className="absolute inset-0 bg-black/40 z-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500">Hủy</Text>
              </TouchableOpacity>
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg">
                {pickerMode === 'date' ? 'Chọn ngày' : 'Chọn giờ'}
              </Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600">Xong</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={currentPickerValue()}
              mode={pickerMode}
              display="spinner"
              onChange={handlePickerChange}
              locale="vi-VN"
            />
          </View>
        </View>
      )}

      {/* Date/Time Picker (Android Style) */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={currentPickerValue()}
          mode={pickerMode}
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </AdminPageWrapper>
  );
}
