// app/provider/profile.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
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
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function ProviderProfile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  const serviceCategories = ["Electrician", "Plumber", "Technician", "Painter"];

  // Fetch profile
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

      const storage = getStorage();
      const storageRef = ref(storage, `providerImages/${user.uid}-${Date.now()}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setProfileImage(downloadURL);

      await updateDoc(doc(db, "ServiceProviders", user.uid), {
        profileImage: downloadURL,
        updatedAt: serverTimestamp(),
      });

      setLoadingImage(false);
      Alert.alert("Success", "Profile image updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setLoadingImage(false);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  // Save profile
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
    return [location.district, location.city, location.thana, location.union, location.village].filter(Boolean).join(", ");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Provider Profile</Text>

        {/* Profile Image */}
        <TouchableOpacity onPress={editMode ? handleUploadImage : undefined} style={styles.imageContainer}>
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

        {/* Edit Toggle */}
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

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          placeholder="Phone"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={editMode}
          style={[styles.input, !editMode && styles.readOnlyInput]}
        />

        {/* Service Category */}
        <Text style={styles.label}>Service Category</Text>
        {editMode ? (
          <View style={styles.pickerContainer}>
            {serviceCategories.map((cat, i) => (
              <TouchableOpacity key={i} onPress={() => setServiceCategory(cat)} style={[styles.categoryButton, serviceCategory === cat && styles.categoryButtonActive]}>
                <Text style={[styles.categoryText, serviceCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.valueText}>{serviceCategory || "Not set"}</Text>
        )}

        {/* Experience */}
        <Text style={styles.label}>Experience</Text>
        <TextInput
          placeholder="Experience (e.g., 2 years)"
          placeholderTextColor="#aaa"
          value={experience}
          onChangeText={setExperience}
          editable={editMode}
          style={[styles.input, !editMode && styles.readOnlyInput]}
        />

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        {editMode ? (
          <TouchableOpacity onPress={() => setMapModalVisible(true)} style={[styles.input, { justifyContent: "center" }]}>
            <Text style={{ color: location ? "#000" : "#aaa" }}>{location ? renderLocation() : "Select Location"}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.valueText}>{renderLocation()}</Text>
        )}

        {/* Save */}
        {editMode && (
          <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        )}

        {/* Options */}
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
            placeholder="Search location"
            fetchDetails={true}
            onPress={(data, details = null) => {
              const loc = {
                district: details?.address_components.find(c => c.types.includes("administrative_area_level_2"))?.long_name || "",
                city: details?.address_components.find(c => c.types.includes("locality"))?.long_name || "",
                latitude: details?.geometry.location.lat,
                longitude: details?.geometry.location.lng,
                thana: "",
                union: "",
                village: "",
              };
              setLocation(loc);
              setMapModalVisible(false);
            }}
            query={{ key: "YOUR_GOOGLE_API_KEY", language: "en" }}
            styles={{ textInput: { height: 50, borderColor: "#ccc", borderWidth: 1, paddingHorizontal: 10 } }}
          />
          <TouchableOpacity onPress={() => setMapModalVisible(false)} style={{ padding: 20, backgroundColor: "#000" }}>
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Close</Text>
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
  valueText: { fontSize: 16, color: "#000", marginBottom: 16 },
  saveButton: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 8, marginTop: 10 },
  saveButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  pickerContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  categoryButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#f2f2f2" },
  categoryButtonActive: { backgroundColor: "#000" },
  categoryText: { color: "#555" },
  categoryTextActive: { color: "#fff" },
  optionButton: { paddingVertical: 14, borderRadius: 8, backgroundColor: "#ddd", marginBottom: 12 },
  optionText: { color: "#000", textAlign: "center", fontWeight: "600" },
});
