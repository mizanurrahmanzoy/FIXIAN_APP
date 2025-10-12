import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";

export default function ProviderCompleteProfile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email] = useState(auth.currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [district, setDistrict] = useState("");
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Districts from Firestore
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "districts"));
        const data = querySnapshot.docs.map((doc) => doc.data().name);
        setDistrictsList(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, []);

  // Save Profile
  const handleSave = async () => {
    if (!name || !phone || !serviceCategory || !district) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await setDoc(
        doc(db, "ServiceProviders", user.uid),
        {
          providerId: user.uid,
          name,
          email,
          phone,
          serviceCategory,
          experience,
          location: { district },
          createdAt: serverTimestamp(),
          isProfileComplete: true,
          role: "provider",
        },
        { merge: true }
      );

      setLoading(false);
      Alert.alert("Success", "Profile completed successfully!");
      router.replace("/service_provider/dashboard"); // ✅ redirect to dashboard
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Complete Provider Profile</Text>

        {/* Full Name */}
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#888"
          style={styles.input}
        />

        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          editable={false}
          placeholderTextColor="#888"
          style={[styles.input, styles.disabledInput]}
        />

        {/* Phone */}
        <TextInput
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          style={styles.input}
        />

        {/* Service Category */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={serviceCategory}
            onValueChange={(value) => setServiceCategory(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Service Category" value="" />
            <Picker.Item label="Electrician" value="electrician" />
            <Picker.Item label="Plumber" value="plumber" />
            <Picker.Item label="Technician" value="technician" />
            <Picker.Item label="Painter" value="painter" />
          </Picker>
        </View>

        {/* Experience */}
        <TextInput
          placeholder="Experience (e.g. 2 years)"
          value={experience}
          onChangeText={setExperience}
          placeholderTextColor="#888"
          style={styles.input}
        />

        {/* District */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={district}
            onValueChange={(value) => setDistrict(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select District" value="" />
            {districtsList.map((d, i) => (
              <Picker.Item key={i} label={d} value={d} />
            ))}
          </Picker>
        </View>

        {/* Save Button */}
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 10 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111",
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    color: "#000",
  },
  disabledInput: {
    backgroundColor: "#e5e7eb",
    color: "#555",
  },
  pickerWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
