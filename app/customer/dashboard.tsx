// app/customer/CustomerDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import BottomNav from "./BottomNav";
import { StatusBar } from "expo-status-bar";

const categories = [
  { name: "Electrician", icon: require("../../assets/electrician.png") },
  { name: "Plumber", icon: require("../../assets/plumber.png") },
  { name: "Carpenter", icon: require("../../assets/carpenter.png") },
  { name: "AC Repair", icon: require("../../assets/ac.png") },
  { name: "Painter", icon: require("../../assets/painter.png") },
  { name: "Cleaner", icon: require("../../assets/cleaner.png") },
];

const bestServices = [
  {
    name: "Complete electric supply wiring",
    price: 180,
    reviews: 130,
    provider: "Mizanur Rahman",
    image: require("../../assets/service1.jpg"),
  },
  {
    name: "AC Installation & Repair",
    price: 120,
    reviews: 80,
    provider: "Nadia Akter",
    image: require("../../assets/service2.jpg"),
  },
];

export default function CustomerDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);

  // Fetch jobs from Firestore
  const fetchJobs = async () => {
    try {
      const q = query(collection(db, "Jobs"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleBook = (job: any) => {
    Alert.alert("Booking Confirmed", `You booked ${job.title}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Service Area: </Text>
            <Text style={styles.locationText}>Nabinagar, Savar, Dhaka</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="cart" size={28} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput placeholder="Search" style={styles.searchInput} />
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.categoryCard}>
              <Image source={item.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Best Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Services</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={bestServices}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.serviceCard}>
              <Image source={item.image} style={styles.serviceImage} />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.providerText}>by {item.provider}</Text>
                <Text style={styles.reviewsText}>
                  {"⭐".repeat(Math.round(item.reviews / 30))} ({item.reviews} Reviews)
                </Text>
                <View style={styles.serviceFooter}>
                  <Text style={styles.priceText}>৳{item.price}</Text>
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />

        {/* Available Jobs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Jobs</Text>
          <TouchableOpacity onPress={() => router.push("./all_jobs")}>
            <Text style={styles.linkText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.jobDescription}>{item.description}</Text>
              <Text style={styles.jobDetail}>💰 {item.price} BDT</Text>
              <Text style={styles.jobDetail}>📍 {item.location}</Text>
              <Text style={styles.jobDetail}>📂 {item.category}</Text>
              <Text style={styles.jobDetail}>👤 {item.name}</Text>

              <TouchableOpacity
                onPress={() => handleBook(item)}
                style={styles.bookButton}
              >
                <Text style={styles.bookText}>Book</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="dashboard" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  locationContainer: { flexDirection: "row", alignItems: "center" },
  locationLabel: { color: "#555", fontWeight: "600" },
  locationText: { color: "#000", fontWeight: "700" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 8, color: "#000" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
  linkText: { color: "#007bff", fontWeight: "600" },
  horizontalList: { paddingBottom: 10 },
  categoryCard: {
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: 90,
  },
  categoryIcon: { width: 40, height: 40, marginBottom: 6 },
  categoryText: { textAlign: "center", color: "#333", fontSize: 12 },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 12,
    width: 260,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  serviceImage: { width: "100%", height: 120, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  serviceInfo: { padding: 10 },
  serviceName: { fontWeight: "700", color: "#000", marginBottom: 4 },
  providerText: { color: "#666", fontSize: 13 },
  reviewsText: { color: "#f5a623", fontSize: 13, marginTop: 4 },
  serviceFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  priceText: { fontWeight: "700", color: "#000" },
  addButton: { backgroundColor: "#007bff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  addText: { color: "#fff", fontWeight: "600" },
  jobCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: 260,
  },
  jobTitle: { fontWeight: "700", fontSize: 16, color: "#000" },
  jobDescription: { color: "#555", marginVertical: 4 },
  jobDetail: { fontSize: 13, color: "#333" },
  bookButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
  },
  bookText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
