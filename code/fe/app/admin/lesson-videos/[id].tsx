import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lessonVideoService } from "../../../services/lesson.service";
import { LessonVideoResponse } from "../../../types/lesson";
import { VideoPlayer } from "../../../components/ui/VideoPlayer";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";

export default function AdminLessonVideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [video, setVideo] = useState<LessonVideoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideoDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const videoData = await lessonVideoService.getLessonVideoById(id);
      setVideo(videoData);
    } catch (error) {
      console.error("Error fetching video detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết video.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVideoDetail();
  }, [fetchVideoDetail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideoDetail();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  if (!video) return null;

  return (
    <AdminPageWrapper title="Chi tiết video">
      <StatusBar style="dark" />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
      >
        {/* Hero Video Section */}
        <View className="px-6 pt-6">
          <View className="bg-black rounded-[40px] overflow-hidden shadow-xl shadow-rose-200">
            <VideoPlayer url={video.url} autoPlay />
          </View>
        </View>

        {/* Video Info Card */}
        <View className="px-6 mt-8">
          <View className="bg-rose-50/50 p-6 rounded-[40px] border border-rose-100/50">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="bg-rose-100 flex-row items-center px-3 py-1 rounded-full border border-rose-200">
                <Ionicons name="film" size={12} color="#F43F5E" />
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#F43F5E] text-[10px] ml-1 uppercase">
                  VIDEO BÀI GIẢNG {video.orderIndex}
                </Text>
              </View>
            </View>

            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-black mb-4">
              {video.name}
            </Text>

            <View className="mt-2 pt-6 border-t border-rose-100/50 flex-row justify-between items-center">
               <View>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">THỜI LƯỢNG</Text>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#F43F5E] text-xl">
                    {(video.duration / 60).toFixed(1)} phút
                  </Text>
               </View>
               <View className="w-10 h-10 rounded-full bg-rose-100 items-center justify-center">
                  <Ionicons name="time" size={20} color="#F43F5E" />
               </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </AdminPageWrapper>
  );
}

