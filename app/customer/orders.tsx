// app/customer/orders.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

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
    <View className="bg-white rounded-lg p-4 mb-3 shadow">
      <Text className="text-lg font-bold text-black">{item.jobTitle}</Text>
      <Text className="text-gray-700">{item.jobDescription}</Text>
      <Text className="text-sm text-gray-600 mt-1">📂 {item.category}</Text>
      <Text className="text-sm text-gray-600">👤 {item.providerName}</Text>
      <Text className="text-sm text-gray-600">💰 {item.price} BDT</Text>
      <Text
        className={`mt-2 font-semibold ${
          item.status === "pending"
            ? "text-yellow-600"
            : item.status === "accepted"
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        Status: {item.status}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="black" />
        <Text className="mt-3 text-gray-600">Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4 text-black">My Orders</Text>

      {orders.length === 0 ? (
        <Text className="text-gray-600 text-center mt-10">
          You have no orders yet.
        </Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </View>
  );
}
