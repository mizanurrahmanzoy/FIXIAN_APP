// app/provider/profile.tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auth, db, storage } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BottomNav from "./BottomNav";

export default function ProviderProfile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [district, setDistrict] = useState("");
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "ServiceProviders", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setPhone(data.phone || "");
          setServiceCategory(data.serviceCategory || "");
          setExperience(data.experience || "");
          setDistrict(data.location?.district || "");
          setProfileImage(data.profileImage || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchDistricts = async () => {
      try {
        const querySnapshot = await getDoc(doc(db, "districts", "all")); // Or collection(db, "districts")
        // Example for simple array; adjust as your districts collection structure
        if (querySnapshot.exists()) setDistrictsList(querySnapshot.data().names || []);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchProfile();
    fetchDistricts();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!name || !phone || !serviceCategory) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "ServiceProviders", user.uid), {
        name,
        phone,
        serviceCategory,
        experience,
        location: { district },
        updatedAt: serverTimestamp(),
      });
      setLoading(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleUploadImage = async () => {
    if (!user) return;
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Permission to access gallery is required!");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) return;

      setLoadingImage(true);
      const localUri = pickerResult.assets[0].uri;
      const response = await fetch(localUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `providers/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "ServiceProviders", user.uid), {
        profileImage: downloadURL,
        updatedAt: serverTimestamp(),
      });

      setProfileImage(downloadURL);
      setLoadingImage(false);
      Alert.alert("Success", "Profile image updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setLoadingImage(false);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  return (
    <>
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Provider Profile</Text>

      <TouchableOpacity onPress={handleUploadImage} className="self-center mb-6">
        {loadingImage ? (
          <ActivityIndicator size="large" color="#000" />
        ) : profileImage ? (
          <Image source={{ uri: profileImage }} className="w-32 h-32 rounded-full" />
        ) : (
          <View className="w-32 h-32 bg-gray-200 rounded-full justify-center items-center">
            <Text className="text-gray-500">Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        className="bg-gray-100 w-full p-4 rounded-lg mb-3"
      />

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#aaa"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        className="bg-gray-100 w-full p-4 rounded-lg mb-3"
      />

      {/* Service Category */}
      <Picker
        selectedValue={serviceCategory}
        onValueChange={(value) => setServiceCategory(value)}
        style={{ backgroundColor: "#f3f3f3", marginBottom: 10, width: "100%" }}
      >
        <Picker.Item label="Select Service Category" value="" />
        <Picker.Item label="Electrician" value="electrician" />
        <Picker.Item label="Plumber" value="plumber" />
        <Picker.Item label="Technician" value="technician" />
        <Picker.Item label="Painter" value="painter" />
      </Picker>

      <TextInput
        placeholder="Experience (e.g., 2 years)"
        placeholderTextColor="#aaa"
        value={experience}
        onChangeText={setExperience}
        className="bg-gray-100 w-full p-4 rounded-lg mb-3"
      />

      {/* District */}
      <Picker
        selectedValue={district}
        onValueChange={(value) => setDistrict(value)}
        style={{ backgroundColor: "#f3f3f3", marginBottom: 20, width: "100%" }}
      >
        <Picker.Item label="Select District" value="" />
        {districtsList.map((d, i) => (
          <Picker.Item key={i} label={d} value={d} />
        ))}
      </Picker>

      <TouchableOpacity
        onPress={handleSaveProfile}
        className="bg-black w-full py-4 rounded-lg mb-6"
      >
        <Text className="text-white text-center font-semibold">Save Profile</Text>
      </TouchableOpacity>

    </ScrollView>
    <BottomNav activeTab="Profile" />
    </>
  );
}
