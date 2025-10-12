import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db, auth } from "../../firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { MotiView, AnimatePresence } from "moti";

export default function ServiceDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    id,
    title,
    description,
    category,
    providerName,
    providerId,
    price,
    location,
  } = params;

  const user = auth.currentUser;
  const [isExiting, setIsExiting] = useState(false);

  const handleBook = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to book a service.");
      return;
    }

    try {
      await addDoc(collection(db, "Orders"), {
        jobId: id,
        jobTitle: title,
        jobDescription: description,
        price: price,
        location: location,
        category: category,
        providerId: providerId,
        providerName: providerName || "Unknown Provider",
        customerId: user.uid,
        customerEmail: user.email,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Booking Successful", "Your booking request has been sent!");
    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Error", "Failed to book service. Please try again.");
    }
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => router.back(), 400); // delay for smooth animation
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 80 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.container}
        >
          <ScrollView>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.category}>📂 Category: {category}</Text>
            <Text style={styles.provider}>👤 Provider: {providerName}</Text>
            <Text style={styles.location}>📍 Location: {location}</Text>
            <Text style={styles.price}>💰 Price: {price} BDT</Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
                <Text style={styles.buttonText}>Book Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => Alert.alert("Coming Soon", "Chat feature under development")}
              >
                <Text style={styles.buttonText}>Message Provider</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#444",
    marginVertical: 12,
    lineHeight: 22,
  },
  category: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  provider: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: "#111",
    fontWeight: "600",
    marginBottom: 6,
  },
  location: {
    fontSize: 15,
    color: "#666",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "column",
    marginTop: 20,
    gap: 10,
  },
  bookButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 10,
  },
  chatButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
  },
  backButton: {
    backgroundColor: "#888",
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});
