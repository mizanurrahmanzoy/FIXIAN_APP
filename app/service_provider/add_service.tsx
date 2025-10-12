// app/provider/ProviderServices.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const windowHeight = Dimensions.get("window").height;

export default function ProviderServices() {
  const user = auth.currentUser;

  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const [providerName, setProviderName] = useState("");

  // Fetch provider name from ServiceProviders collection
  useEffect(() => {
    const fetchProviderName = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "ServiceProviders", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProviderName(data.name || "Unknown Provider");
        }
      } catch (error) {
        console.error("Error fetching provider profile:", error);
      }
    };

    fetchProviderName();
  }, [user]);

  // Fetch provider's uploaded services
  const fetchServices = async () => {
    if (!user) return;
    setLoadingServices(true);
    try {
      const q = query(collection(db, "Jobs"), where("providerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Upload new service
  const handleUpload = async () => {
    if (!title || !description || !price || !location || !category) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoadingUpload(true);
      if (!user) return;

      await addDoc(collection(db, "Jobs"), {
        title,
        description,
        price,
        location,
        category,
        name: providerName,
        providerId: user.uid,
        createdAt: serverTimestamp(),
        active: true,
      });

      // Clear form
      setTitle("");
      setDescription("");
      setPrice("");
      setLocation("");
      setCategory("");
      setModalVisible(false);

      fetchServices();
      Alert.alert("Success", "Service uploaded successfully!");
    } catch (error) {
      console.error("Error uploading service:", error);
      Alert.alert("Error", "Failed to upload service");
    } finally {
      setLoadingUpload(false);
    }
  };

  // Delete a service
  const handleDelete = async (id: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this service?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Jobs", id));
            fetchServices();
            Alert.alert("Deleted", "Service deleted successfully.");
          } catch (error) {
            console.error("Error deleting service:", error);
            Alert.alert("Error", "Failed to delete service");
          }
        },
      },
    ]);
  };

  // Activate / Deactivate service
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, "Jobs", id), { active: !isActive });
      fetchServices();
      Alert.alert("Updated", `Service ${!isActive ? "activated" : "deactivated"} successfully.`);
    } catch (error) {
      console.error("Error updating service:", error);
      Alert.alert("Error", "Failed to update service");
    }
  };

  // Render each service card
  const renderService = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>{item.title}</Text>
      <Text style={{ color: "#555", marginTop: 3 }}>{item.description}</Text>
      <Text style={{ color: "#000", marginTop: 3 }}>💰 {item.price} BDT</Text>
      <Text style={{ color: "#000" }}>📍 {item.location}</Text>
      <Text style={{ color: "#000" }}>📂 {item.category}</Text>
      <Text style={{ color: item.active ? "green" : "red", marginTop: 4 }}>
        Status: {item.active ? "Active" : "Inactive"}
      </Text>

      <View style={{ flexDirection: "row", marginTop: 10, justifyContent: "flex-end" }}>
        <TouchableOpacity
          onPress={() => handleToggleActive(item.id, item.active)}
          style={{
            backgroundColor: item.active ? "#f39c12" : "#27ae60",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {item.active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={{
            backgroundColor: "#e74c3c",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f4f4" />

      {/* 🔹 Fixed Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f4f4f4",
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderColor: "#ddd",
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your Uploaded Services</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: "#007bff",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Services List */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60, // space for fixed header
          paddingHorizontal: 15,
          paddingBottom: 50,
        }}
        style={{
          height: windowHeight - 60, // 60 = header height
          marginTop: 60,
        }}
      >
        {loadingServices ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
        ) : services.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>
            You haven’t uploaded any services yet.
          </Text>
        ) : (
          <FlatList
            data={services}
            renderItem={renderService}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* 🔹 Add New Service Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "90%",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Add New Service</Text>

            <TextInput
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
              }}
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                height: 80,
              }}
            />
            <TextInput
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
              }}
            />
            <TextInput
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
              }}
            />
            <TextInput
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
              }}
            />

            {loadingUpload ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <TouchableOpacity
                onPress={handleUpload}
                style={{
                  backgroundColor: "#007bff",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginTop: 5,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                  Upload Service
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: "#ccc",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
