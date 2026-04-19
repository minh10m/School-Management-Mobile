import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { feeDetailService } from "../../../services/fee.service";
import { paymentService } from "../../../services/payment.service";
import { FeeDetailResponse } from "../../../types/fee";
import { PaymentResponse } from "../../../types/payment";

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<FeeDetailResponse | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await feeDetailService.getFeeDetailById(id as string);
      setDetail(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể tải thông tin hóa đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!detail) return;

    try {
      setProcessing(true);
      const res = await paymentService.createPayment({
        feeDetailId: detail.id,
      });

      setPaymentData(res);
      setShowQR(true);
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Lỗi thanh toán",
        "Không thể khởi tạo giao dịch. Vui lòng thử lại sau."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!paymentData) return;

    try {
      setProcessing(true);
      await paymentService.processWebhook(
        paymentData.orderCode,
        paymentData.amount
      );
      router.push("/student/payment/success" as any);
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi simulation", "Không thể giả lập webhook.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-10">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg mt-4">
          Không tìm thấy thông tin
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white">
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        className="px-6 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-[#1E293B] text-lg"
        >
          Xác nhận thanh toán
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Modern Stepper */}
        <View className="px-10 py-8 flex-row items-center justify-center">
          <StepItem completed icon="list" label="Danh sách" />
          <View className="flex-1 h-[2px] bg-blue-600 mx-2" />
          <StepItem active icon="card" label="Thanh toán" />
          <View className="flex-1 h-[2px] bg-gray-100 mx-2" />
          <StepItem icon="checkmark-circle" label="Hoàn tất" />
        </View>

        {/* Amount Card */}
        <View className="mx-6 bg-[#F8FAFC] rounded-[40px] p-8 items-center border border-blue-50">
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-400 text-sm uppercase tracking-widest mb-2"
          >
            {showQR ? "Thông tin chuyển khoản" : "Số tiền thanh toán"}
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-blue-600 text-4xl"
          >
            {(paymentData?.amount || detail.amountDue).toLocaleString()}{" "}
            <Text className="text-xl font-normal text-blue-300">VNĐ</Text>
          </Text>
        </View>

        {showQR && paymentData && (
          <View className="mt-8 mx-6 items-center">
            <View className="bg-white p-6 rounded-[40px] shadow-xl shadow-blue-100 border border-blue-50 items-center w-full">
              <View className="w-64 h-64 bg-gray-50 rounded-3xl items-center justify-center overflow-hidden mb-6">
                <Image
                  source={{ uri: paymentData.qrCodeUrl }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              <View className="w-full gap-4">
                <View className="bg-blue-50/50 p-4 rounded-2xl flex-row justify-between items-center">
                  <View>
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-400 text-[10px] uppercase mb-1"
                    >
                      Ngân hàng
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-[#1E293B] text-sm"
                    >
                      {paymentData.bankName}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-blue-600 text-xs"
                  >
                    Mã PIN: {paymentData.bin}
                  </Text>
                </View>

                <View className="bg-blue-50/50 p-4 rounded-2xl">
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-gray-400 text-[10px] uppercase mb-1"
                  >
                    Chủ tài khoản
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-[#1E293B] text-sm"
                  >
                    {paymentData.accountName}
                  </Text>
                </View>

                <View className="bg-blue-50/50 p-4 rounded-2xl flex-row justify-between items-center">
                  <View>
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-400 text-[10px] uppercase mb-1"
                    >
                      Số tài khoản
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-[#1E293B] text-sm"
                    >
                      {paymentData.accountNumber}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-blue-100 px-3 py-1.5 rounded-xl"
                    onPress={() => Alert.alert("Đã sao chép số tài khoản")}
                  >
                    <Ionicons name="copy-outline" size={16} color="#2563EB" />
                  </TouchableOpacity>
                </View>

                <View className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex-row justify-between items-center">
                  <View>
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-400 text-[10px] uppercase mb-1"
                    >
                      Nội dung chuyển khoản
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-blue-600 text-sm"
                    >
                      {paymentData.orderCode}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-blue-100 px-3 py-1.5 rounded-xl"
                    onPress={() => Alert.alert("Đã sao chép nội dung")}
                  >
                    <Ionicons name="copy-outline" size={16} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 text-[10px] text-center mt-6 leading-relaxed"
              >
                Hệ thống sẽ tự động cập nhật sau khi nhận được tiền.{"\n"}Vui
                lòng giữ nguyên nội dung chuyển khoản.
              </Text>
            </View>

            {/* Manual Simulation Button as requested */}
            <TouchableOpacity
              className="mt-6 flex-row items-center gap-2"
              onPress={handleSimulateWebhook}
            >
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-gray-400 text-xs text-center"
              >
                Đã chuyển khoản? Xác nhận ngay (Simulate)
              </Text>
              <Ionicons name="flash-outline" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction Details */}
        <View className="mt-10 px-6">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-[#1E293B] text-lg mb-6"
          >
            Chi tiết hóa đơn
          </Text>

          <DetailRow label="Nội dung" value={detail.reason} bold={true} />
          <DetailRow
            label="Năm học"
            value={`Học kỳ I - ${detail.schoolYear}`}
          />
          <DetailRow label="Học sinh" value={detail.studentName} />
          <DetailRow
            label="Mã hóa đơn"
            value={`INV-${detail.id.split("-")[0].toUpperCase()}`}
          />

          <View className="h-[1px] bg-gray-100 my-6" />

          <View className="flex-row justify-between items-center">
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-[#1E293B] text-xl"
            >
              Tổng cộng
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-blue-600 text-xl"
            >
              {detail.amountDue.toLocaleString()} VNĐ
            </Text>
          </View>
        </View>

        {/* Payment Methods - Modern Placeholder */}
        <View className="mt-10 px-6">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-[#1E293B] text-base mb-4"
          >
            Phương thức thanh toán
          </Text>
          <View className="flex-row gap-4">
            <PaymentMethodIcon
              icon="cash-outline"
              label="Chuyển khoản"
              active
            />
            <PaymentMethodIcon icon="card-outline" label="Thẻ nội địa" />
            <PaymentMethodIcon icon="wallet-outline" label="Momo/Zalo" />
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View
        className="absolute bottom-6 left-6 right-6"
        style={{ paddingBottom: insets.bottom }}
      >
        <TouchableOpacity
          className={`py-5 rounded-[24px] items-center shadow-xl ${
            processing ? "bg-gray-400" : "bg-blue-600 shadow-blue-200"
          }`}
          onPress={showQR ? () => router.push("/student/payment" as any) : handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-white text-base"
            >
              {showQR ? "QUAY LẠI DANH SÁCH" : "XÁC NHẬN THANH TOÁN"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepItem({ active, completed, icon, label }: any) {
  return (
    <View className="items-center">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${active || completed ? "bg-blue-600" : "bg-gray-100"} shadow-sm`}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={active || completed ? "white" : "#94A3B8"}
        />
      </View>
      <Text
        style={{
          fontFamily: active ? "Poppins-Bold" : "Poppins-Medium",
          fontSize: 10,
        }}
        className={`mt-2 ${active ? "text-blue-600" : "text-gray-400"}`}
      >
        {label}
      </Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-start mb-5">
      <Text
        style={{ fontFamily: "Poppins-Medium" }}
        className="text-gray-400 text-sm"
      >
        {label}
      </Text>
      <Text
        style={{ fontFamily: bold ? "Poppins-Bold" : "Poppins-Medium" }}
        className={`text-[#1E293B] text-sm flex-1 text-right ml-4`}
      >
        {value}
      </Text>
    </View>
  );
}

function PaymentMethodIcon({ icon, label, active = false }: any) {
  return (
    <TouchableOpacity
      className={`flex-1 p-4 rounded-3xl border ${active ? "border-blue-600 bg-blue-50/50" : "border-gray-100 bg-white"} items-center`}
    >
      <Ionicons name={icon} size={24} color={active ? "#2563EB" : "#94A3B8"} />
      <Text
        style={{ fontFamily: "Poppins-Bold", fontSize: 10 }}
        className={`mt-2 ${active ? "text-blue-600" : "text-gray-400"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
