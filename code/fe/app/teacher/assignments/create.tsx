import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { teacherService } from "../../../services/teacher.service";
import { classYearService } from "../../../services/classYear.service";
import { assignmentService } from "../../../services/assignment.service";
import { TeacherSubject } from "../../../types/teacher";
import { ClassYearSummary } from "../../../types/classYear";
import { SCHOOL_YEAR } from "../../../constants/config";

export default function CreateAssignment() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassYearSummary | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<TeacherSubject | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [finishDate, setFinishDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  // Data State
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [classes, setClasses] = useState<ClassYearSummary[]>([]);

  // Modals / Pickers visibility (Simple implementation using conditional rendering for now)
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setInitialLoading(true);
      const me = await teacherService.getMe();
      const [subs, teachingClasses, homeroom] = await Promise.all([
        teacherService.getTeacherSubjects(me.teacherId).catch((err) => {
          console.warn('[AGENT] Failed to fetch subjects, fallback to empty:', err.message);
          return [] as TeacherSubject[];
        }),
        classYearService.getTeachingClasses({ schoolYear: SCHOOL_YEAR }),
        classYearService.getHomeroomClass(parseInt(SCHOOL_YEAR, 10)).catch(() => null),
      ]);

      setSubjects(subs);
      
      // Combine teaching classes and homeroom
      const allClasses = [...teachingClasses];
      if (homeroom && !allClasses.find(c => c.classYearId === homeroom.classYearId)) {
        allClasses.push({
          classYearId: homeroom.classYearId,
          className: homeroom.className || "Homeroom",
          grade: homeroom.grade,
          schoolYear: homeroom.schoolYear,
          studentCount: 0 // Placeholder
        } as ClassYearSummary);
      }
      setClasses(allClasses);
    } catch (error) {
      console.error("Error fetching data for assignment creation:", error);
      Alert.alert("Error", "Failed to load subjects and classes.");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }
    if (!selectedClass) {
      Alert.alert("Error", "Please select a class.");
      return;
    }
    if (!selectedSubject) {
      Alert.alert("Error", "Please select a subject.");
      return;
    }
    if (finishDate <= startDate) {
      Alert.alert("Error", "Finish time must be after start time.");
      return;
    }

    try {
      setLoading(true);
      await assignmentService.createAssignment({
        title: title.trim(),
        body: description.trim(),
        classYearId: selectedClass.classYearId,
        subjectId: selectedSubject.subjectId,
        startTime: startDate.toISOString(),
        finishTime: finishDate.toISOString(),
        fileTitle: null,
        fileUrl: null,
      });

      Alert.alert("Success", "Assignment created successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Error creating assignment:", error);
      Alert.alert("Error", "Failed to create assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
          Create Assignment
        </Text>
        <TouchableOpacity onPress={handleCreate} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#136ADA" />
          ) : (
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600 text-base">
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="mb-6">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-widest">
              Assignment Title
            </Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-2xl text-black"
              style={{ fontFamily: "Poppins-Medium" }}
              placeholder="Enter assignment title..."
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Select Class */}
          <View className="mb-6">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-widest">
              Class
            </Text>
            <TouchableOpacity
              onPress={() => setShowClassPicker(true)}
              className="bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center"
            >
              <Text style={{ fontFamily: "Poppins-Medium" }} className={selectedClass ? "text-black" : "text-gray-400"}>
                {selectedClass ? `${selectedClass.className} (Grade ${selectedClass.grade})` : "Select a class"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Select Subject */}
          <View className="mb-6">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-widest">
              Subject
            </Text>
            <TouchableOpacity
              onPress={() => setShowSubjectPicker(true)}
              className="bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center"
            >
              <Text style={{ fontFamily: "Poppins-Medium" }} className={selectedSubject ? "text-black" : "text-gray-400"}>
                {selectedSubject ? selectedSubject.subjectName : "Select a subject"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-widest">
              Description (Optional)
            </Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-2xl text-black text-left align-top"
              style={{ fontFamily: "Poppins-Medium", minHeight: 120 }}
              placeholder="Enter detailed instructions..."
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Simple Date Pickers (As placeholders since no library is installed) */}
          <View className="flex-row gap-4 mb-10">
            <View className="flex-1">
              <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-widest">
                Start Date
              </Text>
              <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 items-center justify-center">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-xs text-black">
                  {startDate.toLocaleDateString('en-GB')}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-xs mb-2 uppercase tracking-widest">
                Deadline
              </Text>
              <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 items-center justify-center">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-xs text-black">
                  {finishDate.toLocaleDateString('en-GB')}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selection Overlays (Simulating Pickers) */}
      {showClassPicker && (
        <View className="absolute inset-0 bg-black/40 items-center justify-center px-6 z-50">
          <View className="bg-white w-full max-h-[70%] rounded-3xl overflow-hidden">
            <View className="p-5 border-b border-gray-100 flex-row justify-between items-center">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg">Select Class</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {classes.map((c) => (
                <TouchableOpacity
                  key={c.classYearId}
                  onPress={() => {
                    setSelectedClass(c);
                    setShowClassPicker(false);
                  }}
                  className={`p-4 mb-2 rounded-2xl ${selectedClass?.classYearId === c.classYearId ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Text style={{ fontFamily: "Poppins-SemiBold" }} className={selectedClass?.classYearId === c.classYearId ? "text-blue-600" : "text-black"}>
                    {c.className} (Grade {c.grade})
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]">
                    School Year {c.schoolYear}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {showSubjectPicker && (
        <View className="absolute inset-0 bg-black/40 items-center justify-center px-6 z-50">
          <View className="bg-white w-full max-h-[70%] rounded-3xl overflow-hidden">
            <View className="p-5 border-b border-gray-100 flex-row justify-between items-center">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg">Select Subject</Text>
              <TouchableOpacity onPress={() => setShowSubjectPicker(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s.subjectId}
                  onPress={() => {
                    setSelectedSubject(s);
                    setShowSubjectPicker(false);
                  }}
                  className={`p-4 mb-2 rounded-2xl ${selectedSubject?.subjectId === s.subjectId ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Text style={{ fontFamily: "Poppins-SemiBold" }} className={selectedSubject?.subjectId === s.subjectId ? "text-blue-600" : "text-black"}>
                    {s.subjectName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
