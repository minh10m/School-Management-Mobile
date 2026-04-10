import { View, Text, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const MOCK_COURSES = [
  { courseId: '1', courseName: 'Toán đại số nâng cao', teacherName: 'Tran Thi Mai', subjectName: 'Mathematics', price: 500000, status: 'pending', description: 'Khóa học toán nâng cao dành cho học sinh lớp 10-12', publishedAt: null },
  { courseId: '2', courseName: 'Luyện viết văn THPT', teacherName: 'Nguyen Thi Hoa', subjectName: 'Literature', price: 400000, status: 'approved', description: 'Giúp học sinh viết văn tốt hơn cho kì thi THPT', publishedAt: '2025-09-01' },
  { courseId: '3', courseName: 'Vật lý cơ học', teacherName: 'Do Van Duc', subjectName: 'Physics', price: 450000, status: 'pending', description: 'Cơ học Newton và ứng dụng', publishedAt: null },
  { courseId: '4', courseName: 'Tiếng Anh giao tiếp', teacherName: 'Le Van Nam', subjectName: 'English', price: 600000, status: 'rejected', description: 'Khóa tiếng Anh giao tiếp B1-B2', publishedAt: null },
  { courseId: '5', courseName: 'Hóa học hữu cơ', teacherName: 'Pham Thi Lan', subjectName: 'Chemistry', price: 480000, status: 'approved', description: 'Hóa hữu cơ từ cơ bản đến nâng cao', publishedAt: '2025-09-15' },
];

type Status = 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<Status, { bg: string; text: string; label: string; icon: string }> = {
  pending:  { bg: '#FFF7ED', text: '#F97316', label: 'Pending',  icon: 'time-outline' },
  approved: { bg: '#F0FDF4', text: '#22C55E', label: 'Approved', icon: 'checkmark-circle-outline' },
  rejected: { bg: '#FEF2F2', text: '#EF4444', label: 'Rejected', icon: 'close-circle-outline' },
};

const TABS: Status[] = ['pending', 'approved', 'rejected'];

export default function AdminCoursesScreen() {
  const [activeTab, setActiveTab] = useState<Status>('pending');
  const [selected, setSelected] = useState<any>(null);

  const filtered = MOCK_COURSES.filter(c => c.status === activeTab);

  const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  const handleAction = (action: Status) => {
    Alert.alert(
      action === 'approved' ? 'Approve Course' : 'Reject Course',
      `${action === 'approved' ? 'Duyệt' : 'Từ chối'} khóa học "${selected?.courseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: action === 'approved' ? 'Approve' : 'Reject', style: action === 'rejected' ? 'destructive' : 'default',
          onPress: () => { setSelected(null); } },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg flex-1">Course Management</Text>
      </View>

      {/* Status Tabs */}
      <View className="flex-row px-6 py-3 bg-white border-b border-gray-100 gap-2">
        {TABS.map(tab => {
          const cfg = STATUS_CONFIG[tab];
          return (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl items-center border ${activeTab === tab ? 'border-transparent' : 'border-gray-100 bg-white'}`}
              style={activeTab === tab ? { backgroundColor: cfg.bg } : {}}
            >
              <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 12, color: activeTab === tab ? cfg.text : '#9CA3AF' }}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.courseId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status as Status];
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 border border-gray-100"
              onPress={() => setSelected(item)}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-sm">{item.courseName}</Text>
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs mt-0.5">{item.subjectName} · {item.teacherName}</Text>
                </View>
                <View style={{ backgroundColor: cfg.bg }} className="px-2 py-1 rounded-full flex-row items-center gap-1">
                  <Ionicons name={cfg.icon as any} size={11} color={cfg.text} />
                  <Text style={{ fontFamily: 'Poppins-Medium', color: cfg.text, fontSize: 10 }}>{cfg.label}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text style={{ fontFamily: 'Poppins-Bold', color: '#136ADA' }} className="text-sm">{fmt(item.price)}</Text>
                {item.publishedAt && (
                  <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Published: {item.publishedAt}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Ionicons name="play-circle-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400 mt-2">No {activeTab} courses</Text>
          </View>
        }
      />

      {/* Course Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-5" />
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-black text-lg mb-1">{selected?.courseName}</Text>
            <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-500 text-sm mb-4">{selected?.description}</Text>
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 bg-gray-50 rounded-xl p-3">
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Teacher</Text>
                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-black text-sm">{selected?.teacherName}</Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-xl p-3">
                <Text style={{ fontFamily: 'Poppins-Regular' }} className="text-gray-400 text-xs">Price</Text>
                <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#136ADA' }} className="text-sm">{selected ? (selected.price).toLocaleString('vi-VN') + 'đ' : ''}</Text>
              </View>
            </View>
            {selected?.status === 'pending' && (
              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity className="flex-1 bg-red-50 rounded-2xl py-4 items-center" onPress={() => handleAction('rejected')}>
                  <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-red-500">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-bright-blue rounded-2xl py-4 items-center" onPress={() => handleAction('approved')}>
                  <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-white">Approve</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity className="mt-3 py-3 items-center" onPress={() => setSelected(null)}>
              <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-400">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
