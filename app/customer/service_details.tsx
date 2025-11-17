// app/customer/ServiceDetails.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db, auth } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  orderBy,
} from "firebase/firestore";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  providerName: string;
  providerId: string;
  price: string;
  location: string;
}

export default function ServiceDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarServices, setSimilarServices] = useState<Service[]>([]);

  const user = auth.currentUser;

  // Fetch main service details
  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        const docRef = doc(db, "Jobs", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setService({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            category: data.category,
            providerName: data.name || "Unknown",
            providerId: data.providerId,
            price: data.price,
            location: data.location,
          });
        } else {
          Alert.alert("Not Found", "Service does not exist.");
        }
      } catch (err) {
        console.log("Error fetching service:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Fetch similar services
  useEffect(() => {
    if (!service) return;

    const fetchSimilar = async () => {
      try {
        const q = query(
          collection(db, "Jobs"),
          where("category", "==", service.category),
          where("active", "==", true),
          orderBy("createdAt", "desc")
        );
        const querySnap = await getDocs(q);
        const results: Service[] = querySnap.docs
          .filter((doc) => doc.id !== service.id) // exclude current
          .map((doc) => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            category: doc.data().category,
            providerName: doc.data().name,
            providerId: doc.data().providerId,
            price: doc.data().price,
            location: doc.data().location,
          }));

        setSimilarServices(results);
      } catch (err) {
        console.log("Error fetching similar services:", err);
      }
    };

    fetchSimilar();
  }, [service]);

  const handleBook = async () => {
    if (!user || !service) {
      Alert.alert("Login Required", "Please login to book a service.");
      return;
    }

    try {
      await addDoc(collection(db, "Orders"), {
        jobId: service.id,
        jobTitle: service.title,
        jobDescription: service.description,
        price: service.price,
        location: service.location,
        category: service.category,
        providerId: service.providerId,
        providerName: service.providerName,
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

  if (loading || !service) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading service details...</Text>
      </View>
    );
  }

  const renderSimilarItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.similarCard}
      onPress={() => router.push(`/customer/ServiceDetails?id=${item.id}`)}
    >
      <Text style={styles.similarTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.similarPrice}>{item.price} BDT</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Service Info */}
      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.category}>📂 {service.category}</Text>
      <Text style={styles.provider}>👤 {service.providerName}</Text>
      <Text style={styles.location}>📍 {service.location}</Text>
      <Text style={styles.price}>💰 {service.price} BDT</Text>
      <Text style={styles.description}>{service.description}</Text>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Messaging feature under development"
            )
          }
        >
          <Text style={styles.buttonText}>Message Provider</Text>
        </TouchableOpacity>
      </View>

      {/* Similar Services */}
      {similarServices.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>Similar Services</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={similarServices}
            keyExtractor={(item) => item.id}
            renderItem={renderSimilarItem}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#111", marginBottom: 8 },
  category: { fontSize: 16, color: "#666", marginBottom: 4 },
  provider: { fontSize: 16, color: "#666", marginBottom: 4 },
  location: { fontSize: 15, color: "#888", marginBottom: 6 },
  price: { fontSize: 18, fontWeight: "600", color: "#000", marginBottom: 12 },
  description: { fontSize: 16, color: "#444", lineHeight: 22, marginBottom: 20 },
  buttonContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  bookButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
  },
  chatButton: {
    flex: 1,
    backgroundColor: "#00BFA6",
    padding: 12,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 12 },
  similarCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    width: 180,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  similarTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  similarPrice: { fontSize: 14, fontWeight: "500", color: "#007BFF", marginTop: 6 },
});
