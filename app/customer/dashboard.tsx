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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./BottomNav";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Route } from "expo-router/build/Route";
import { useRouter } from "expo-router";
const router = useRouter();


// Static categories
const categories = [
  { name: "Electrician", icon: require("../../assets/electrician.png") },
  { name: "Plumber", icon: require("../../assets/plumber.png") },
  { name: "Carpenter", icon: require("../../assets/carpenter.png") },
  { name: "AC Repair", icon: require("../../assets/ac.png") },
  { name: "Painter", icon: require("../../assets/painter.png") },
  { name: "Cleaner", icon: require("../../assets/cleaner.png") },
];

// Static best services
const bestServices = [
  {
    name: "Complete electric supply wiring",
    price: 180,
    oldPrice: 150,
    reviews: 130,
    provider: "Mizanur Rahman",
    image: require("../../assets/service1.jpg"),
  },
  {
    name: "AC Installation & Repair",
    price: 120,
    oldPrice: 100,
    reviews: 80,
    provider: "Nadia Akter",
    image: require("../../assets/service2.jpg"),
  },
];

export default function CustomerDashboard() {
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

  // Handle Booking
  const handleBook = (job: any) => {
    Alert.alert("Booking Confirmed", `You booked ${job.title}`);
    // Later: Save booking info in Firestore under "Bookings"
  };

  return (
    <>
      <ScrollView className="flex-1 bg-white p-4  bottom-10 overflow-scroll">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-gray-700 font-semibold">Service Area: </Text>
            <Text className="text-black font-bold">Nabinagar, Savar, Dhaka</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="cart" size={28} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-6">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput placeholder="Search" className="ml-2 flex-1 text-black" />
        </View>

        {/* Categories */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold">All Categories</Text>
          <TouchableOpacity>
            <Text className="text-blue-500 font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity className="items-center mr-4 bg-gray-100 rounded-lg p-4 w-24">
              <Image source={item.icon} className="w-12 h-12 mb-2" />
              <Text className="text-center text-sm">{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Best Services */}
        <View className="flex-row justify-between items-center mt-6 mb-2">
          <Text className="text-lg font-semibold">Best Services</Text>
          <TouchableOpacity>
            <Text className="text-blue-500 font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={bestServices}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-white shadow rounded-lg mr-4 w-64">
              <Image source={item.image} className="w-full h-32 rounded-t-lg" />
              <View className="p-3">
                <Text className="font-semibold text-black mb-1">{item.name}</Text>
                <Text className="text-gray-500 text-sm">by {item.provider}</Text>
                <Text className="text-yellow-500 mt-1">
                  {"⭐".repeat(Math.round(item.reviews / 30))} ({item.reviews} Reviews)
                </Text>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-black font-bold">${item.price}</Text>
                  <TouchableOpacity className="bg-blue-500 px-3 py-1 rounded-full">
                    <Text className="text-white">Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />

        {/* Available Jobs */}
        <View className="flex-row justify-between items-center mt-6 mb-2">
          <Text className="text-lg font-semibold">Available Jobs</Text>
          <TouchableOpacity onPress={() => router.push("./all_jobs")}>
            <Text className="text-blue-500 font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-gray-100 rounded-lg p-4 mr-4 w-64">
              <Text className="text-lg font-bold text-black">{item.title}</Text>
              <Text className="text-gray-600">{item.description}</Text>
              <Text className="text-sm text-gray-800 mt-1">💰 {item.price} BDT</Text>
              <Text className="text-sm text-gray-800">📍 {item.location}</Text>
              <Text className="text-sm text-gray-700">📂 {item.category}</Text>
              <Text className="text-sm text-gray-700">👤 {item.name}</Text>

              <TouchableOpacity
                onPress={() => handleBook(item)}
                className="bg-green-600 px-4 py-2 rounded-lg mt-3"
              >
                <Text className="text-white text-center font-semibold">Book</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="dashboard" />
    </>
  );
}
