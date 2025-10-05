import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

const servicesCategories = [
  { id: "1", name: "TV Repair", icon: "tv" },
  { id: "2", name: "AC Service", icon: "snow" },
  { id: "3", name: "Plumbing", icon: "water" },
  { id: "4", name: "Electric", icon: "flash" },
];

const servicesList = [
  { id: "1", name: "TV Repair", details: "LED / LCD / Smart TV", price: 300, rating: 4.6 },
  { id: "2", name: "AC Service", details: "Split / Window AC", price: 500, rating: 4.7 },
  // Add more services here
];

export default function CustomerDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredServices = servicesList.filter(service =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white px-4 pt-8">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Home Service</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-lg mb-6">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search service (TV, AC, Plumbing...)"
          value={search}
          onChangeText={setSearch}
          className="ml-2 flex-1"
        />
      </View>

      {/* Service Categories */}
      <FlatList
        horizontal
        data={servicesCategories}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-gray-100 px-4 py-3 rounded-lg mr-4 items-center">
            <Ionicons name={item.icon as any} size={24} color="black" />
            <Text className="mt-1">{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Emergency */}
      <TouchableOpacity className="bg-red-500 px-4 py-3 rounded-lg mb-6">
        <Text className="text-white font-semibold text-center">Emergency? Book an expert now</Text>
      </TouchableOpacity>

      {/* Services List */}
      <Text className="text-lg font-semibold mb-2">Services</Text>
      <FlatList
        data={filteredServices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="font-bold text-lg">{item.name}</Text>
            <Text className="text-gray-600">{item.details}</Text>
            <Text className="text-gray-800 mt-1">From ₹{item.price}</Text>
            <Text className="text-yellow-600">⭐ {item.rating}</Text>
            <TouchableOpacity className="bg-blue-500 px-3 py-1 rounded mt-2">
              <Text className="text-white">View Details</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Bottom Navigation */}
      <View className="flex-row justify-around py-4 border-t border-gray-200">
        <TouchableOpacity>
          <Ionicons name="home" size={24} color="black" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="list" size={24} color="black" />
          <Text>Services</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="calendar" size={24} color="black" />
          <Text>Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
