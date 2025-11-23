import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
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

export default function CustomerDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  // Search states
  const [searchModal, setSearchModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // ---------------------
  // FETCH USER DATA
  // ---------------------
  const loadUser = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId"); 
      if (!userId) return;

      const userRef = doc(db, "Users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    } catch (error) {
      console.log("User load error:", error);
    }
  };

  // ---------------------
  // FETCH JOBS
  // ---------------------
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
    loadUser();
  }, []);

  // ---------------------
  // LIMIT WORDS
  // ---------------------
  const trimLocation = (text: string) => {
    const words = text.split(" ");
    return words.length > 4 ? words.slice(0, 4).join(" ") + "..." : text;
  };

  // ---------------------
  // SEARCH FUNCTION
  // ---------------------
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = [
      ...categories.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      ),
      ...jobs.filter((job) =>
        job.title.toLowerCase().includes(text.toLowerCase())
      ),
    ];

    setSearchResults(filtered);
    setSearchModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#fff" />

      {/* ------------------ HEADER ------------------ */}
      <View style={styles.header}>
        <View>
          <Text style={styles.username}>
            {userData?.name || "Loading..."}
          </Text>

          <Text style={styles.locationText}>
            {trimLocation(userData?.location || "No location found")}
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/customer/orders")}>
          <Ionicons name="cart" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* ------------------ SEARCH BAR ------------------ */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search services..."
          placeholderTextColor="#555"
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* ------------------ SEARCH POPUP ------------------ */}
      <Modal visible={searchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Search Results</Text>

            {searchResults.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#555" }}>
                No results found.
              </Text>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => {
                      if (item.title) {
                        router.push({
                          pathname: "/customer/job_details",
                          params: { id: item.id },
                        });
                      }
                      setSearchModal(false);
                    }}
                  >
                    <Text style={styles.resultText}>
                      {item.name || item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSearchModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ------------------ SCROLL SECTIONS ------------------ */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* CATEGORIES */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.categoryCard}>
              <Image source={item.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{item.name}</Text>
            </View>
          )}
        />

        {/* JOBS */}
        {/* ------------------ JOBS ------------------ */}
<View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16, marginTop: 10 }}>
  <Text style={styles.sectionTitle}>Available Jobs</Text>

  <TouchableOpacity onPress={() => router.push("/customer/all_jobs")}>
    <Text style={{ color: "#007BFF", fontWeight: "600", fontSize: 14 }}>See All</Text>
  </TouchableOpacity>
</View>

<FlatList
  data={jobs}
  horizontal
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() =>
        router.push({
          pathname: "/customer/ser_details",
          params: { id: item.id },
        })
      }
    >
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobLocation}>{item.location}</Text>
      <Text style={styles.jobBudget}>💰 {item.price} BDT</Text>
    </TouchableOpacity>
  )}
/>

      </ScrollView>

      <BottomNav activeTab="dashboard" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  username: { fontSize: 20, fontWeight: "700", color: "#000" },
  locationText: { color: "#777", maxWidth: 200 },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    margin: 16,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  searchInput: { marginLeft: 10, flex: 1, color: "#000" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
    marginBottom: 8,
  },
  categoryCard: {
    backgroundColor: "#eee",
    marginHorizontal: 10,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  categoryIcon: { width: 40, height: 40 },
  categoryText: { marginTop: 5 },
  jobCard: {
    backgroundColor: "#f8f8f8",
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 10,
    width: 230,
  },
  jobTitle: { fontSize: 16, fontWeight: "700" },
  jobLocation: { color: "#777", marginVertical: 5 },
  jobBudget: { color: "#000", fontWeight: "500" },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: { fontSize: 16 },
  closeButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
