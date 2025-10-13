import { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { db } from "../../firebaseConfig";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";

interface ChatRoomProps {
  userId: string;
}

export default function ChatRoom({ userId }: ChatRoomProps) {
  const { id } = useLocalSearchParams(); // chatId
  const [message, setMessage] = useState("");
  type Message = { text: string; senderId: string; timestamp?: any };
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (typeof id !== "string") return;
    const q = query(collection(db, "messages", id, "messages"), orderBy("timestamp"));
    const unsub = onSnapshot(q, (snapshot) => {
      return setMessages(
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            text: data.text || "",
            senderId: data.senderId || "",
            timestamp: data.timestamp,
          } as Message;
        })
      );
    });
    return unsub;
  }, [id]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (typeof id !== "string") return;
    await addDoc(collection(db, "messages", id, "messages"), {
      senderId: userId,
      text: message,
      timestamp: serverTimestamp(),
    });
    setMessage("");
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <Text>{item.text}</Text>}
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type..."
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
