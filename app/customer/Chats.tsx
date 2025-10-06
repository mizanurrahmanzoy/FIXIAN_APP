import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "other", text: "Hi, my living room lights keep flickering. Can you check what's wrong?" },
    { id: 2, sender: "me", text: "Sure, let me take a look. How long has this been happening?" },
    { id: 3, sender: "other", text: "For about a week. Sometimes the lights go dim and then brighten again." },
    { id: 4, sender: "me", text: "Sounds like it could be a loose connection or an issue with the switch. I'll test the wiring first." },
    { id: 5, sender: "other", text: "ok" },
  ]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={{ uri: "https://i.pravatar.cc/100" }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>Mizanur Rahaman</Text>
            <Text style={styles.active}>Active 11m ago</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Ionicons name="call-outline" size={22} color="#000" style={{ marginRight: 15 }} />
          <Ionicons name="videocam-outline" size={22} color="#000" />
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.message,
              msg.sender === "me" ? styles.me : styles.other,
            ]}
          >
            <Text style={{ color: msg.sender === "me" ? "#fff" : "#000" }}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        <TextInput placeholder="Message..." style={styles.input} />
        <TouchableOpacity style={styles.sendBtn}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: { fontSize: 16, fontWeight: "600" },
  active: { fontSize: 12, color: "gray" },
  chatArea: { padding: 10 },
  message: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  me: {
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  other: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  inputArea: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendBtn: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
});
