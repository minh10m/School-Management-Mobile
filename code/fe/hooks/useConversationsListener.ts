import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useAuthStore } from "../store/authStore";

export interface RealtimeConversation {
  id: string;
  lastMessageAt: Date | null;
  lastMessage: string | null;
  members: string[];
  unreadCounts: Record<string, number>;
}

export const useConversationsListener = () => {
  const { userInfo, firebaseToken } = useAuthStore();
  const [conversations, setConversations] = useState<RealtimeConversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    // Chỉ bắt đầu lắng nghe khi user đã đăng nhập và có firebaseToken
    if (!userInfo?.id || !firebaseToken) return;

    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", userInfo.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convos: RealtimeConversation[] = [];
        let unreadSum = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          let lastMsg = null;
          if (data.lastMessage) {
            if (typeof data.lastMessage === "string") {
              lastMsg = data.lastMessage;
            } else if (typeof data.lastMessage === "object" && data.lastMessage.content) {
              lastMsg = data.lastMessage.content;
            }
          }

          const convo: RealtimeConversation = {
            id: doc.id,
            lastMessageAt: data.lastMessageAt ? data.lastMessageAt.toDate() : null,
            lastMessage: lastMsg,
            members: data.members || [],
            unreadCounts: data.unreadCounts || {},
          };

          convos.push(convo);

          if (convo.unreadCounts[userInfo.id]) {
            unreadSum += convo.unreadCounts[userInfo.id];
          }
        });

        // Sắp xếp các đoạn chat: mới nhất lên đầu
        convos.sort((a, b) => {
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
        });

        setConversations(convos);
        setTotalUnread(unreadSum);
      },
      (error) => {
        console.log("Lỗi khi lắng nghe thay đổi Firestore:", error);
      }
    );

    return () => {
      unsubscribe(); // Hủy đăng ký listener khi component unmount
    };
  }, [userInfo?.id, firebaseToken]);

  return {
    conversations,
    totalUnread,
  };
};
