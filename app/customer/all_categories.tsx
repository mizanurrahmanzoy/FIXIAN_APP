import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";

const categories = [
  { name: "Electrician", icon: require("../../assets/electrician.png") },
  { name: "Plumber", icon: require("../../assets/plumber.png") },
  { name: "Carpenter", icon: require("../../assets/carpenter.png") },
  { name: "AC Repair", icon: require("../../assets/ac.png") },
  { name: "Painter", icon: require("../../assets/painter.png") },
  { name: "Cleaner", icon: require("../../assets/cleaner.png") },
//   { name: "Beauty", icon: require("../../assets/beauty.png") },
//   { name: "Men's Salon", icon: require("../../assets/salon.png") },
];

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Categories</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.text}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
  },
  icon: { width: 40, height: 40, marginRight: 20 },
  text: { fontSize: 18, fontWeight: "500" },
});
