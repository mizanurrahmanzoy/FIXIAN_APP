import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import BottomNav from "./BottomNav";

export default function JobsScreen() {
  const user = auth.currentUser;
  const [jobs, setJobs] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // New job state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [providerName, setProviderName] = useState("");

  // Fetch current provider name
  const fetchProviderName = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "ServiceProviders", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProviderName(docSnap.data().name || "Unknown");
      }
    } catch (error) {
      console.error("Error fetching provider name:", error);
    }
  };

  // Fetch Jobs
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
    fetchProviderName();
    fetchJobs();
  }, []);

  // Add new Job
  const handleAddJob = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to post a service.");
      return;
    }

    if (!title || !description || !price || !location || !category) {
      Alert.alert("Error", "Please fill all fields including category.");
      return;
    }

    try {
      await addDoc(collection(db, "Jobs"), {
        title,
        description,
        price,
        location,
        category,
        providerId: user.uid,
        name: providerName || "Unknown",
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", "Service added successfully!");
      setModalVisible(false);

      // Reset fields
      setTitle("");
      setDescription("");
      setPrice("");
      setLocation("");
      setCategory("");

      fetchJobs(); // refresh list
    } catch (error) {
      console.error("Error adding job:", error);
      Alert.alert("Error", "Failed to add service");
    }
  };

  const renderJob = ({ item }: any) => (
    <View className="bg-gray-100 p-4 rounded-lg mb-3">
      <Text className="text-lg font-bold text-black">{item.title}</Text>
      <Text className="text-sm text-gray-600">{item.description}</Text>
      <Text className="text-sm text-gray-800 mt-1">💰 {item.price} BDT</Text>
      <Text className="text-sm text-gray-800">📍 {item.location}</Text>
      <Text className="text-sm text-gray-700">📂 {item.category}</Text>
      <Text className="text-sm text-gray-700 mt-1">👤 {item.name}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white p-4 mt-10">
      {/* Buttons Row */}
      <View className="flex-row space-between mb-4">
        <TouchableOpacity className="bg-black px-4 py-3 rounded-lg flex-1 mr-2">
          <Text className="rounded-sm
 text-white text-center font-semibold">My Services</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-blue-600 px-4 py-3 rounded-lg flex-1 ml-2"
        >
          <Text className="text-white rounded-sm  border-black
 text-center font-semibold">Add New Service</Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Add Job Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView className="flex-1 bg-white p-6">
          <Text className="text-2xl font-bold mb-4">Add New Service</Text>

          <TextInput
            placeholder="Service Title"
            value={title}
            onChangeText={setTitle}
            className="bg-gray-100 p-4 rounded-lg mb-3"
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            className="bg-gray-100 p-4 rounded-lg mb-3"
          />
          <TextInput
            placeholder="Price (BDT)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            className="bg-gray-100 p-4 rounded-lg mb-3"
          />
          <TextInput
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            className="bg-gray-100 p-4 rounded-lg mb-3"
          />

          {/* Category Picker */}
          <View className="bg-gray-100 rounded-lg mb-4">
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
            >
              <Picker.Item label="Select Category" value="" />
              <Picker.Item label="Plumbing" value="plumbing" />
              <Picker.Item label="Electrical" value="electrical" />
              <Picker.Item label="Cleaning" value="cleaning" />
              <Picker.Item label="Painting" value="painting" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          {/* Display provider name */}
          <View className="bg-gray-200 p-4 rounded-lg mb-4">
            <Text className="text-gray-700">👤 {providerName}</Text>
          </View>

          {/* Buttons inside modal */}
          <View className="flex-row justify-between mt-6">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-gray-400 px-6 py-3 rounded-lg flex-1 mr-2"
            >
              <Text className="text-white text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddJob}
              className="bg-green-600 px-6 py-3 rounded-lg flex-1 ml-2"
            >
              <Text className="text-white text-center font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
            <BottomNav activeTab="jobs" />
      
    </View>
  );
}
