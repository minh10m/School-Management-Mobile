import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from "react";
import { feeService } from "../../../services/fee.service";
import { FeeResponse, FeeDetailResponse } from "../../../types/fee";
import { SCHOOL_YEAR } from "../../../constants/config";

export default function AdminFeeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [fee, setFee] = useState<FeeResponse | null>(null);
  const [details, setDetails] = useState<FeeDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      if (!refreshing) setLoading(true);

      const [feesRes, detailRes] = await Promise.all([
        feeService.getFees({
          schoolYear: parseInt(SCHOOL_YEAR, 10),
          pageNumber: 1,
          pageSize: 100,
        }),
        feeService.getAllFeeDetails({
          feeId: id,
          schoolYear: parseInt(SCHOOL_YEAR, 10),
          pageNumber: 1,
          pageSize: 100,
          studentName: search || undefined,
        }),
      ]);

      const foundFee = feesRes.items.find((f) => f.id === id);
      setFee(foundFee || null);
      setDetails(detailRes.items);
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể tải thông tin chi tiết học phí");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, search, refreshing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (n: number) => n.toLocaleString("vi-VN") + " VNĐ";

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  const paidCount = details.filter((s) => s.status === "Đã đóng").length;
  const pct =
    details.length > 0 ? Math.round((paidCount / details.length) * 100) : 0;

  return (
    <AdminPageWrapper
      title={fee?.title || "Chi tiết Học phí"}
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm tên học sinh...",
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Summary card */}
      <View className="mx-6 mt-6 mb-4 bg-[#136ADA] rounded-[32px] p-6 shadow-xl shadow-blue-200">
        <View className="flex-row justify-between mb-6">
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-white/70 text-[10px] uppercase tracking-widest"
            >
              Đơn giá
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-white text-2xl mt-1"
            >
              {formatCurrency(fee?.amount || 0)}
            </Text>
          </View>
          <View className="items-end">
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-white/70 text-[10px] uppercase tracking-widest"
            >
              Lớp học
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-white text-lg mt-1"
            >
              {fee?.className}
            </Text>
          </View>
        </View>

        <View className="mb-2 flex-row justify-between items-end">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white text-xs"
          >
            Tiến độ:{" "}
            <Text className="text-white/100">
              {paidCount}/{details.length}
            </Text>
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white text-xs"
          >
            {pct}%
          </Text>
        </View>

        <View className="h-2 bg-white/20 rounded-full overflow-hidden">
          <View
            className="h-full bg-white rounded-full"
            style={{ width: `${pct}%` }}
          />
        </View>

        <View className="flex-row items-center gap-2 mt-5">
          <Ionicons
            name="calendar-outline"
            size={12}
            color="rgba(255,255,255,0.7)"
          />
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-white/70 text-[11px]"
          >
            Hạn nộp:{" "}
            {fee?.dueDate
              ? new Date(fee.dueDate).toLocaleDateString("vi-VN")
              : "---"}
          </Text>
        </View>
      </View>

      {/* Student list */}
      <FlatList
        data={details}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#136ADA"
          />
        }
        ListHeaderComponent={
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text
              style={{ fontFamily: "Poppins-Bold", fontSize: 13 }}
              className="text-[#64748B] uppercase tracking-wider"
            >
              Danh sách học sinh
            </Text>
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 10,
                  color: "#94A3B8",
                }}
              >
                {details.length} HỌC SINH
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isPaid = item.status === "Đã đóng";
          return (
            <View className="bg-white rounded-[24px] px-5 py-4 border border-gray-100 flex-row items-center shadow-sm">
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
                <Text
                  style={{
                    fontFamily: "Poppins-Bold",
                    color: "#136ADA",
                    fontSize: 16,
                  }}
                >
                  {item.studentName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1 ml-4 mr-2">
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 15 }}
                  className="text-[#1E293B] mb-0.5"
                >
                  {item.studentName}
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Medium", fontSize: 11 }}
                  className="text-[#64748B]"
                >
                  {formatCurrency(item.amountDue)}
                </Text>
              </View>

              {isPaid ? (
                <View className="bg-green-50 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 border border-green-100">
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text
                    style={{
                      fontFamily: "Poppins-Bold",
                      color: "#16A34A",
                      fontSize: 10,
                    }}
                  >
                    ĐÃ ĐÓNG
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="bg-red-50 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 border border-red-100"
                  onPress={() =>
                    Alert.alert(
                      "Thông báo",
                      `Học sinh ${item.studentName} chưa hoàn thành học phí.`,
                    )
                  }
                >
                  <Ionicons name="time-outline" size={14} color="#EF4444" />
                  <Text
                    style={{
                      fontFamily: "Poppins-Bold",
                      color: "#EF4444",
                      fontSize: 10,
                    }}
                  >
                    CHƯA ĐÓNG
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 mt-4 text-center px-10"
            >
              Không tìm thấy học sinh nào phù hợp.
            </Text>
          </View>
        }
      />
    </AdminPageWrapper>
  );
}
