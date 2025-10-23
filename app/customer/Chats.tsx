// app/customer/Chats.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, onSnapshot, orderBy, getDocs } from "firebase/firestore";

export default function Chats() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const messagesRef = collection(db, "chats", doc.id, "messages");
          const lastMsgQuery = query(messagesRef, orderBy("createdAt", "desc"));
          const messagesSnapshot = await getDocs(lastMsgQuery);

          const lastMsgDoc = messagesSnapshot.docs[0];
          const lastMessage = lastMsgDoc
            ? { ...lastMsgDoc.data(), id: lastMsgDoc.id }
            : { text: "No messages yet", createdAt: null };

          // Determine chat name
          const otherParticipantId = data.participants.find((id: string) => id !== user.uid);
          const chatName = data.providerName || data.customerName || "Unknown";

          return {
            chatId: doc.id,
            lastMessage,
            chatName,
            participants: data.participants,
          };
        })
      );

      setChats(chatsData.sort((a, b) => {
        const timeA = a.lastMessage.createdAt?.toMillis() || 0;
        const timeB = b.lastMessage.createdAt?.toMillis() || 0;
        return timeB - timeA; // newest first
      }));

      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const openChat = (chat: any) => {
    const otherParticipantId = chat.participants.find((id: string) => id !== user.uid);
    router.push(
      `/customer/ChatRoom?chatId=${chat.chatId}&senderId=${user.uid}&receiverId=${otherParticipantId}&receiverName=${chat.chatName}`
    );
  };

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.chatCard} onPress={() => openChat(item)}>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.chatName}</Text>
        <Text
          style={styles.chatLastMessage}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage.text}
        </Text>
      </View>
      <Text style={styles.chatTime}>
        {item.lastMessage.createdAt
          ? new Date(item.lastMessage.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : ""}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.chatId}
        renderItem={renderChatItem}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eee" }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  chatCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  chatContent: { flex: 1, marginRight: 10 },
  chatName: { fontSize: 16, fontWeight: "600", color: "#111" },
  chatLastMessage: { fontSize: 14, color: "#666", marginTop: 2 },
  chatTime: { fontSize: 12, color: "#999" },
});
