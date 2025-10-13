// app/chat/ChatRoom.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
}

export default function ChatRoom({ route, navigation }: any) {
  const chatId = route?.params?.chatId;
  const participantIds = route?.params?.participantIds; // optional, in case you need for display
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "Chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setMessages(msgs);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim() || !chatId || !user) return;

    const messagesRef = collection(db, "Chats", chatId, "messages");

    try {
      await addDoc(messagesRef, {
        text: input.trim(),
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!chatId) {
    return (
      <View style={styles.center}>
        <Text>No chat selected.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.uid;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f4f4f4" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 5,
  },
  myMessage: { backgroundColor: "#007bff", alignSelf: "flex-end" },
  otherMessage: { backgroundColor: "#ccc", alignSelf: "flex-start" },
  messageText: { color: "#fff" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 25,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
