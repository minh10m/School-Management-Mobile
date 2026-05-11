import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { aiChatService } from "../services/aiChat.service";
import { useAuthStore } from "../store/authStore";

// Inline types to avoid stale module resolution
const AI_AVATAR = require("../assets/images/AI-Assist.png");

interface ChatMessage {
  id: string;
  content: string;
  role: "USER" | "AI";
  createdAt: string;
}

interface Props {
  role: "Student" | "Teacher" | "Admin";
}

const ROLE_CONFIG = {
  Student: {
    accent: "#136ADA",
    accentLight: "#EBF3FF",
    headerBg: "#136ADA",
    label: "Học sinh",
    greeting:
      "Xin chào! Mình là EduManage AI 🤖\nMình có thể giúp bạn tra cứu điểm, lịch học, lịch thi, học phí, sự kiện và nội quy trường học. Hỏi gì đi nào! 📚",
    suggestions: [
      "Điểm học kì của tôi?",
      "Lịch thi sắp tới?",
      "Học phí học kì này?",
      "Nội quy nhà trường?",
    ],
  },
  Teacher: {
    accent: "#8B5CF6",
    accentLight: "#F3EEFF",
    headerBg: "#8B5CF6",
    label: "Giáo viên",
    greeting:
      "Xin chào thầy/cô! Mình là EduManage AI 🤖\nMình có thể hỗ trợ thầy/cô tra cứu lịch dạy, danh sách học sinh, lịch thi, sự kiện và các nghiệp vụ quản lý. Thầy/cô cần gì nào! 📖",
    suggestions: [
      "Lịch dạy tuần này?",
      "Danh sách học sinh lớp tôi?",
      "Lịch thi học kì này?",
      "Hướng dẫn sử dụng app?",
    ],
  },
  Admin: {
    accent: "#059669",
    accentLight: "#ECFDF5",
    headerBg: "#059669",
    label: "Quản trị viên",
    greeting:
      "Xin chào Admin! Mình là EduManage AI 🤖\nMình có thể hỗ trợ bạn quản lý trường học, tra cứu thống kê, và bạn cũng có thể upload tài liệu nội quy để cập nhật knowledge base của mình nhé! 🏫",
    suggestions: [
      "Thống kê học sinh?",
      "Danh sách giáo viên?",
      "Upload tài liệu nội quy",
      "Hướng dẫn sử dụng hệ thống?",
    ],
  },
};

function formatMessage(content: string) {
  if (!content) return null;
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <View key={i} style={{ height: 8 }} />;

    // Bullet points
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      return (
        <View key={i} style={{ flexDirection: "row", marginBottom: 4, paddingLeft: 4 }}>
          <Text style={{ fontSize: 13, lineHeight: 22, marginRight: 6 }}>•</Text>
          <Text style={{ flex: 1, fontFamily: "Poppins-Regular", fontSize: 13, lineHeight: 22, color: "#1a1a1a" }}>
            {renderLineContent(trimmed.substring(2))}
          </Text>
        </View>
      );
    }

    return (
      <Text
        key={i}
        style={{
          fontFamily: "Poppins-Regular",
          fontSize: 13,
          lineHeight: 22,
          color: "#1a1a1a",
          marginBottom: 6,
        }}
      >
        {renderLineContent(trimmed)}
      </Text>
    );
  });
}

function renderLineContent(text: string) {
  const parts = [];
  let last = 0;
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<Text key={last}>{text.slice(last, match.index)}</Text>);
    }
    parts.push(
      <Text key={match.index} style={{ fontFamily: "Poppins-Bold" }}>
        {match[1]}
      </Text>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(<Text key={last}>{text.slice(last)}</Text>);
  }
  return parts.length > 0 ? parts : text;
}

export default function AIChatScreen({ role }: Props) {
  const config = ROLE_CONFIG[role];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Animated typing dots
  useEffect(() => {
    if (!isLoading) return;
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [isLoading]);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await aiChatService.getChatHistory(1, 50);
      const sorted = [...res.items].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      setMessages(
        sorted.map((m) => ({
          id: m.id,
          content: m.content,
          role: m.role,
          createdAt: m.createdAt,
        })),
      );
    } catch {
      // no history yet — ok
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !isLoadingHistory) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [messages, isLoadingHistory]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const question = (text ?? input).trim();
      if (!question || isLoading) return;

      if (question === "Upload tài liệu nội quy" && role === "Admin") {
        handleUpload();
        return;
      }

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        content: question,
        role: "USER",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await aiChatService.chat({ userQuestion: question });
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            content: res.aiResponse,
            role: "AI",
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            content:
              "Hiện hệ thống đang gặp sự cố, vui lòng thử lại sau nhé 🙏",
            role: "AI",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, role],
  );

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setIsUploading(true);
      await aiChatService.uploadKnowledgeBase({
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? "application/octet-stream",
      });
      Alert.alert("Thành công", "Tài liệu đã được nạp vào hệ thống!");
    } catch {
      Alert.alert("Lỗi", "Không thể upload tài liệu. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const timeStr = (iso: string) =>
    new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUser = item.role === "USER";
      if (isUser) {
        return (
          <View style={styles.userBubbleWrap}>
            <View
              style={[styles.userBubble, { backgroundColor: config.accent }]}
            >
              <Text style={styles.userText}>{item.content}</Text>
              <Text style={styles.timeUser}>{timeStr(item.createdAt)}</Text>
            </View>
          </View>
        );
      }
      return (
        <View style={styles.aiBubbleWrap}>
          <View style={styles.aiAvatar}>
            <Image
              source={AI_AVATAR}
              style={{ width: "100%", height: "100%", borderRadius: 15 }}
              contentFit="cover"
            />
          </View>
          <View style={styles.aiBubble}>
            {formatMessage(item.content)}
            <Text style={styles.timeAI}>{timeStr(item.createdAt)}</Text>
          </View>
        </View>
      );
    },
    [config],
  );

  const showEmpty = !isLoadingHistory && messages.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Image
              source={AI_AVATAR}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>EduManage AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Trực tuyến</Text>
            </View>
          </View>
        </View>
        {role === "Admin" && (
          <TouchableOpacity
            onPress={handleUpload}
            style={styles.uploadBtn}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={config.accent} />
            ) : (
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={config.accent}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {isLoadingHistory ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={config.accent} />
            <Text style={[styles.loadingText, { color: config.accent }]}>
              Đang tải lịch sử...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.messageList,
              showEmpty && { flex: 1, justifyContent: "center" },
            ]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Image
                    source={AI_AVATAR}
                    style={{ width: "100%", height: "100%", borderRadius: 36 }}
                    contentFit="cover"
                  />
                </View>
                <Text style={[styles.emptyTitle, { color: config.accent }]}>
                  EduManage AI
                </Text>
                <Text style={styles.emptySubtitle}>{config.greeting}</Text>
                <View style={styles.suggestions}>
                  {config.suggestions.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.chip,
                        {
                          borderColor: config.accent + "50",
                          backgroundColor: config.accentLight,
                        },
                      ]}
                      onPress={() => sendMessage(s)}
                    >
                      <Text style={[styles.chipText, { color: config.accent }]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
            ListFooterComponent={
              isLoading ? (
                <View style={styles.aiBubbleWrap}>
                  <View style={styles.aiAvatar}>
                    <Image
                      source={AI_AVATAR}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 15,
                      }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={styles.aiBubble}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 5,
                        alignItems: "center",
                        paddingVertical: 4,
                      }}
                    >
                      {[dot1, dot2, dot3].map((d, i) => (
                        <Animated.View
                          key={i}
                          style={[
                            styles.typingDot,
                            { backgroundColor: config.accent, opacity: d },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Quick suggestions when chat has messages */}
        {messages.length > 0 && !isLoading && (
          <View style={styles.quickSuggest}>
            <FlatList
              data={config.suggestions}
              horizontal
              showsHorizontalScrollIndicator={true}
              showsVerticalScrollIndicator={true}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.quickChip,
                    {
                      borderColor: config.accent + "50",
                      backgroundColor: config.accentLight,
                    },
                  ]}
                  onPress={() => sendMessage(item)}
                >
                  <Text
                    style={[styles.quickChipText, { color: config.accent }]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color={config.accent}
                style={{ marginRight: 8 }}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Hỏi EduManage AI..."
              placeholderTextColor="#BBBBBB"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              editable={!isLoading}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            {role === "Admin" && (
              <TouchableOpacity
                onPress={handleUpload}
                style={styles.attachBtn}
                disabled={isUploading}
              >
                <Ionicons name="attach-outline" size={20} color="#BBBBBB" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    input.trim() && !isLoading ? config.accent : "#E5E7EB",
                },
              ]}
            >
              <Ionicons
                name="send"
                size={16}
                color={input.trim() && !isLoading ? "white" : "#9CA3AF"}
                style={{ marginLeft: 2 }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
    marginRight: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#1A1A1A",
    lineHeight: 20,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  onlineText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#6B7280",
  },
  uploadBtn: { padding: 8 },
  // Center loading
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { fontFamily: "Poppins-Regular", fontSize: 13 },
  // Messages
  messageList: { padding: 16, paddingBottom: 8, gap: 12 },
  // User bubble
  userBubbleWrap: { alignItems: "flex-end", marginBottom: 4 },
  userBubble: {
    maxWidth: "80%",
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "white",
    lineHeight: 20,
  },
  timeUser: {
    fontFamily: "Poppins-Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    textAlign: "right",
  },
  // AI bubble
  aiBubbleWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
    maxWidth: "90%",
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  aiBubble: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timeAI: {
    fontFamily: "Poppins-Regular",
    fontSize: 9,
    color: "#AAAAAA",
    marginTop: 6,
  },
  // Typing dots
  typingDot: { width: 8, height: 8, borderRadius: 4 },
  // Empty state
  emptyState: { alignItems: "center", paddingHorizontal: 24, paddingTop: 20 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  emptyTitle: { fontFamily: "Poppins-Bold", fontSize: 18, marginBottom: 8 },
  emptySubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  suggestions: { width: "100%", gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontFamily: "Poppins-Medium", fontSize: 12 },
  // Quick suggest bar
  quickSuggest: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  quickChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickChipText: { fontFamily: "Poppins-Medium", fontSize: 11 },
  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    backgroundColor: "white",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F6",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8EC",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#111",
    maxHeight: 120,
    lineHeight: 20,
    textAlignVertical: "center",
    paddingTop: 0,
    paddingBottom: 0,
  },
  attachBtn: { paddingLeft: 8 },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
