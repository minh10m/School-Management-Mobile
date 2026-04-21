import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback, useMemo } from "react";
import { classYearService } from "../../../services/classYear.service";
import { attendanceService } from "../../../services/attendance.service";
import { ClassYearResponse } from "../../../types/classYear";
import { ClassAttendanceItem } from "../../../types/attendance";
import { SCHOOL_YEAR } from "../../../constants/config";

export default function MyHomeroomClass() {
  const [homeroom, setHomeroom] = useState<ClassYearResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const hr = await classYearService
        .getHomeroomClass(Number(SCHOOL_YEAR))
        .catch(() => null);
      setHomeroom(hr);
    } catch (error) {
      console.error("Error fetching homeroom data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/teacher");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lớp chủ nhiệm của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : homeroom ? (
            <>
              {/* Featured Card */}
              <View style={styles.featuredCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardSubtitle}>Lớp chủ nhiệm</Text>
                    <Text style={styles.cardTitle}>{homeroom.className}</Text>
                  </View>
                  <View style={styles.cardIcon}>
                    <Ionicons name="star" size={28} color="white" />
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.footerLabel}>Khối</Text>
                    <Text style={styles.footerValue}>{homeroom.grade}</Text>
                  </View>
                  <View>
                    <Text style={styles.footerLabel}>Học sinh</Text>
                    <Text style={styles.footerValue}>
                      {homeroom.studentCount}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.footerLabel}>Năm học</Text>
                    <Text style={styles.footerValue}>
                      {homeroom.schoolYear}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Features Grid */}
              <View style={styles.featuresGrid}>
                <FeatureButton
                  label="Điểm danh"
                  value="Ghi lại"
                  icon="calendar"
                  onPress={() =>
                    router.push(`/teacher/attendance/${homeroom.classYearId}`)
                  }
                />
                <FeatureButton
                  label="Học sinh"
                  value="Danh sách lớp"
                  icon="people"
                  onPress={() =>
                    router.push(
                      `/teacher/students?classId=${homeroom.classYearId}`,
                    )
                  }
                />
                <FeatureButton
                  label="Thời khóa biểu"
                  value="Lịch học tập"
                  icon="time"
                  onPress={() =>
                    router.push("/teacher/my-homeroom-class/schedule")
                  }
                />
                <FeatureButton
                  label="Thống kê"
                  value="Điểm danh tuần"
                  icon="analytics"
                  onPress={() =>
                    router.push("/teacher/my-homeroom-class/weekly-statistics")
                  }
                />
                <FeatureButton
                  label="Kết quả"
                  value="Báo cáo học tập"
                  icon="bar-chart"
                  onPress={() => router.push("/teacher/my-homeroom-class/results")}
                />
              </View>
            </>
          ) : (
            <EmptyHomeroom />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureButton({ label, value, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.featureButton} onPress={onPress}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={20} color="#136ADA" />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureValue}>{value}</Text>
    </TouchableOpacity>
  );
}

function EmptyHomeroom() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="star-outline" size={40} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>Chưa được phân công chủ nhiệm</Text>
      <Text style={styles.emptyMessage}>
        Bạn hiện chưa được phân công làm Giáo viên Chủ nhiệm trong năm học này.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "black",
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  featuredCard: {
    backgroundColor: "#136ADA",
    borderRadius: 24,
    padding: 32,
    marginBottom: 40,
    shadowColor: "#136ADA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  cardSubtitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "#BFDBFE",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  cardTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 48,
    color: "white",
    marginTop: 4,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#BFDBFE",
    textTransform: "uppercase",
  },
  footerValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "white",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  featureButton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  featureValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#1E3A8A",
    marginTop: 2,
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 48,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginTop: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#1F2937",
    textAlign: "center",
  },
  emptyMessage: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 24,
  },
});
