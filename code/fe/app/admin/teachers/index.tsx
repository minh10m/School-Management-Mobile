import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { teacherService } from "../../../services/teacher.service";
import { subjectService } from "../../../services/subject.service";
import { TeacherListItem } from "../../../types/teacher";
import { SubjectResponse } from "../../../types/subject";

export default function AdminTeachersScreen() {
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | undefined>();
  const [tempSubjectName, setTempSubjectName] = useState<string | undefined>();

  const loadInitialData = async () => {
    try {
      const subRes = await subjectService.getSubjects();
      setSubjects(Array.isArray(subRes) ? subRes : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teacherService.getTeachers({
        FullName: search || undefined,
        SubjectName: selectedSubjectName,
        PageSize: 50,
        sortBy: "FullName",
        isAscending: true,
      });
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSubjectName]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const openFilter = () => {
    setTempSearch(search);
    setTempSubjectName(selectedSubjectName);
    setIsFilterVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
    setRefreshing(false);
  };

  const applyFilters = () => {
    setSearch(tempSearch);
    setSelectedSubjectName(tempSubjectName);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setTempSearch("");
    setTempSubjectName(undefined);
    setSearch("");
    setSelectedSubjectName(undefined);
    setIsFilterVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header aligned with synchronised UI */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-xl text-black"
        >
          Teacher Management
        </Text>
      </View>

      {/* Synchronized Search Bar Section */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <View className="flex-1 bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search teachers..."
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            value={tempSearch}
            onChangeText={setTempSearch}
            onSubmitEditing={applyFilters}
          />
        </View>
        <TouchableOpacity
          onPress={openFilter}
          className="bg-blue-50 w-11 h-11 rounded-2xl items-center justify-center border border-blue-100"
        >
          <Ionicons name="options-outline" size={22} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {/* Advanced Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Filter Teachers</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Filter: Subject */}
            <View className="mb-12">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Subject Domain</Text>
              <View className="flex-row flex-wrap gap-3">
                <TouchableOpacity
                  onPress={() => setTempSubjectName(undefined)}
                  className={`px-5 py-3 rounded-2xl ${!tempSubjectName ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                >
                  <Text
                    style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: !tempSubjectName ? "#1D4ED8" : "#9CA3AF" }}
                  >
                    All Subjects
                  </Text>
                </TouchableOpacity>
                {subjects.map((s) => (
                  <TouchableOpacity
                    key={s.subjectId}
                    onPress={() => setTempSubjectName(s.subjectName)}
                    className={`px-5 py-3 rounded-2xl ${tempSubjectName === s.subjectName ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                  >
                    <Text
                      style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: tempSubjectName === s.subjectName ? "#1D4ED8" : "#9CA3AF" }}
                    >
                      {s.subjectName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Modal Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-50 h-16 rounded-[24px] items-center justify-center"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-gray-400">Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-2 bg-[#136ADA] h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-white">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item, index) => item.teacherId || index.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex-row items-center"
              onPress={() => router.push(`/admin/teachers/${item.teacherId}` as any)}
            >
              <View className="w-14 h-14 rounded-2xl bg-purple-50 items-center justify-center">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-purple-600 text-lg"
                >
                  {item.fullName.charAt(0)}
                </Text>
              </View>
              <View className="flex-1 ml-4">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-black text-base"
                >
                  {item.fullName}
                </Text>
                <View className="bg-purple-50 self-start px-2 py-0.5 rounded-lg mt-1">
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 10,
                      color: "#9333EA",
                    }}
                  >
                    {item.subjectNames?.join(", ") || "No Subject"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="people-outline" size={64} color="#E5E7EB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center"
              >
                No teachers found.{"\n"}Try adjusting your filters.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
