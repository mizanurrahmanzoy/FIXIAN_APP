// app/customer/orders.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { StatusBar } from "expo-status-bar";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "Orders"),
        where("customerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <Text style={styles.jobTitle}>{item.jobTitle}</Text>
      <Text style={styles.jobDescription}>{item.jobDescription}</Text>

      <Text style={styles.jobDetail}>📂 Category: {item.category}</Text>
      <Text style={styles.jobDetail}>👤 Provider: {item.providerName}</Text>
      <Text style={styles.jobDetail}>💰 Price: {item.price} BDT</Text>

      <Text
        style={[
          styles.status,
          item.status === "pending"
            ? styles.statusPending
            : item.status === "accepted"
            ? styles.statusAccepted
            : styles.statusRejected,
        ]}
      >
        Status: {item.status}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>My Orders</Text>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require("../../assets/empty-orders.png")}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>You have no orders yet.</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  jobDetail: {
    fontSize: 13,
    color: "#333",
    marginVertical: 2,
  },
  status: {
    marginTop: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusPending: {
    color: "#e6a700",
  },
  statusAccepted: {
    color: "#28a745",
  },
  statusRejected: {
    color: "#dc3545",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
    fontSize: 15,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyImage: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    marginTop: 12,
  },
});
