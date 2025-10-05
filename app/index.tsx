import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-black">
      {/* Welcome Screen */}
      <View className="flex-1 items-center justify-center h-screen bg-black px-6">
        <Text className="text-white text-4xl font-bold mb-2">Fixian</Text>
        <Text className="text-gray-300 text-center mb-8">
          An Intelligent Service Booking{"\n"}and Management System
        </Text>
        <TouchableOpacity
          className="bg-white px-6 py-3 rounded-full flex-row items-center"
          onPress={() => router.push("/login")}
        >
          <Text className="text-black font-semibold">Get Started</Text>
          
          <Ionicons name="arrow-forward" size={20} color="black" className="ml-2" />
        </TouchableOpacity>
      </View>

      {/* Mission & Vision Screen */}
      <View className="flex-1 bg-black px-6 py-10">
        <Text className="text-white text-2xl font-bold mb-6">
          Connecting You to{"\n"}Trusted Experts
        </Text>

        <View className="mb-6">
          <Image
            source={{ uri: "https://via.placeholder.com/300x200.png" }} // replace with real image
            className="w-full h-40 rounded-lg"
            resizeMode="cover"
          />
          <Text className="absolute top-2 left-2 bg-white px-3 py-1 rounded-full text-xs font-semibold">
            Expert Service
          </Text>
        </View>

        <Text className="text-gray-300 mb-8 leading-6">
          At <Text className="text-white font-bold">Fixian</Text>, we believe everyone deserves
          reliable, professional service. Our intelligent platform connects you
          with verified technicians who can handle everything from AC repairs to
          computer fixes and automotive services.
        </Text>

        {/* Features List */}
        <View className="mb-4 flex-row items-start">
          <Ionicons name="checkmark-circle" size={20} color="white" className="mr-2" />
          <Text className="text-gray-200">
            <Text className="text-white font-semibold">Expert Technicians{"\n"}</Text>
            Verified professionals with proven track records
          </Text>
        </View>

        <View className="mb-4 flex-row items-start">
          <Ionicons name="time" size={20} color="white" className="mr-2" />
          <Text className="text-gray-200">
            <Text className="text-white font-semibold">Quick Booking{"\n"}</Text>
            Schedule services that fit your timeline
          </Text>
        </View>

        <View className="mb-6 flex-row items-start">
          <Ionicons name="shield-checkmark" size={20} color="white" className="mr-2" />
          <Text className="text-gray-200">
            <Text className="text-white font-semibold">Guaranteed Quality{"\n"}</Text>
            Protected service with satisfaction guarantee
          </Text>
        </View>

        {/* Start Journey Button */}
        <TouchableOpacity
          className="bg-white px-6 py-3 rounded-full flex-row items-center self-start">
          <Text className="text-black font-semibold">Start Your Journey</Text>
          <Ionicons name="arrow-forward" size={20} color="black" className="ml-2" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
