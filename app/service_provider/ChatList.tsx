import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useRouter } from "expo-router";

export default function ChatList() {
  const [chats, setChats] = useState<any[]>([]);
  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const chatsRef = collection(db, "Chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatData);
    });

    return unsubscribe;
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
              router.push({
                pathname: "/ChatRoom",
                params: { chatId: item.id },
              })
            }
          >
            <Text style={styles.chatTitle}>
              Chat with {item.participants.find((p: string) => p !== user?.uid)}
            </Text>
            <Text style={styles.lastMessage}>{item.lastMessage || "No messages yet"}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  chatItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  chatTitle: { fontSize: 16, fontWeight: "500" },
  lastMessage: { color: "#666", marginTop: 2 },
});
