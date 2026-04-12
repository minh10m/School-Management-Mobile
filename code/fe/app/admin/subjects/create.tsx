import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { subjectService } from "../../../services/subject.service";
import { getErrorMessage } from "../../../utils/error";

export default function AdminCreateSubjectScreen() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subjectName: "",
    maxPeriod: 0,
  });

  const handleSubmit = async () => {
    if (!form.subjectName || form.maxPeriod <= 0) {
      Alert.alert(
        "Missing Info",
        "Please provide a valid Subject Name and Max Periods per week (>0).",
      );
      return;
    }

    try {
      setLoading(true);
      await subjectService.createSubject(form);
      Alert.alert("Success", "Subject created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-xl ml-2"
        >
          New Subject
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 100 }}
      >
        <View className="gap-8">
          {/* Hero Icon */}
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-blue-50/50 items-center justify-center rounded-[32px]">
              <View className="w-16 h-16 bg-white shadow-sm items-center justify-center rounded-[24px]">
                <Ionicons name="book" size={36} color="#136ADA" />
              </View>
            </View>
          </View>

          {/* Subject Name */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-2 ml-1 uppercase tracking-widest"
            >
              Subject Name *
            </Text>
            <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-1 flex-row items-center gap-3">
              <Ionicons name="at-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="e.g. Mathematics"
                value={form.subjectName}
                onChangeText={(t) => setForm({ ...form, subjectName: t })}
                className="flex-1 py-4 text-black text-base"
                style={{ fontFamily: "Poppins-Regular" }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Max Periods */}
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] mb-2 ml-1 uppercase tracking-widest"
            >
              Max Periods per Week *
            </Text>
            <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-1 flex-row items-center gap-3">
              <Ionicons name="time-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="e.g. 5"
                value={form.maxPeriod.toString()}
                onChangeText={(t) =>
                  setForm({ ...form, maxPeriod: parseInt(t) || 0 })
                }
                keyboardType="numeric"
                className="flex-1 py-4 text-black text-base"
                style={{ fontFamily: "Poppins-Regular" }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <Text
              style={{ fontFamily: "Poppins-Regular" }}
              className="text-gray-400 text-[10px] mt-2 ml-1 leading-4"
            >
              Total number of school hours for this subject in a student's
              weekly schedule.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-bright-blue rounded-[24px] py-5 items-center mt-10 shadow-xl shadow-blue-200"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-white text-lg"
              >
                Register Subject
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
