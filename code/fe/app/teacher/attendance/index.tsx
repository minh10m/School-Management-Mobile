import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
import { classYearService } from "../../../services/classYear.service";
import { useConfigStore } from "../../../store/configStore";

export default function AttendanceRedirect() {
  const { schoolYear } = useConfigStore();
  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const hr = await classYearService.getHomeroomClass(schoolYear);
        if (hr) {
          router.replace(`/teacher/attendance/${hr.classYearId}` as any);
        } else {
          router.replace("/teacher");
        }
      } catch (error) {
        console.error("Redirect error:", error);
        router.replace("/teacher");
      }
    };
    checkAndRedirect();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#136ADA" />
    </View>
  );
}
