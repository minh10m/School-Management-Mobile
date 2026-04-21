import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { feeDetailService } from "../../../services/fee.service";
import { paymentService } from "../../../services/payment.service";
import { FeeDetailResponse } from "../../../types/fee";
import { PaymentResponse } from "../../../types/payment";
import { usePaymentHub } from "../../../hooks/usePaymentHub";

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<FeeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const insets = useSafeAreaInsets();
  
  // Use SignalR Hub for real-time payment status
  const { isConnected: isSignalRConnected } = usePaymentHub((status) => {
    if (status.status === "Success") {
      setShowQR(false);
      router.push("/student/payment/success" as any);
    } else {
      Alert.alert("Thanh toán thất bại", status.message);
    }
  });

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  // We keep a simple verification state just to show the UI feedback
  useEffect(() => {
    setIsVerifying(showQR);
  }, [showQR]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await feeDetailService.getFeeDetailById(id as string);
      setDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!detail) return;

    try {
      setIsProcessing(true);
      // 1. Tell backend we want to pay
      const response = await paymentService.payTheBill({
        feeDetailId: detail.id,
      });

      setPaymentInfo(response);
      setShowQR(true);
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể khởi tạo giao dịch. Vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
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
          <View
            className={`flex-1 h-[2px] ${detail.status === "Đã đóng" ? "bg-blue-600" : "bg-blue-600"} mx-2`}
          />
          <StepItem
            completed={detail.status === "Đã đóng"}
            active={detail.status !== "Đã đóng"}
            icon="card"
            label="Thanh toán"
          />
          <View
            className={`flex-1 h-[2px] ${detail.status === "Đã đóng" ? "bg-blue-600" : "bg-gray-100"} mx-2`}
          />
          <StepItem
            active={detail.status === "Đã đóng"}
            completed={detail.status === "Đã đóng"}
            icon="checkmark-circle"
            label="Hoàn tất"
          />
        </View>

        {/* Amount Card */}
        <View className="mx-6 bg-[#F8FAFC] rounded-[40px] p-8 items-center border border-blue-50">
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-400 text-sm uppercase tracking-widest mb-2"
          >
            Số tiền thanh toán
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-blue-600 text-4xl"
          >
            {detail.amountDue.toLocaleString()}{" "}
            <Text className="text-xl font-normal text-blue-300">VNĐ</Text>
          </Text>
        </View>

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

        {/* Payment Methods */}
        <View className="mt-10 px-6">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-[#1E293B] text-base mb-4"
          >
            Phương thức thanh toán
          </Text>
          <View className="flex-row">
            <PaymentMethodIcon
              icon="cash-outline"
              label="Chuyển khoản (VietQR)"
              active
            />
            <View className="flex-[2]" />
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View
        className="absolute bottom-6 left-6 right-6"
        style={{ paddingBottom: insets.bottom }}
      >
        <TouchableOpacity
          className={`${detail.status === "Đã đóng" ? "bg-green-500" : "bg-blue-600"} py-5 rounded-[24px] items-center shadow-xl ${detail.status === "Đã đóng" ? "shadow-green-100" : "shadow-blue-200"} ${isProcessing ? "opacity-70" : ""}`}
          onPress={
            detail.status === "Đã đóng"
              ? () => router.replace("/student/payment")
              : handleConfirmPayment
          }
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-white text-base"
            >
              {detail.status === "Đã đóng" ? "HOÀN TẤT" : "XÁC NHẬN THANH TOÁN"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Code Modal */}
      <Modal
        visible={showQR}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQR(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-10">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-8" />

            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-xl text-[#1E293B]"
                >
                  Quét mã VietQR
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-xs"
                >
                  Mở app Ngân hàng để quét thanh toán
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQR(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {paymentInfo && (
              <View className="items-center">
                <View className="p-4 bg-white border-2 border-blue-600 rounded-[32px] shadow-2xl shadow-blue-200">
                  <Image
                    source={{ uri: paymentInfo.qrCodeUrl }}
                    style={{ width: 240, height: 240 }}
                    resizeMode="contain"
                  />
                </View>

                <View className="mt-8 w-full bg-blue-50 rounded-3xl p-5 border border-blue-100">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-blue-400 text-xs uppercase tracking-widest"
                    >
                      Ngân hàng
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-[#1E293B] text-sm"
                    >
                      {paymentInfo.bankName}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-blue-400 text-xs uppercase tracking-widest"
                    >
                      Số tài khoản
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-[#1E293B] text-sm"
                    >
                      {paymentInfo.accountNumber}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-blue-400 text-xs uppercase tracking-widest"
                    >
                      Nội dung
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-blue-600 text-sm"
                    >
                      {paymentInfo.orderCode}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center pt-3 border-t border-blue-100">
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-blue-400 text-xs uppercase tracking-widest"
                    >
                      Số tiền
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-[#1E293B] text-lg"
                    >
                      {paymentInfo.amount.toLocaleString()} VNĐ
                    </Text>
                  </View>
                </View>

                <View className="mt-8 items-center flex-row">
                  <ActivityIndicator
                    size="small"
                    color={isSignalRConnected ? "#10B981" : "#3B82F6"}
                    className="mr-3"
                  />
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className={isSignalRConnected ? "text-emerald-600 text-sm" : "text-blue-600 text-sm"}
                  >
                    {isSignalRConnected 
                      ? "Đã kết nối trực tiếp - Chờ thanh toán..." 
                      : "Đang chờ bạn thanh toán..."}
                  </Text>
                </View>

                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-[10px] text-center mt-3 px-10"
                >
                  Hệ thống sẽ tự động xác nhận sau khi nhận được tiền. Vui lòng
                  không tắt màn hình này.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
