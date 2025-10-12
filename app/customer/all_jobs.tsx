// app/customer/all_jobs.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export default function AllJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const router = useRouter();

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const q = query(collection(db, "Jobs"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      Alert.alert("Error", "Failed to fetch services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle search
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === "") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter((job) =>
        [job.title, job.category, job.location]
          .join(" ")
          .toLowerCase()
          .includes(text.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  };

  // Handle booking
  const handleBook = async (job: any) => {
    if (!user) {
      Alert.alert("Login Required", "You must be logged in to book a service.");
      return;
    }

    try {
      await addDoc(collection(db, "Orders"), {
        jobId: job.id,
        jobTitle: job.title,
        jobDescription: job.description,
        price: job.price,
        location: job.location,
        category: job.category,
        providerId: job.providerId,
        providerName: job.name || "Unknown Provider",
        customerId: user.uid,
        customerEmail: user.email,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Booking Request Sent", "Your booking request was sent.");
    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Error", "Failed to send booking request.");
    }
  };

  // Handle Message
  const handleMessage = async (job: any) => {
    if (!user) {
      Alert.alert("Login Required", "You must be logged in to chat.");
      return;
    }

    try {
      const chatsRef = collection(db, "Chats");

      // Check if a chat already exists between customer and provider
      const q = query(chatsRef, where("participants", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);

      let chatId: string | null = null;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const participants: string[] = data.participants || [];
        if (
          participants.includes(user.uid) &&
          participants.includes(job.providerId)
        ) {
          chatId = docSnap.id;
        }
      });

      // If chat doesn't exist, create a new chat
      if (!chatId) {
        const chatDoc = await addDoc(chatsRef, {
          participants: [user.uid, job.providerId],
          providerName: job.name || "Unknown Provider",
          customerName: user.displayName || "Customer",
          createdAt: serverTimestamp(),
        });
        chatId = chatDoc.id;
      }

      // Navigate to ChatRoom with chatId
      router.push(`/customer/ChatRoom?chatId=${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start chat.");
    }
  };

  // Render Job Card
  const renderJob = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobDesc}>{item.description}</Text>
      <Text style={styles.jobMeta}>💰 {item.price} BDT</Text>
      <Text style={styles.jobMeta}>📍 {item.location}</Text>
      <Text style={styles.jobMeta}>📂 {item.category}</Text>
      <Text style={styles.jobMeta}>👤 {item.name || "Unknown Provider"}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(item)}>
          <Text style={styles.bookText}>Direct Book</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => router.push(`/customer/service_details?id=${item.id}`)}
        >
          <Text style={styles.detailsText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.msgBtn} onPress={() => handleMessage(item)}>
          <Text style={styles.msgText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>All Services</Text>
        <TouchableOpacity
          onPress={() => Alert.alert("Filter", "Filter options coming soon!")}
        >
          <Ionicons name="filter-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by title, category, or location..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Jobs List */}
      {loading ? (
        <ActivityIndicator size="large" color="#111" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 10 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#EEE", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 16, color: "#000" },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 14, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  jobTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 4 },
  jobDesc: { fontSize: 14, color: "#555", marginBottom: 6 },
  jobMeta: { fontSize: 13, color: "#666" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  bookBtn: { backgroundColor: "#111", flex: 1, paddingVertical: 10, borderRadius: 8, marginRight: 6 },
  bookText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  detailsBtn: { backgroundColor: "#E5E7EB", flex: 1, paddingVertical: 10, borderRadius: 8, marginRight: 6 },
  detailsText: { textAlign: "center", color: "#111", fontWeight: "600" },
  msgBtn: { backgroundColor: "#2563EB", flex: 1, paddingVertical: 10, borderRadius: 8 },
  msgText: { textAlign: "center", color: "#fff", fontWeight: "600" },
});
