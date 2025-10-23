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
  Image,
} from "react-native";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
}

export default function ChatRoom({ route }: any) {
  const chatId = route?.params?.chatId;
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
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim() || !chatId || !user) return;

    const messagesRef = collection(db, "Chats", chatId, "messages");
    await addDoc(messagesRef, {
      text: input.trim(),
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.uid;
    return (
      <View
        style={[
          styles.messageWrapper,
          isMe ? styles.myMessageWrapper : styles.otherMessageWrapper,
        ]}
      >
        {!isMe && (
          <Image
            source={{
              uri:
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={[styles.messageText, isMe && { color: "#fff" }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (!chatId) {
    return (
      <View style={styles.center}>
        <Text>No chat selected.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#e9eef7" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Aa"
            value={input}
            onChangeText={setInput}
            style={styles.input}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Messenger-like message alignment
  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
  },
  myMessageWrapper: { justifyContent: "flex-end", alignSelf: "flex-end" },
  otherMessageWrapper: { alignSelf: "flex-start" },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 6,
  },

  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  myMessage: {
    backgroundColor: "#0084ff",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "#000",
    fontSize: 16,
  },

  inputContainer: {
    padding: 8,
    borderTopWidth: 0,
    backgroundColor: "#e9eef7",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    borderRadius: 25,
    padding: 10,
  },
});
