// app/provider/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import {
    collection,
    doc,
    getDocs,
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

export default function Dashboard() {
  const user = auth.currentUser;
  const [jobRequests, setJobRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchJobRequests = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "Orders"),
          where("providerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const jobs: any[] = [];
        let pending = 0,
          active = 0,
          completed = 0;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          jobs.push({ id: docSnap.id, ...data });

          if (data.status === "pending") pending++;
          else if (data.status === "active") active++;
          else if (data.status === "completed") completed++;
        });

        setJobRequests(jobs);
        setStats({ pending, active, completed });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching job requests:", error);
        setLoading(false);
      }
    };

    fetchJobRequests();
  }, [user]);

  const handleAction = async (jobId: string, action: "active" | "rejected") => {
    try {
      await updateDoc(doc(db, "Orders", jobId), {
        status: action,
        updatedAt: serverTimestamp(),
      });
      setJobRequests((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: action } : job
        )
      );
      setStats((prev) => {
        let { pending, active, completed } = prev;
        if (action === "active") {
          pending--;
          active++;
        } else if (action === "rejected") {
          pending--;
        }
        return { pending, active, completed };
      });
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{user?.displayName || "Provider"}</Text>
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
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#000"
              style={{ marginRight: 15 }}
            />
            <Image
              source={{
                uri:
                  user?.photoURL ||
                  "https://i.pravatar.cc/100?img=12",
              }}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Job Requests */}
        <View style={styles.jobHeader}>
          <Text style={styles.sectionTitle}>Job Requests</Text>
        </View>

        {jobRequests.length === 0 && (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>
            No job requests yet
          </Text>
        )}

        {jobRequests.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobName}>{job.customerName}</Text>
              <Text style={styles.jobType}>{job.jobDescription}</Text>
              <Text style={styles.jobType}>
                Category: {job.category || "N/A"}
              </Text>
              <Text style={styles.jobType}>Price: ${job.price}</Text>
              <Text style={styles.jobType}>Status: {job.status}</Text>
            </View>
            {job.status === "pending" && (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={[styles.jobButton, { backgroundColor: "#007bff" }]}
                  onPress={() => handleAction(job.id, "active")}
                >
                  <Text style={styles.jobButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.jobButton, { backgroundColor: "#ff4d4f", marginLeft: 5 }]}
                  onPress={() => handleAction(job.id, "rejected")}
                >
                  <Text style={styles.jobButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav activeTab="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },
  name: { fontSize: 20, fontWeight: "700", color: "#000" },
  role: { fontSize: 14, color: "#555", marginRight: 5 },
  avatar: { width: 35, height: 35, borderRadius: 20 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 15,
    marginHorizontal: 5,
  },
  statNumber: { fontSize: 22, color: "#007bff", fontWeight: "700" },
  statLabel: { color: "#333", fontSize: 14, marginTop: 4 },

  sectionTitle: { fontSize: 17, fontWeight: "700", marginVertical: 10 },

  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  jobCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
  },
  jobName: { fontSize: 16, fontWeight: "600" },
  jobType: { color: "#777", fontSize: 13, marginTop: 2 },
  jobButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  jobButtonText: { color: "#fff", fontWeight: "600" },
});
