// app/provider/profile.tsx
import React, { useEffect, useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../utils/cloudinary";

export default function ProviderProfile() {
  const router = useRouter();
  const user = auth.currentUser;
  
  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Not authenticated</Text>
      </View>
    );
  }
  
  const providerRef = doc(db, "ServiceProviders", user.uid);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [location, setLocation] = useState<any>(null);

  const serviceCategories = ["Electrician", "Plumber", "Technician", "Painter"];

  // ========================
  // LOAD PROFILE DATA
  // ========================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const snap = await getDoc(providerRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfileImage(data.profileImage || "https://res.cloudinary.com/dua4hldkk/image/upload/v1763330304/fixian/default_pic.avif");
          setName(data.name || "");
          setPhone(data.phone || "");
          setExperience(data.experience || "");
          setServiceCategory(data.serviceCategory || "");
          setLocation(data.location || null);
        }
      } catch (e) {
        console.log("Error loading profile:", e);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  // ========================
  // PICK IMAGE
  // ========================
  const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        uploadImage(result.assets[0].uri);
      }
    };
  

  // ========================
  // UPLOAD IMAGE TO CLOUDINARY
  // ========================
  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", { uri, type: "image/jpeg", name: "profile.jpg" } as any);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
      const data = await res.json();

      if (data.secure_url) {
        setProfileImage(data.secure_url);
      } else {
        Alert.alert("Upload failed", "Unable to get image URL from Cloudinary");
      }
    } catch (err) {
      console.log("Upload error:", err);
      Alert.alert("Error", "Image upload failed");
    }
    setUploading(false);
  };

  // ========================
  // REMOVE IMAGE
  // ========================
  const removeImage = () => {
    Alert.alert("Remove Image?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setProfileImage(null),
      },
    ]);
  };

  // ========================
  // SAVE PROFILE
  // ========================
  const saveProfile = async () => {
    if (!name || !phone || !serviceCategory) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(providerRef, {
        name,
        phone,
        experience,
        serviceCategory,
        location,
        profileImage: profileImage || "",
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Success", "Profile updated!");
      setEditMode(false);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update profile");
    }
    setLoading(false);
  };

  const logout = () => {
    auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* PROFILE IMAGE */}
      <View style={styles.imageBox}>
        {uploading ? (
          <ActivityIndicator size="large" />
        ) : profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <Text>No Image</Text>
        )}
      </View>

      {/* EDIT MODE BUTTON */}
      <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(!editMode)}>
        <Text style={styles.editButtonText}>{editMode ? "Cancel Edit" : "Edit Profile"}</Text>
      </TouchableOpacity>

      {/* UPLOAD/REMOVE BUTTONS (VISIBLE IN EDIT MODE) */}
      {editMode && (
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={pickImage}>
            <Text style={styles.btnText}>Upload</Text>
          </TouchableOpacity>
          {profileImage && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: "red" }]} onPress={removeImage}>
              <Text style={styles.btnText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* NAME */}
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} editable={editMode} />

      {/* PHONE */}
      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={editMode} />

      {/* EXPERIENCE */}
      <Text style={styles.label}>Experience</Text>
      <TextInput style={styles.input} value={experience} onChangeText={setExperience} editable={editMode} />

      {/* SERVICE CATEGORY */}
      <Text style={styles.label}>Service Category</Text>
      {editMode ? (
        <View style={styles.pickerContainer}>
          {serviceCategories.map((cat, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setServiceCategory(cat)}
              style={[styles.categoryButton, serviceCategory === cat && styles.categoryButtonActive]}
            >
              <Text style={[styles.categoryText, serviceCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.valueText}>{serviceCategory || "Not set"}</Text>
      )}

      {/* SAVE BUTTON */}
      {editMode && (
        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
        </TouchableOpacity>
      )}

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageBox: { width: 140, height: 140, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 15 },
  image: { width: "100%", height: "100%", borderRadius: 100 },
  row: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 20 },
  btn: { backgroundColor: "#4A90E2", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  btnText: { color: "#fff", fontSize: 14 },
  editButton: { backgroundColor: "#000", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: "center", marginBottom: 20 },
  editButtonText: { color: "#fff", fontWeight: "600" },
  label: { marginTop: 10, fontSize: 15, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginTop: 6 },
  valueText: { fontSize: 16, color: "#000", marginBottom: 16 },
  pickerContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  categoryButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#f2f2f2" },
  categoryButtonActive: { backgroundColor: "#000" },
  categoryText: { color: "#555" },
  categoryTextActive: { color: "#fff" },
  saveBtn: { backgroundColor: "#2ecc71", paddingVertical: 14, borderRadius: 10, marginTop: 20 },
  saveText: { color: "#fff", fontSize: 17, textAlign: "center", fontWeight: "600" },
  logoutBtn: { backgroundColor: "#e74c3c", paddingVertical: 14, borderRadius: 10, marginTop: 15 },
  logoutText: { color: "#fff", fontSize: 17, textAlign: "center", fontWeight: "600" },
});
