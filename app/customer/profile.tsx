// app/customer/profile.tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import BottomNav from "./BottomNav";

export default function CustomerProfile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Fetch customer data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "customers", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setPhone(data.phone || "");
          setLocation(data.location || null);
          setProfileImage(data.profileImage || null); // optional stored locally only
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!user) return;
    if (!name || !phone) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "customers", user.uid), {
        name,
        phone,
        location,
        updatedAt: serverTimestamp(),
      });
      setLoading(false);
      Alert.alert("Success", "Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // Handle profile image upload (stored locally, not Firestore)
  const handleUploadImage = async () => {
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
      setProfileImage(pickerResult.assets[0].uri);
      setLoadingImage(false);
      Alert.alert("Success", "Profile image selected!");
    } catch (error) {
      console.error("Error selecting image:", error);
      setLoadingImage(false);
      Alert.alert("Error", "Failed to select image");
    }
  };

  return (
    <>
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Customer Profile</Text>

      {/* Profile Image */}
      <TouchableOpacity onPress={editMode ? handleUploadImage : undefined} className="self-center mb-6">
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

      {/* Edit Mode Toggle */}
      <TouchableOpacity
        onPress={() => setEditMode(!editMode)}
        className="bg-black py-2 px-4 rounded mb-6 self-center"
      >
        <Text className="text-white font-semibold">{editMode ? "Cancel Edit" : "Edit Profile"}</Text>
      </TouchableOpacity>

      {/* Name */}
      <Text className="text-gray-600 font-semibold">Name</Text>
      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        editable={editMode}
        className="bg-gray-100 w-full p-4 rounded-lg mb-3"
      />

      {/* Email (read-only) */}
      <Text className="text-gray-600 font-semibold">Email</Text>
      <TextInput
        value={email}
        editable={false}
        className="bg-gray-200 w-full p-4 rounded-lg mb-3 text-gray-700"
      />

      {/* Phone */}
      <Text className="text-gray-600 font-semibold">Phone</Text>
      <TextInput
        placeholder="Phone"
        placeholderTextColor="#aaa"
        value={phone}
        onChangeText={setPhone}
        editable={editMode}
        keyboardType="phone-pad"
        className="bg-gray-100 w-full p-4 rounded-lg mb-3"
      />

      {/* Location */}
      <Text className="text-gray-600 font-semibold">Location</Text>
      {editMode ? (
        <>
          <TextInput
            placeholder="District"
            placeholderTextColor="#aaa"
            value={location?.district || ""}
            onChangeText={(text) => setLocation({ ...location, district: text })}
            className="bg-gray-100 w-full p-4 rounded-lg mb-2"
          />
          <TextInput
            placeholder="City"
            placeholderTextColor="#aaa"
            value={location?.city || ""}
            onChangeText={(text) => setLocation({ ...location, city: text })}
            className="bg-gray-100 w-full p-4 rounded-lg mb-2"
          />
          <TextInput
            placeholder="Thana"
            placeholderTextColor="#aaa"
            value={location?.thana || ""}
            onChangeText={(text) => setLocation({ ...location, thana: text })}
            className="bg-gray-100 w-full p-4 rounded-lg mb-2"
          />
          <TextInput
            placeholder="Union/Ward"
            placeholderTextColor="#aaa"
            value={location?.union || ""}
            onChangeText={(text) => setLocation({ ...location, union: text })}
            className="bg-gray-100 w-full p-4 rounded-lg mb-2"
          />
          <TextInput
            placeholder="Village/Town"
            placeholderTextColor="#aaa"
            value={location?.village || ""}
            onChangeText={(text) => setLocation({ ...location, village: text })}
            className="bg-gray-100 w-full p-4 rounded-lg mb-4"
          />
        </>
      ) : (
        <Text className="text-black text-lg mb-4">
          {location
            ? `${location.district || ""}, ${location.city || ""}, ${location.thana || ""}, ${location.union || ""}, ${location.village || ""}`
            : "Not set"}
        </Text>
      )}

      {/* Save Button */}
      {editMode && (
        <TouchableOpacity
          onPress={handleSaveProfile}
          className="bg-black w-full py-4 rounded-lg mb-6"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">Save Changes</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
    <BottomNav activeTab="profile" />
    </>
  );
}
