// app/customer/Chats.tsx
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

export default function Chats() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          const chatId = docSnap.id;
          const messagesRef = collection(db, "chats", chatId, "messages");
          const lastMsgQuery = query(messagesRef, orderBy("createdAt", "desc"));
          const messagesSnapshot = await getDocs(lastMsgQuery);

          const lastMsgDoc = messagesSnapshot.docs[0];
          const lastMessage = lastMsgDoc
            ? { ...lastMsgDoc.data(), id: lastMsgDoc.id }
            : { text: "No messages yet", createdAt: null };

          // Identify other participant
          const otherUserId = data.participants.find((id: string) => id !== user.uid);

          // Fetch provider info
          const providerRef = doc(db, "ServiceProviders", otherUserId);
          const providerSnap = await getDoc(providerRef);
          const providerData = providerSnap.exists() ? providerSnap.data() : null;

          const unreadCount =
            data.unreadCounts && data.unreadCounts[user.uid]
              ? data.unreadCounts[user.uid]
              : 0;

          return {
            chatId,
            lastMessage,
            participants: data.participants,
            unreadCount,
            providerName: providerData?.name || "Unknown",
            providerImage:
              providerData?.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          };
        })
      );

      const sorted = chatsData.sort((a, b) => {
        const timeA = a.lastMessage.createdAt?.seconds || 0;
        const timeB = b.lastMessage.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setChats(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Open Chat
  const openChat = (chat: any) => {
    if (!user) return;
    
    const otherUserId = chat.participants.find((id: string) => id !== user.uid);

    router.push(
      `/customer/ChatRoom?chatId=${chat.chatId}&senderId=${user.uid}&receiverId=${otherUserId}&receiverName=${chat.providerName}`
    );
  };

  // Filter (Search)
  const filteredChats = chats.filter((chat) =>
    chat.providerName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Chat Row Component
  const renderChatItem = ({ item }: { item: any }) => {
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity style={styles.chatCard} onPress={() => openChat(item)}>
        <Image source={{ uri: item.providerImage }} style={styles.avatar} />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, isUnread && styles.boldText]}>
              {item.providerName}
            </Text>

            <Text style={styles.chatTime}>
              {item.lastMessage.createdAt
                ? new Date(
                    item.lastMessage.createdAt.seconds * 1000
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>
          </View>

          <View style={styles.chatFooter}>
            <Text
              style={[
                styles.chatLastMessage,
                isUnread && styles.boldText,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.text}
            </Text>

            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading Screen
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading chats...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.chatId}
        renderItem={renderChatItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA", // Light Theme
  },

  // Header
  header: {
    padding: 16,
    backgroundColor: "#EEE",
    borderBottomWidth: 1,
    borderColor: "#DDD",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },

  // Search
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },

  // Chat Row
  chatCard: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
  },

  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  chatName: {
    fontSize: 16,
    color: "#222",
  },

  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chatLastMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    flex: 1,
  },

  chatTime: {
    fontSize: 12,
    color: "#777",
  },

  boldText: {
    fontWeight: "700",
    color: "#000",
  },

  unreadBadge: {
    backgroundColor: "#25D366",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    marginLeft: 8,
  },

  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
