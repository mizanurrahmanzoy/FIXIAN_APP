// app/service_provider/ChatRoom.tsx
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
  doc,
  updateDoc,
} from "firebase/firestore";

export default function ChatRoom() {
  const { chatId, senderId, receiverId, receiverName } = useLocalSearchParams();
  const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId ?? "";
  const senderIdStr = Array.isArray(senderId) ? senderId[0] : senderId ?? "";
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch messages
  useEffect(() => {
    if (!chatIdStr) return;
    const messagesRef = collection(db, "chats", chatIdStr, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => {
        const firebaseData = doc.data();
        return {
          _id: doc.id,
          text: firebaseData.text,
          createdAt: firebaseData.createdAt ? firebaseData.createdAt.toDate() : new Date(),
          user: {
            _id: firebaseData.user._id,
            name: firebaseData.user.name,
          },
          readBy: firebaseData.readBy || [],
        };
      });

      setMessages(allMessages.reverse());
      setLoading(false);

      // Mark all customer messages as read
      snapshot.docs.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data.user._id !== senderIdStr && !(data.readBy || []).includes(senderIdStr)) {
          const msgRef = doc(db, "chats", chatIdStr, "messages", docSnap.id);
          await updateDoc(msgRef, {
            readBy: [...(data.readBy || []), senderIdStr],
          });
        }
      });
    });

    return () => unsubscribe();
  }, [chatIdStr, senderIdStr]);

  const onSend = useCallback(
    async (messagesArray: any[] = []) => {
      const msg = messagesArray[0];
      if (!msg) return;

      const messagesRef = collection(db, "chats", chatIdStr, "messages");
      await addDoc(messagesRef, {
        text: msg.text,
        createdAt: serverTimestamp(),
        user: { _id: senderIdStr, name: "You" },
        readBy: [senderIdStr],
      });
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
    <View style={{ flex: 1 , marginBottom: 50}}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat with {receiverName}</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{ _id: senderIdStr, name: "You" }}
        placeholder="Type a message..."
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
