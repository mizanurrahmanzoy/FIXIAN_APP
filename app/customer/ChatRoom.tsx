// app/customer/ChatRoom.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { useLocalSearchParams } from "expo-router";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatRoom() {
  const { chatId, senderId, receiverName } = useLocalSearchParams();
  const chatIdStr = Array.isArray(chatId) ? chatId[0] : (chatId ?? "");
  const senderIdStr = Array.isArray(senderId) ? senderId[0] : (senderId ?? "");

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatIdStr) return;

    const messagesRef = collection(db, "chats", chatIdStr, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          user: {
            _id: data.user._id,
            name: data.user.name,
          },
        };
      });
      setMessages(allMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatIdStr]);

  const onSend = useCallback(
    async (messagesArray: any[] = []) => {
      const msg = messagesArray[0];
      if (!msg) return;

      const messagesRef = collection(db, "chats", chatIdStr, "messages");

      // Add message to Firestore
      await addDoc(messagesRef, {
        text: msg.text,
        createdAt: serverTimestamp(),
        user: {
          _id: senderIdStr,
          name: "You",
        },
      });

      // Update local state immediately
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, msg)
      );
    },
    [chatIdStr, senderIdStr]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading chat with {receiverName}...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginBottom: 50 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat with {receiverName}</Text>
      </View>

      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: senderIdStr, name: "You" }}
        placeholder="Type your message..."
        showUserAvatar
        renderUsernameOnMessage
        scrollToBottom
        alwaysShowSend
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 16, backgroundColor: "#007bff" },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
