import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { useAuthStore } from "../store/authStore";
import { Platform } from "react-native";

export const useAppPushNotifications = () => {
  const { userInfo, firebaseToken } = useAuthStore();
  const previousMessageTimestamp = useRef<number>(0);
  const previousNotiId = useRef<string | null>(null);

  useEffect(() => {
    // Request permissions
    const requestPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    if (!userInfo?.id || !firebaseToken) return;

    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeSystemNotis: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, safe to set up Firestore listeners
        
        // 1. Listen for new messages
        const conversationsQuery = query(
          collection(db, "conversations"),
          where("members", "array-contains", userInfo.id)
        );

        unsubscribeMessages = onSnapshot(conversationsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "modified" || change.type === "added") {
              const data = change.doc.data();
              const lastMsg = data.lastMessage;
              const lastMsgAt = data.lastMessageAt?.toMillis ? data.lastMessageAt.toMillis() : (data.lastMessageAt ? new Date(data.lastMessageAt).getTime() : 0);

              if (
                lastMsg &&
                lastMsg.senderId !== userInfo.id &&
                lastMsgAt > previousMessageTimestamp.current
              ) {
                // New message detected from someone else
                // Update timestamp to avoid duplicate notifications
                previousMessageTimestamp.current = lastMsgAt;

                const contentStr = typeof lastMsg.content === 'string' ? lastMsg.content : (lastMsg.content?.content || 'Hình ảnh / Tệp đính kèm');
                const formattedBody = contentStr.replace(/\[/g, '« ').replace(/\]/g, ' »');

                Notifications.scheduleNotificationAsync({
                  content: {
                    title: `💬 EduManage | ${lastMsg.senderName ? `Tin nhắn từ ${lastMsg.senderName}` : "Tin nhắn mới"}`,
                    body: formattedBody,
                    data: { type: "chat", conversationId: change.doc.id },
                  },
                  trigger: null,
                });
              }
            }
          });
        }, (error) => {
          console.log("Firestore (Messages) snapshot error:", error);
        });

        // 2. Listen for system notifications
        const notiDocRef = doc(db, "notifications", userInfo.id);
        unsubscribeSystemNotis = onSnapshot(notiDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const lastNoti = data.lastNoti;

            if (lastNoti && lastNoti.id && lastNoti.id !== previousNotiId.current) {
              // New notification detected
              // Wait to skip initial render notification
              if (previousNotiId.current !== null) {
                const contentStr = lastNoti.content || "Bạn có một thông báo mới.";
                const formattedBody = contentStr.replace(/\[/g, '« ').replace(/\]/g, ' »');

                Notifications.scheduleNotificationAsync({
                  content: {
                    title: `🔔 EduManage | ${lastNoti.title || "Thông báo hệ thống"}`,
                    body: formattedBody,
                    data: { type: lastNoti.type, notiId: lastNoti.id },
                  },
                  trigger: null,
                });
              }
              previousNotiId.current = lastNoti.id;
            }
          }
        }, (error) => {
          console.log("Firestore (SystemNotis) snapshot error:", error);
        });
      } else {
        // User is signed out, clean up listeners
        if (unsubscribeMessages) unsubscribeMessages();
        if (unsubscribeSystemNotis) unsubscribeSystemNotis();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeSystemNotis) unsubscribeSystemNotis();
    };
  }, [userInfo?.id, firebaseToken]);
};
