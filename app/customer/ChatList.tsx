import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useRouter } from "expo-router";

type Chat = {
  id: string;
  lastMessage: string;
  // add other properties as needed
};

export default function ChatList({ userId }: { userId: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "chats"), where("participants", "array-contains", userId));
    const unsubscribe = onSnapshot(q, (snapshot) =>
      setChats(
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            lastMessage: data.lastMessage || "",
            ...data,
          };
        })
      )
    );
    return unsubscribe;
  }, []);

  return (
    <View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/customer/ChatRoom?id=${item.id}`)}>
            <Text style={{ padding: 15 }}>{item.lastMessage}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
