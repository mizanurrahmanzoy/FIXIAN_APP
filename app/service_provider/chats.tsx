// app/service_provider/Chats.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProviderChats() {
  const [chats, setChats] = useState<any[]>([]);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const provider = auth.currentUser;

  // -----------------------------
  // Load Cached Chats (Fast)
  // -----------------------------
  const loadCachedChats = useCallback(async () => {
    if (!provider) return;

    try {
      const stored = await AsyncStorage.getItem(
        `providerChats_${provider.uid}`
      );
      if (stored) {
        const data = JSON.parse(stored);
        setChats(data);
        setFilteredChats(data);
      }
      setLoading(false);
    } catch (error) {
      console.log("Error loading cached chats:", error);
    }
  }, [provider]);

  // -----------------------------
  // Live Firestore Listener
  // -----------------------------
  useEffect(() => {
    if (!provider) return;

    loadCachedChats(); // show cached instantly

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", provider.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const chatsData = await Promise.all(
          snapshot.docs.map(async (chatDoc) => {
            const data = chatDoc.data();

            const messagesRef = collection(
              db,
              "chats",
              chatDoc.id,
              "messages"
            );
            const msgSnapshot = await getDocs(
              query(messagesRef, orderBy("createdAt", "desc"))
            );

            const lastMsg = msgSnapshot.docs[0]
              ? {
                  id: msgSnapshot.docs[0].id,
                  ...(msgSnapshot.docs[0].data() as any),
                }
              : {
                  text: "No messages yet",
                  createdAt: null,
                  user: { _id: "" },
                  readBy: [],
                };

            const otherId = data.participants.find(
              (id: string) => id !== provider.uid
            );

            const unread =
              lastMsg.user?._id &&
              lastMsg.user._id !== provider.uid &&
              !lastMsg.readBy?.includes(provider.uid);

            return {
              chatId: chatDoc.id,
              chatName: data.customerName || "Unknown User",
              avatarUrl: data.customerAvatar || "",
              lastMessage: lastMsg,
              unread,
              otherParticipantId: otherId,
            };
          })
        );

        // Sort by latest message
        const sorted = chatsData.sort((a, b) => {
          const tA = a.lastMessage.createdAt?.toMillis?.() ?? 0;
          const tB = b.lastMessage.createdAt?.toMillis?.() ?? 0;
          return tB - tA;
        });

        setChats(sorted);
        setFilteredChats(sorted);

        await AsyncStorage.setItem(
          `providerChats_${provider.uid}`,
          JSON.stringify(sorted)
        );

        setLoading(false);
        setRefreshing(false);
      } catch (error) {
        console.log("Error in listener:", error);
      }
    });

    return () => unsubscribe();
  }, [provider, loadCachedChats]);

  // -----------------------------
  // Search Handler
  // -----------------------------
  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text) return setFilteredChats(chats);

    const results = chats.filter((chat) =>
      chat.chatName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredChats(results);
  };

  // -----------------------------
  // Open Chat
  // -----------------------------
  const openChat = (item: any) => {
    router.push(
      `/service_provider/ChatRoom?chatId=${item.chatId}&senderId=${provider?.uid}&receiverId=${item.otherParticipantId}&receiverName=${item.chatName}`
    );
  };

  // -----------------------------
  // Render Chat Card
  // -----------------------------
  const renderChatItem = ({ item }: { item: any }) => {
    const lastTime = item.lastMessage.createdAt
      ? new Date(item.lastMessage.createdAt.seconds * 1000)
      : null;

    return (
      <TouchableOpacity style={styles.chatCard} onPress={() => openChat(item)}>
        <Image
          source={{
            uri:
              item.avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />

        <View style={styles.chatContent}>
          <View style={styles.chatRow}>
            <Text style={styles.chatName}>{item.chatName}</Text>

            {lastTime && (
              <Text style={styles.chatTime}>
                {lastTime.toLocaleDateString()}{" "}
                {lastTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.chatLastMessage,
              item.unread ? styles.unreadText : styles.readText,
            ]}
          >
            {item.lastMessage.text}
          </Text>
        </View>

        {item.unread && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    );
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>

        <TextInput
          placeholder="Search by name..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading chats...</Text>
        </View>
      ) : filteredChats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: "#999" }}>No chats found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.chatId}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadCachedChats();
              }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    padding: 16,
    backgroundColor: "#007bff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 10,
  },

  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },

  chatCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 10,
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 14 },

  chatContent: { flex: 1 },
  chatRow: { flexDirection: "row", justifyContent: "space-between" },

  chatName: { fontSize: 16, fontWeight: "600" },
  chatLastMessage: { fontSize: 14, marginTop: 4 },

  unreadText: { color: "#000", fontWeight: "700" },
  readText: { color: "#666" },

  chatTime: { fontSize: 12, color: "#999" },

  unreadBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007bff",
  },
});
