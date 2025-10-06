import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const menuItems = [
  { title: "Edit Profile", icon: "person-outline" },
  { title: "Change Password", icon: "key-outline" },
  { title: "My Bookings", icon: "calendar-outline" },
  { title: "My Address", icon: "location-outline" },
  { title: "Privacy Policy", icon: "lock-closed-outline" },
  { title: "Terms & Condition", icon: "document-text-outline" },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Mahmud Rana</Text>
      </View>

      {menuItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.menuItem}>
          <Ionicons name={item.icon} size={20} color="#333" />
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.menuItem, { marginTop: 10 }]}>
        <Ionicons name="log-out-outline" size={20} color="red" />
        <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  profileSection: { alignItems: "center", marginVertical: 30 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "600" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
  },
  menuText: { fontSize: 16, marginLeft: 15, fontWeight: "500" },
});
