import * as signalR from '@microsoft/signalr';
import Constants from 'expo-constants';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';

const API_URL = Constants.expoConfig?.extra?.apiUrl;
const HUB_URL = `${API_URL?.replace(/\/api$/, '')}/paymentHub`;

export interface PaymentStatus {
  status: 'Success' | 'Error';
  message: string;
}

export const usePaymentHub = (
  onPaymentStatusReceived?: (status: PaymentStatus) => void,
  enabled: boolean = true
) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { userInfo, accessToken } = useAuthStore();

  const callbackRef = useRef(onPaymentStatusReceived);
  useEffect(() => {
    callbackRef.current = onPaymentStatusReceived;
  }, [onPaymentStatusReceived]);

  useEffect(() => {
     if (!enabled) {
        // ✅ Reset ref khi disabled để lần sau enabled lại sẽ tạo connection mới
        connectionRef.current = null;
        return;
    }
    if (!accessToken || !userInfo?.id || !enabled) return;

    if (connectionRef.current) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // ✅ Stop SAU KHI nhận event, không stop trong cleanup
    connection.on('ReceivePaymentStatus', (data: PaymentStatus) => {
      console.log('SignalR: Received Payment Data:', data);
      if (callbackRef.current) {
        callbackRef.current(data);
      }
      connection.stop()
        .then(() => console.log('SignalR: Stopped after receiving event'))
        .catch(err => console.warn('SignalR: Error stopping after event:', err));
      connectionRef.current = null;
      setIsConnected(false);
    });

    const startConnection = async () => {
      if (connection.state !== signalR.HubConnectionState.Disconnected) return;

      try {
        console.log('SignalR: Attempting to connect...');
        await connection.start();
        console.log('SignalR: Connected successfully!');
        setIsConnected(true);
      } catch (err: any) {
        if (!err.message?.includes('stopped during negotiation')) {
          console.error('SignalR: Connection Error:', err.message);
        }
        setIsConnected(false);
      }
    };

    startConnection();
   
  }, [accessToken, userInfo?.id, enabled]);

  return { isConnected };
};