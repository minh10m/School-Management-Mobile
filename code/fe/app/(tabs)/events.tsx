import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TextInput, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { eventService } from "../../services/event.service";
import { EventItem } from "../../types/event";

export default function EventsTab() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Ongoing' | 'Finished'>('All');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({ 
        Title: search || undefined,
        SchoolYear: 2026, 
        Term: 1 
      });
      setEvents(response.items);
    } catch (error) {
      console.log("Error fetching events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const getStatus = (item: EventItem) => {
    const now = new Date();
    const s = new Date(`${item.eventDate}T${item.startTime}`);
    const f = new Date(`${item.eventDate}T${item.finishTime}`);
    if (now < s) return { label: 'Upcoming', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (now > f) return { label: 'Finished', color: 'text-gray-400', bg: 'bg-gray-50' };
    return { label: 'Ongoing', color: 'text-green-500', bg: 'bg-green-50' };
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>School Events</Text>
          <Text className="text-gray-400 text-[10px]" style={{ fontFamily: "Poppins-Regular" }}>Stay tuned with our campus activities</Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-100 px-6 py-2 gap-2">
         {['All', 'Upcoming', 'Ongoing', 'Finished'].map((t: any) => (
           <TouchableOpacity 
              key={t} onPress={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-full ${activeTab === t ? 'bg-bright-blue' : 'bg-gray-50'}`}
           >
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 10, color: activeTab === t ? 'white' : '#9CA3AF' }}>{t.toUpperCase()}</Text>
           </TouchableOpacity>
         ))}
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="bg-gray-50 rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-gray-100">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search events by title..."
            placeholderTextColor="#9CA3AF"
            className="text-black py-2.5 flex-1 text-sm pt-3"
            style={{ fontFamily: 'Poppins-Regular' }}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Event List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.eventId}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const status = getStatus(item);
          return (
            <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm shadow-blue-50/20">
              <View className="flex-row items-center justify-between mb-2">
                <View className={`${status.bg} px-2.5 py-1 rounded-full px-3`}>
                  <Text className={`${status.color} text-[10px]`} style={{ fontFamily: "Poppins-Bold" }}>{status.label.toUpperCase()}</Text>
                </View>
                <Text className="text-gray-300 text-[10px]" style={{ fontFamily: "Poppins-Medium" }}>Term {item.term} · {item.schoolYear}</Text>
              </View>

              <Text className="text-black text-lg mb-1" style={{ fontFamily: "Poppins-Bold" }}>{item.title}</Text>
              <Text className="text-gray-500 text-xs mb-4 leading-5" style={{ fontFamily: "Poppins-Regular" }}>{item.body}</Text>
              
              <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="calendar-outline" size={14} color="#136ADA" />
                  <Text className="text-gray-600 text-[11px]" style={{ fontFamily: "Poppins-Medium" }}>
                    {new Date(item.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="time-outline" size={14} color="#136ADA" />
                  <Text className="text-gray-600 text-[11px]" style={{ fontFamily: "Poppins-Medium" }}>
                    {item.startTime.slice(0, 5)} - {item.finishTime.slice(0, 5)}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          loading && !refreshing ? <ActivityIndicator size="large" color="#136ADA" className="mt-20" /> : (
            <View className="items-center justify-center mt-20">
              <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
              </View>
              <Text className="text-gray-400 text-center" style={{ fontFamily: "Poppins-Medium" }}>No events found</Text>
              <Text className="text-gray-300 text-[10px] mt-1 text-center" style={{ fontFamily: "Poppins-Regular" }}>Try adjusting your filters or search terms</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
