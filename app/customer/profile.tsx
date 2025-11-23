import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../utils/cloudinary";

export default function CustomerProfile() {
  const user = auth.currentUser;

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Not authenticated</Text>
      </View>
    );
  }

  const customerRef = doc(db, "customers", user.uid);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");

  // location fields
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [union, setUnion] = useState("");
  const [village, setVillage] = useState("");

  // ========================
  // LOAD PROFILE DATA
  // ========================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // First try local storage
        const localData = await AsyncStorage.getItem(`user_${user.uid}`);
        if (localData) {
          const data = JSON.parse(localData);
          setProfileImage(data.profileImage || null);
          setName(data.name || "");
          setPhone(data.phone || "");
          setDob(data.dob || "");

          if (data.location) {
            setCity(data.location.city || "");
            setDistrict(data.location.district || "");
            setThana(data.location.thana || "");
            setUnion(data.location.union || "");
            setVillage(data.location.village || "");
          }
          setLoading(false);
          return;
        }

        // Fetch from Firestore if local not found
        const snap = await getDoc(customerRef);
        if (snap.exists()) {
          const data = snap.data();

          setProfileImage(data.profileImage || null);
          setName(data.name || "");
          setPhone(data.phone || "");
          setDob(data.dob || "");

          if (data.location) {
            setCity(data.location.city || "");
            setDistrict(data.location.district || "");
            setThana(data.location.thana || "");
            setUnion(data.location.union || "");
            setVillage(data.location.village || "");
          }

          // Save to local storage for next time
          await AsyncStorage.setItem(
            `user_${user.uid}`,
            JSON.stringify(data)
          );
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
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      uploadImage(result.assets[0].uri);
    }
  };

  // ========================
  // UPLOAD TO CLOUDINARY
  // ========================
  const uploadImage = async (uri: string) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.secure_url) {
        setProfileImage(data.secure_url);
      } else {
        Alert.alert("Upload failed", "Cloudinary response invalid");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Image upload failed");
    }

    setUploading(false);
  };

  // ========================
  // REMOVE PROFILE IMAGE
  // ========================
  const removeImage = () => {
    Alert.alert("Remove Picture?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setProfileImage(null),
      },
    ]);
  };

  // ========================
  // SAVE PROFILE INFO
  // ========================
  const saveInfo = async () => {
    try {
      const dataToSave = {
        profileImage,
        name,
        phone,
        dob,
        updatedAt: serverTimestamp(),
        location: {
          city,
          district,
          thana,
          union,
          village,
        },
      };

      await updateDoc(customerRef, dataToSave);

      // Save locally
      await AsyncStorage.setItem(`user_${user.uid}`, JSON.stringify(dataToSave));

      Alert.alert("Saved", "Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to save profile");
    }
  };

  // ========================
  // LOGOUT
  // ========================
  const handleLogout = async () => {
    try {
      // Clear local storage
      await AsyncStorage.removeItem(`user_${user.uid}`);
      await AsyncStorage.removeItem("role");

      // Sign out
      await auth.signOut();
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Error", "Logout failed");
    }
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
      {/* IMAGE */}
      <View style={styles.imageBox}>
        {uploading ? (
          <ActivityIndicator size="large" />
        ) : profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <Text>No Image</Text>
        )}
      </View>

      {/* EDIT MODE TOGGLE */}
      <TouchableOpacity
        style={[styles.btn, { alignSelf: "center", marginBottom: 10 }]}
        onPress={() => setEditMode(!editMode)}
      >
        <Text style={styles.btnText}>{editMode ? "Cancel Edit" : "Edit Profile"}</Text>
      </TouchableOpacity>

      {/* UPLOAD / REMOVE BUTTONS */}
      {editMode && (
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={pickImage}>
            <Text style={styles.btnText}>Upload</Text>
          </TouchableOpacity>
          {profileImage && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "red" }]}
              onPress={removeImage}
            >
              <Text style={styles.btnText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Name */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        editable={editMode}
      />

      {/* Phone */}
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        editable={editMode}
      />

      {/* DOB */}
      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={styles.input}
        value={dob}
        onChangeText={setDob}
        editable={editMode}
      />

      {/* LOCATION */}
      <Text style={styles.sectionTitle}>Location</Text>
      {["City", "District", "Thana", "Union", "Village"].map((label, i) => {
        const values = [city, district, thana, union, village];
        const setters = [setCity, setDistrict, setThana, setUnion, setVillage];
        return (
          <View key={i}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={values[i]}
              onChangeText={setters[i]}
              editable={editMode}
            />
          </View>
        );
      })}

      {/* SAVE BUTTON */}
      {editMode && (
        <TouchableOpacity style={styles.saveBtn} onPress={saveInfo}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      {/* COMPLAIN & LOGOUT */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#e67e22", marginTop: 15 }]}
        onPress={() => alert("Complain placeholder")}
      >
        <Text style={styles.btnText}>Complain</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#e74c3c", marginTop: 10 }]}
        onPress={handleLogout}
      >
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  imageBox: {
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    overflow: "hidden",
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  btnText: {
    color: "white",
    fontSize: 14,
  },
  label: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "700",
  },
  saveBtn: {
    marginTop: 25,
    backgroundColor: "#2ecc71",
    paddingVertical: 14,
    borderRadius: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 17,
    textAlign: "center",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
