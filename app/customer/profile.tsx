// app/customer/profile.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BottomNav from "./BottomNav";

import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

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
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // Fetch customer profile
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
          setProfileImage(data.profileImage || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Upload profile image
  const handleUploadImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Access to gallery is required!");
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

      const storage = getStorage();
      const imageRef = ref(storage, `profileImages/${user?.uid}-${Date.now()}`);
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      setProfileImage(downloadURL);

      await updateDoc(doc(db, "customers", user!.uid), { profileImage: downloadURL });

      setLoadingImage(false);
      Alert.alert("Success", "Profile image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setLoadingImage(false);
      Alert.alert("Error", "Failed to upload profile image");
    }
  };

  // Save profile
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

  const handleLogout = () => {
    auth.signOut();
    router.replace("/login");
  };

  const renderLocation = () => {
    if (!location) return "Not set";
    const parts = [
      location.district,
      location.city,
      location.thana,
      location.union,
      location.village,
    ].filter(Boolean);
    return parts.join(", ") || "Not set";
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Customer Profile</Text>

        {/* Profile Image */}
        <TouchableOpacity
          onPress={editMode ? handleUploadImage : undefined}
          style={styles.imageContainer}
        >
          {loadingImage ? (
            <ActivityIndicator size="large" color="#000" />
          ) : profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadText}>Upload Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Edit toggle */}
        <TouchableOpacity onPress={() => setEditMode(!editMode)} style={styles.editButton}>
          <Text style={styles.editButtonText}>{editMode ? "Cancel Edit" : "Edit Profile"}</Text>
        </TouchableOpacity>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          editable={editMode}
          style={[styles.input, !editMode && styles.readOnlyInput]}
        />

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} editable={false} style={[styles.input, styles.readOnlyInput]} />

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          placeholder="Phone"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={setPhone}
          editable={editMode}
          keyboardType="phone-pad"
          style={[styles.input, !editMode && styles.readOnlyInput]}
        />

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        {editMode ? (
          <TouchableOpacity
            onPress={() => setMapModalVisible(true)}
            style={[styles.input, { justifyContent: "center" }]}
          >
            <Text style={{ color: location ? "#000" : "#aaa" }}>
              {location ? renderLocation() : "Select Location"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.locationText}>{renderLocation()}</Text>
        )}

        {/* Save button */}
        {editMode && (
          <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        )}

        {/* Extra options */}
        <View style={{ marginTop: 30 }}>
          <TouchableOpacity onPress={() => router.push("./privacy-policy")} style={styles.optionButton}>
            <Text style={styles.optionText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={[styles.optionButton, { backgroundColor: "#e74c3c" }]}>
            <Text style={[styles.optionText, { color: "#fff" }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav activeTab="profile" />

      {/* Map Modal */}
      <Modal visible={mapModalVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <GooglePlacesAutocomplete
            placeholder="Search"
            onPress={(data, details = null) => {
              // Extract location details from Google Place
              const loc = {
                district: details?.address_components.find(c => c.types.includes("administrative_area_level_2"))?.long_name || "",
                city: details?.address_components.find(c => c.types.includes("locality"))?.long_name || "",
                thana: "",
                union: "",
                village: "",
                latitude: details?.geometry.location.lat,
                longitude: details?.geometry.location.lng,
              };
              setLocation(loc);
              setMapModalVisible(false);
            }}
            query={{
              key: "YOUR_GOOGLE_MAPS_API_KEY",
              language: "en",
            }}
            fetchDetails={true}
            styles={{
              container: { flex: 1 },
              listView: { backgroundColor: "#fff" },
            }}
          />
          <TouchableOpacity onPress={() => setMapModalVisible(false)} style={{ padding: 15, backgroundColor: "#000" }}>
            <Text style={{ color: "#fff", textAlign: "center" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 50 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#000" },
  imageContainer: { alignSelf: "center", marginBottom: 20 },
  profileImage: { width: 128, height: 128, borderRadius: 64 },
  uploadPlaceholder: { width: 128, height: 128, borderRadius: 64, backgroundColor: "#e5e5e5", alignItems: "center", justifyContent: "center" },
  uploadText: { color: "#666" },
  editButton: { backgroundColor: "#000", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: "center", marginBottom: 20 },
  editButtonText: { color: "#fff", fontWeight: "600" },
  label: { color: "#555", fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: "#f2f2f2", padding: 14, borderRadius: 8, marginBottom: 12, fontSize: 16 },
  readOnlyInput: { backgroundColor: "#e0e0e0", color: "#555" },
  locationText: { fontSize: 16, color: "#000", marginBottom: 16 },
  saveButton: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 8, marginBottom: 20 },
  saveButtonText: { color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 16 },
  optionButton: { padding: 15, backgroundColor: "#f2f2f2", borderRadius: 8, marginBottom: 12 },
  optionText: { fontSize: 16, color: "#000", fontWeight: "500" },
});
