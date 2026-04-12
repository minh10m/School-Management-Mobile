import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { eventService } from '../../../services/event.service';
import { getErrorMessage } from '../../../utils/error';

export default function AdminCreateEventScreen() {
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

  useEffect(() => {
    if (isEdit) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setFetching(true);
      // Fetch specifically by id or search within the list
      const res = await eventService.getEvents({ Title: '' }); // Simplified: Fetch all and find
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

  if (fetching) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#136ADA" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg">
          {isEdit ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện mới'}
        </Text>
      </View>

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

        {/* Date */}
        <View className="mb-5">
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Ngày diễn ra (YYYY-MM-DD) *</Text>
          <TextInput
            value={form.eventDate}
            onChangeText={(v) => set('eventDate', v)}
            placeholder="2026-04-02"
            placeholderTextColor="#D1D5DB"
            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-black"
          />
        </View>

        {/* Times */}
        <View className="flex-row gap-4 mb-5">
          <View className="flex-1">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Giờ bắt đầu (HH:mm:ss) *</Text>
            <TextInput
              value={form.startTime}
              onChangeText={(v) => set('startTime', v)}
              placeholder="09:00:00"
              placeholderTextColor="#D1D5DB"
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-xs text-black"
            />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1.5 ml-1">Giờ kết thúc (HH:mm:ss) *</Text>
            <TextInput
              value={form.finishTime}
              onChangeText={(v) => set('finishTime', v)}
              placeholder="11:30:00"
              placeholderTextColor="#D1D5DB"
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-xs text-black"
            />
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
          className={`${submitting ? 'bg-blue-300' : 'bg-bright-blue'} rounded-2xl py-4 items-center mt-6 mb-10 shadow-sm shadow-blue-100`}
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
    </SafeAreaView>
  );
}
