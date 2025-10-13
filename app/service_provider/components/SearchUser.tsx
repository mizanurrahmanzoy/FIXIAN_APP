import { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

type User = {
  id: string;
  username: string;
  // add other user fields if needed
};

export default function SearchUser({ onSelect }: { onSelect: (user: User) => void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);

  const handleSearch = async () => {
    const q = query(collection(db, "users"), where("username", ">=", search), where("username", "<=", search + "\uf8ff"));
    const snapshot = await getDocs(q);
    setResults(snapshot.docs.map(doc => {
      const { id, ...data } = doc.data() as User;
      return { id: doc.id, ...data };
    }));
  };

  return (
    <View>
      <TextInput
        placeholder="Search by username..."
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={handleSearch}
        style={{ borderWidth: 1, padding: 10, margin: 10 }}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)}>
            <Text style={{ padding: 10 }}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
