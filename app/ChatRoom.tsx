import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { useLocalSearchParams } from "expo-router";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatRoom() {
  const params = useLocalSearchParams();
  const chatId = String(params.chatId);
  const senderId = String(params.senderId);
  const receiverId = params.receiverId;
  const receiverName = params.receiverName;
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => {
        const firebaseData = doc.data();
        const message = {
          _id: doc.id,
          text: firebaseData.text,
          createdAt: firebaseData.createdAt
            ? firebaseData.createdAt.toDate()
            : new Date(),
          user: {
            _id: firebaseData.user._id,
            name: firebaseData.user.name,
          },
        };
        return message;
      });
      setMessages(allMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const onSend = useCallback(async (messagesArray: { text: string; user: any; createdAt: Date; _id: string }[] = []) => {
    const msg = messagesArray[0];
    const messagesRef = collection(db, "chats", chatId, "messages");

    await addDoc(messagesRef, {
      text: msg.text,
      createdAt: serverTimestamp(),
      user: {
        _id: senderId,
        name: "You",
      },
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading chat with {receiverName}...</Text>
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: senderId,
      }}
      placeholder="Type your message..."
      showUserAvatar={true}
      renderUsernameOnMessage={true}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
