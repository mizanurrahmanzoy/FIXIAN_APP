// app/chat/ChatRoom.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, SearchParams } from "expo-router";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useSearchParams } from "expo-router/build/hooks";

export default function ChatRoom() {
  const searchParams = useSearchParams();
  const providerId = searchParams.get("providerId");
  const providerName = searchParams.get("providerName");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const user = auth.currentUser;
  const router = useRouter();

  // Generate unique chatId for customer-provider pair
  const generateChatId = (uid1: string, uid2: string) =>
    uid1 < uid2 ? uid1 + "_" + uid2 : uid2 + "_" + uid1;

  useEffect(() => {
    if (!user || !providerId) return;

    const id = generateChatId(user.uid, providerId);
    setChatId(id);

    const chatDocRef = doc(db, "Chats", id);

    // Ensure chat document exists
    const setupChat = async () => {
      const chatSnap = await getDoc(chatDocRef);
      if (!chatSnap.exists()) {
        await setDoc(chatDocRef, {
          participants: [user.uid, providerId],
          providerId,
          providerName,
          customerId: user.uid,
          customerName: user.displayName || "Customer",
          createdAt: serverTimestamp(),
        });
      }
      const chatSnapUpdated = await getDoc(chatDocRef);
      setChatInfo(chatSnapUpdated.data());
    };

    setupChat();

    // Listen to messages in real-time
    const messagesRef = collection(db, "Chats", id, "Messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, providerId]);

  const handleSend = async () => {
    if (!input.trim() || !chatId || !user) return;
    try {
      await addDoc(collection(db, "Chats", chatId, "Messages"), {
        text: input,
        senderId: user.uid,
        senderName: user.displayName || "User",
        createdAt: serverTimestamp(),
      });
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isSender = item.senderId === user?.uid;
    return (
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.sender : styles.receiver,
        ]}
      >
        {!isSender && <Text style={styles.senderName}>{item.senderName}</Text>}
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>
          {item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {chatInfo?.providerName || chatInfo?.customerName || "Chat"}
        </Text>
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#111"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    color: "#111",
  },
  messageContainer: {
    maxWidth: "75%",
    marginVertical: 4,
    padding: 10,
    borderRadius: 12,
  },
  sender: {
    backgroundColor: "#2563EB",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  receiver: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
    color: "#555",
  },
  messageText: {
    fontSize: 14,
    color: "#111",
  },
  timeText: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
    textAlign: "right",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F1F1F1",
    borderRadius: 25,
    fontSize: 14,
    color: "#111",
  },
  sendBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 25,
    padding: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
