// app/service_provider/Chats.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
} from "firebase/firestore";

type ChatMessage = {
  id: string;
  text: string;
  createdAt: any;
  user?: { _id: string; name: string };
  readBy?: string[];
};

export default function ProviderChats() {
  const [chats, setChats] = useState<any[]>([]);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const provider = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!provider) return;

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", provider.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const messagesRef = collection(db, "chats", docSnap.id, "messages");
          const messagesSnapshot = await getDocs(query(messagesRef, orderBy("createdAt", "desc")));
          const lastMsgDoc = messagesSnapshot.docs[0];

          const lastMessage = lastMsgDoc
            ? { ...(lastMsgDoc.data() as ChatMessage), id: lastMsgDoc.id }
            : { text: "No messages yet", createdAt: null, user: { _id: "" }, readBy: [] };

          const otherParticipantId = data.participants.find((id: string) => id !== provider.uid);

          const unread =
            lastMessage?.user?._id &&
            lastMessage.user._id !== provider.uid &&
            !lastMessage.readBy?.includes(provider.uid);

          return {
            chatId: docSnap.id,
            chatName: data.customerName || "Unknown User",
            avatarUrl: data.customerAvatar || "https://i.pravatar.cc/150?img=5",
            lastMessage,
            participants: data.participants,
            unread,
            otherParticipantId,
          };
        })
      );

      const sortedChats = chatsData.sort((a, b) => {
        const timeA = a.lastMessage.createdAt?.toMillis?.() ?? 0;
        const timeB = b.lastMessage.createdAt?.toMillis?.() ?? 0;
        return timeB - timeA;
      });

      setChats(sortedChats);
      setFilteredChats(sortedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [provider]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat.chatName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  };

  const openChat = (chat: any) => {
    router.push(
      `/service_provider/ChatRoom?chatId=${chat.chatId}&senderId=${provider?.uid}&receiverId=${chat.otherParticipantId}&receiverName=${chat.chatName}`
    );
  };

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.chatCard} onPress={() => openChat(item)}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatRow}>
          <Text style={styles.chatName}>{item.chatName}</Text>
          {item.lastMessage.createdAt && (
            <Text style={styles.chatTime}>
              {new Date(item.lastMessage.createdAt.seconds * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>
        <Text
          style={[styles.chatLastMessage, item.unread ? styles.unreadText : styles.readText]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage.text}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadBadge} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TextInput
          placeholder="Search by name..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10 }}>Loading chats...</Text>
        </View>
      ) : filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: "#999", fontSize: 16 }}>No chats available.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.chatId}
          renderItem={renderChatItem}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eee" }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#007bff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 16,
    color: "#111",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  chatCard: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 14 },
  chatContent: { flex: 1 },
  chatRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatName: { fontSize: 16, fontWeight: "600", color: "#111" },
  chatLastMessage: { fontSize: 14, marginTop: 4 },
  unreadText: { color: "#000", fontWeight: "700" },
  readText: { color: "#888" },
  chatTime: { fontSize: 12, color: "#999" },
  unreadBadge: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#007bff", marginLeft: 8 },
});
