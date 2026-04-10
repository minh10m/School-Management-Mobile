import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../../../services/event.service';
import { EventItem } from '../../../types/event';

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Filter States
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Ongoing' | 'Finished'>('All');

  // Modal Visibility
  const [showTermModal, setShowTermModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({ 
        Title: search || undefined,
        SchoolYear: Number(selectedYear),
        Term: Number(selectedTerm)
      });
      setEvents(res.items || []);
    } catch (err) {
      console.log('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedYear, selectedTerm]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const filteredEvents = events.filter(e => {
    if (activeTab === 'All') return true;
    const now = new Date();
    const s = new Date(`${e.eventDate}T${e.startTime}`);
    const f = new Date(`${e.eventDate}T${e.finishTime}`);
    if (activeTab === 'Upcoming') return now < s;
    if (activeTab === 'Finished') return now > f;
    if (activeTab === 'Ongoing') return now >= s && now <= f;
    return true;
  });

  const getStatus = (item: EventItem) => {
    const now = new Date();
    const s = new Date(`${item.eventDate}T${item.startTime}`);
    const f = new Date(`${item.eventDate}T${item.finishTime}`);
    if (now < s) return { label: 'Upcoming', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (now > f) return { label: 'Finished', color: 'text-gray-400', bg: 'bg-gray-50' };
    return { label: 'Ongoing', color: 'text-green-500', bg: 'bg-green-50' };
  };

  // Selection Modal Component
  const SelectionModal = ({ 
    visible, 
    onClose, 
    title, 
    options, 
    selectedValue, 
    onSelect 
  }: any) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="bg-white w-full rounded-3xl p-6 shadow-xl max-h-[60%]">
          <View className="flex-row justify-between items-center mb-5">
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-lg text-black">{title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#9CA3AF" /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((opt: any) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => { onSelect(opt.value); onClose(); }}
                className={`flex-row items-center justify-between py-4 border-b border-gray-50 ${selectedValue === opt.value ? 'bg-blue-50/30 -mx-6 px-6' : ''}`}
              >
                <Text 
                  style={{ fontFamily: selectedValue === opt.value ? 'Poppins-SemiBold' : 'Poppins-Regular' }} 
                  className={`text-base ${selectedValue === opt.value ? 'text-bright-blue' : 'text-gray-600'}`}
                >
                  {opt.label}
                </Text>
                {selectedValue === opt.value && <Ionicons name="checkmark" size={20} color="#136ADA" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-6 pt-2 pb-5 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
          <View>
            <Text className="text-black text-xl" style={{ fontFamily: 'Poppins-Bold' }}>Events Management</Text>
            <Text className="text-gray-400 text-[10px]" style={{ fontFamily: 'Poppins-Regular' }}>Admin Tool · {events.length} Items</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/admin/events/create' as any)}
        >
          <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-bright-blue text-sm">Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-100 px-6 py-2 gap-2">
         {['All', 'Upcoming', 'Ongoing', 'Finished'].map((t: any) => (
           <TouchableOpacity 
              key={t} onPress={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-full ${activeTab === t ? 'bg-bright-blue' : 'bg-gray-100'}`}
           >
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10, color: activeTab === t ? 'white' : '#9CA3AF' }}>{t.toUpperCase()}</Text>
           </TouchableOpacity>
         ))}
      </View>

      {/* Search & Filters */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 gap-3">
        <View className="bg-gray-50 rounded-2xl px-3 py-1 flex-row items-center gap-2 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search by event title..."
            placeholderTextColor="#9CA3AF"
            className="text-black py-2.5 flex-1 text-sm"
            style={{ fontFamily: 'Poppins-Regular' }}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={() => setShowTermModal(true)}
            className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 flex-row items-center justify-between border border-gray-100"
          >
            <Text className="text-gray-600 text-xs" style={{ fontFamily: 'Poppins-Medium' }}>
               Term {selectedTerm}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setShowYearModal(true)}
            className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 flex-row items-center justify-between border border-gray-100"
          >
            <Text className="text-gray-600 text-xs" style={{ fontFamily: 'Poppins-Medium' }}>
               {selectedYear}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.eventId}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const status = getStatus(item);
          return (
            <TouchableOpacity 
              className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm shadow-blue-50/20"
              onPress={() => router.push({ pathname: '/admin/events/create', params: { id: item.eventId } } as any)}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <View className={`${status.bg} px-2 py-0.5 rounded-full`}>
                        <Text className={`${status.color} text-[9px]`} style={{ fontFamily: 'Poppins-Bold' }}>{status.label.toUpperCase()}</Text>
                    </View>
                    <Text className="text-gray-300 text-[9px]" style={{ fontFamily: 'Poppins-Medium' }}>Term {item.term} · {item.schoolYear}</Text>
                  </View>
                  <Text className="text-black text-base mb-1" style={{ fontFamily: 'Poppins-Bold' }}>{item.title}</Text>
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                    <Text className="text-gray-400 text-[11px]" style={{ fontFamily: 'Poppins-Regular' }}>
                      {new Date(item.eventDate).toLocaleDateString('en-GB')} · {item.startTime.slice(0,5)} - {item.finishTime.slice(0,5)}
                    </Text>
                  </View>
                </View>
                <View className="bg-blue-50/50 w-9 h-9 rounded-full items-center justify-center">
                    <Ionicons name="chevron-forward" size={16} color="#136ADA" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          loading ? <ActivityIndicator color="#136ADA" className="mt-10" /> : (
            <View className="items-center py-20">
              <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Ionicons name="search-outline" size={28} color="#D1D5DB" />
              </View>
              <Text className="text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>No matching events found</Text>
            </View>
          )
        }
      />

      {/* Modals */}
      <SelectionModal 
        visible={showTermModal} title="Select Term" 
        options={[{label: 'Term 1', value: 1}, {label: 'Term 2', value: 2}]} 
        selectedValue={selectedTerm} onSelect={setSelectedTerm} onClose={() => setShowTermModal(false)} 
      />
      <SelectionModal 
        visible={showYearModal} title="Select School Year" 
        options={[{label: '2024', value: 2024}, {label: '2025', value: 2025}, {label: '2026', value: 2026}]} 
        selectedValue={selectedYear} onSelect={setSelectedYear} onClose={() => setShowYearModal(false)} 
      />
    </SafeAreaView>
  );
}
