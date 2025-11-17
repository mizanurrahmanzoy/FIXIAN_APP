// app/provider/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  doc,
  getDocs,getDoc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import BottomNav from "./BottomNav";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const router = useRouter();
  const user = auth.currentUser;

  const [providerData, setProviderData] = useState<{
  name?: string;
  phone?: string;
  serviceCategory?: string;
  experience?: string;
  location?: any;
  profileImage?: string;
}>({});
  useEffect(() => {
  if (!user) return;

  const fetchProviderData = async () => {
    try {
      const docRef = doc(db, "ServiceProviders", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProviderData({
          name: data.name,
          phone: data.phone,
          serviceCategory: data.serviceCategory,
          experience: data.experience,
          location: data.location,
          profileImage: data.profileImage,
        });
      }
    } catch (error) {
      console.error("Error fetching provider data:", error);
    }
  };

  fetchProviderData();
}, [user]);

  const [jobRequests, setJobRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "accepted" | "completed"
  >("pending");

 
  // ========================
  // LOAD JOB REQUESTS
  // ========================

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "Orders"),
          where("providerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const jobs: any[] = [];
        snapshot.forEach((docSnap) => {
          jobs.push({ id: docSnap.id, ...docSnap.data() });
        });
        setJobRequests(jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleAction = async (
    jobId: string,
    action: "accepted" | "rejected"
  ) => {
    try {
      await updateDoc(doc(db, "Orders", jobId), {
        status: action,
        updatedAt: serverTimestamp(),
      });
      setJobRequests((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status: action } : job))
      );
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const handleMarkDone = async (jobId: string) => {
    try {
      await updateDoc(doc(db, "Orders", jobId), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
      setJobRequests((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "completed" } : job
        )
      );
    } catch (error) {
      console.error("Error marking job done:", error);
    }
  };

  const filteredJobs = jobRequests.filter((job) => {
    if (activeTab === "pending") return job.status === "pending";
    if (activeTab === "accepted") return job.status === "accepted";
    if (activeTab === "completed") return job.status === "completed";
    return false;
  });

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{providerData.name || "Provider"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.role}>Service Provider </Text>
            <Ionicons name="star" size={16} color="#f4b400" />
            <Ionicons name="star" size={16} color="#f4b400" />
            <Ionicons name="star" size={16} color="#f4b400" />
            <Ionicons name="star" size={16} color="#f4b400" />
            <Ionicons name="star-half" size={16} color="#f4b400" />
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => alert("Notifications placeholder")}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#000"
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/service_provider/profile")}>
            <Image
              source={{
                uri: providerData.profileImage || "https://i.pravatar.cc/100?img=12",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {["pending", "accepted", "completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {filteredJobs.length === 0 ? (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>
            No jobs in this section
          </Text>
        ) : (
          filteredJobs.map((job) => (
            <View
              key={job.id}
              style={[
                styles.jobCard,
                job.status === "pending" && styles.pendingJob,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{job.jobTitle}</Text>
                <Text style={styles.jobDescription}>{job.jobDescription}</Text>
                <Text style={styles.jobInfo}>
                  Category: {job.category || "N/A"}
                </Text>
                <Text style={styles.jobInfo}>Price: ${job.price}</Text>
                <Text style={styles.jobInfo}>Location: {job.location}</Text>
                <Text style={[styles.statusLabel, getStatusStyle(job.status)]}>
                  {job.status.toUpperCase()}
                </Text>
              </View>

              {/* Actions */}
              {job.status === "pending" && (
                <View style={{ flexDirection: "row", marginTop: 5 }}>
                  <TouchableOpacity
                    style={[styles.jobButton, { backgroundColor: "#007bff" }]}
                    onPress={() => handleAction(job.id, "accepted")}
                  >
                    <Text style={styles.jobButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.jobButton,
                      { backgroundColor: "#ff4d4f", marginLeft: 5 },
                    ]}
                    onPress={() => handleAction(job.id, "rejected")}
                  >
                    <Text style={styles.jobButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {job.status === "accepted" && (
                <TouchableOpacity
                  style={[
                    styles.jobButton,
                    { backgroundColor: "#28a745", marginTop: 5 },
                  ]}
                  onPress={() => handleMarkDone(job.id)}
                >
                  <Text style={styles.jobButtonText}>Mark Done</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <BottomNav activeTab="Dashboard" />
    </View>
  );
}

// Status color mapping
const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return {
        backgroundColor: "#f0ad4e",
        color: "#fff",
        paddingHorizontal: 6,
        borderRadius: 4,
      };
    case "accepted":
      return {
        backgroundColor: "#007bff",
        color: "#fff",
        paddingHorizontal: 6,
        borderRadius: 4,
      };
    case "completed":
      return {
        backgroundColor: "#28a745",
        color: "#fff",
        paddingHorizontal: 6,
        borderRadius: 4,
      };
    case "rejected":
      return {
        backgroundColor: "#dc3545",
        color: "#fff",
        paddingHorizontal: 6,
        borderRadius: 4,
      };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 20, fontWeight: "700", color: "#000" },
  role: { fontSize: 14, color: "#555", marginRight: 5 },
  avatar: { width: 35, height: 35, borderRadius: 20 },

  tabs: { flexDirection: "row", marginTop: 20, marginBottom: 10 },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  activeTab: { borderBottomColor: "#007bff" },
  tabText: { fontSize: 16, color: "#555" },
  activeTabText: { color: "#007bff", fontWeight: "700" },

  jobCard: {
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
  },
  pendingJob: { borderColor: "#f0ad4e", borderWidth: 2 },
  jobTitle: { fontSize: 16, fontWeight: "600" },
  jobDescription: { color: "#777", fontSize: 14, marginTop: 2 },
  jobInfo: { color: "#555", fontSize: 13, marginTop: 2 },
  statusLabel: {
    marginTop: 5,
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "600",
  },
  jobButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  jobButtonText: { color: "#fff", fontWeight: "600" },
});
