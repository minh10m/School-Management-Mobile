import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

const API_URL = Constants.expoConfig?.extra?.apiUrl;
const HUB_URL = `${API_URL?.replace(/\/api$/, '')}/paymentHub`; // Remove /api if present at the end

export interface PaymentStatus {
  status: 'Success' | 'Error';
  message: string;
}

export const usePaymentHub = (onPaymentStatusReceived?: (status: PaymentStatus) => void) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { userInfo, accessToken } = useAuthStore();

  // BƯỚC QUAN TRỌNG: Lưu callback vào ref để tránh khởi động lại SignalR khi hàm thay đổi
  const callbackRef = useRef(onPaymentStatusReceived);
  useEffect(() => {
    callbackRef.current = onPaymentStatusReceived;
  }, [onPaymentStatusReceived]);

  useEffect(() => {
    if (!accessToken || !userInfo?.id) return;

    // Nếu đã có connection rồi thì không tạo mới
    if (connectionRef.current) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Đăng ký listener trước khi start
    connection.on('ReceivePaymentStatus', (data: PaymentStatus) => {
      console.log('SignalR: Received Payment Data:', data);
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    });

    const startConnection = async () => {
      if (connection.state !== signalR.HubConnectionState.Disconnected) return;
      
      try {
        console.log('SignalR: Attempting to connect...');
        await connection.start();
        console.log('SignalR: Connected successfully!');
        setIsConnected(true);
      } catch (err: any) {
        // Bỏ qua lỗi negotiation thường gặp khi render quá nhanh
        if (!err.message?.includes('stopped during negotiation')) {
          console.error('SignalR: Connection Error:', err.message);
        }
        setIsConnected(false);
      }
    };

    startConnection();

    return () => {
      if (connectionRef.current) {
        connection.stop()
          .then(() => console.log('SignalR: Connection stopped cleanly'))
          .catch(err => console.warn('SignalR: Error stopping connection:', err));
        connectionRef.current = null;
        setIsConnected(false);
      }
    };
  }, [accessToken, userInfo?.id]);

  return { isConnected };
};
