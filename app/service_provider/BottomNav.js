import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BottomNav({ activeTab = "Dashboard" }) {
  const router = useRouter();

  const tabs = [
    { name: "Dashboard", icon: "home", route: "./dashboard" },
    { name: "Jobs", icon: "briefcase-outline", route: "./jobs" },
    { name: "Message", icon: "chatbubble-outline", route: "./chats" },
    { name: "Profile", icon: "person-outline", route: "./profile" },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => router.push(tab.route)}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? "#007bff" : "#000"}
            />
            <Text
              style={[
                styles.navText,
                { color: isActive ? "#007bff" : "#000" },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 40, // You can change to 0 if you want it flush to bottom
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 10,
    backgroundColor: "#fff",
    height: 60,
    zIndex: 10,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#000",
    marginTop: 4,
  },
});
