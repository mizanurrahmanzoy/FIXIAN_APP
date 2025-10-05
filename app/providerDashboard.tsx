import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const incomingJobs = [
  { id: "1", customer: "Rahul Sharma", service: "TV Repair", status: "Pending", price: 300 },
  { id: "2", customer: "Anita Singh", service: "AC Service", status: "Pending", price: 500 },
];

export default function ProviderDashboard() {
  const [jobs, setJobs] = useState(incomingJobs);

  const handleAccept = (id: string) => {
    setJobs(prev =>
      prev.map(job => (job.id === id ? { ...job, status: "Accepted" } : job))
    );
  };

  const handleReject = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  return (
    <View className="flex-1 bg-white px-4 pt-8">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold">Provider Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-blue-100 px-4 py-3 rounded-lg w-[30%] items-center">
          <Text className="text-lg font-bold">3</Text>
          <Text className="text-gray-600">Pending</Text>
        </View>
        <View className="bg-green-100 px-4 py-3 rounded-lg w-[30%] items-center">
          <Text className="text-lg font-bold">10</Text>
          <Text className="text-gray-600">Completed</Text>
        </View>
        <View className="bg-yellow-100 px-4 py-3 rounded-lg w-[30%] items-center">
          <Text className="text-lg font-bold">₹ 2500</Text>
          <Text className="text-gray-600">Earnings</Text>
        </View>
      </View>

      {/* Manage Services */}
      <TouchableOpacity className="bg-blue-500 py-3 rounded-lg mb-6">
        <Text className="text-white text-center font-semibold">Manage My Services</Text>
      </TouchableOpacity>

      {/* Incoming Jobs */}
      <Text className="text-lg font-semibold mb-2">Incoming Jobs</Text>
      <FlatList
        data={jobs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="font-bold text-lg">{item.service}</Text>
            <Text className="text-gray-600">Customer: {item.customer}</Text>
            <Text className="text-gray-800">Price: ₹{item.price}</Text>
            <Text className="text-yellow-600">Status: {item.status}</Text>

            {item.status === "Pending" && (
              <View className="flex-row mt-2">
                <TouchableOpacity
                  onPress={() => handleAccept(item.id)}
                  className="bg-green-500 px-3 py-1 rounded mr-2"
                >
                  <Text className="text-white">Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReject(item.id)}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  <Text className="text-white">Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Bottom Navigation */}
      <View className="flex-row justify-around py-4 border-t border-gray-200">
        <TouchableOpacity>
          <Ionicons name="home" size={24} color="black" />
          <Text>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="briefcase" size={24} color="black" />
          <Text>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person" size={24} color="black" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
