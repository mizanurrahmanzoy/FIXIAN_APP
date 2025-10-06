// app/customer/all_jobs.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, ScrollView } from "react-native";
import { db, auth } from "../../firebaseConfig";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

export default function AllJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const user = auth.currentUser;

  // Fetch all jobs
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

  // Handle booking
  const handleBook = async (job: any) => {
    if (!user) {
      Alert.alert("Login Required", "You must be logged in to book a job.");
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
        providerId: job.providerId, // service provider id (job owner)
        providerName: job.name || "Unknown Provider",
        customerId: user.uid,
        customerEmail: user.email,
        status: "pending", // provider will accept/reject later
        createdAt: serverTimestamp(),
      });

      Alert.alert("Booking Request Sent", "Your request has been sent to the provider.");
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert("Error", "Failed to send booking request.");
    }
  };

  // Job Card
  const renderJob = ({ item }: { item: any }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow">
      <Text className="text-lg font-bold text-black">{item.title}</Text>
      <Text className="text-gray-700">{item.description}</Text>
      <Text className="text-sm text-gray-600 mt-1">💰 {item.price} BDT</Text>
      <Text className="text-sm text-gray-600">📍 {item.location}</Text>
      <Text className="text-sm text-gray-600">📂 {item.category}</Text>
      <Text className="text-sm text-gray-600">👤 {item.name}</Text>

      <TouchableOpacity
        onPress={() => handleBook(item)}
        className="bg-black px-4 py-2 rounded-lg mt-3"
      >
        <Text className="text-white text-center font-semibold">Book</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4 text-black">All Jobs</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </ScrollView>
  );
}
