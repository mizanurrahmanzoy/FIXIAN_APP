import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";

export default function CustomerCompleteProfile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [city, setCity] = useState("");
  const [village, setVillage] = useState("");
  const [union, setUnion] = useState("");
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSave = async () => {
    if (!name || !phone || !dob || !district) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await setDoc(
        doc(db, "customers", user.uid),
        {
          customerId: user.uid,
          name,
          email,
          phone,
          dob,
          location: { district, thana, city, village, union },
          createdAt: serverTimestamp(),
          isProfileComplete: true,
          role: "customer",
        },
        { merge: true }
      );

      setLoading(false);
      Alert.alert("Success", "Profile completed successfully!");
      router.replace("/customer/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Customer Profile</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        editable={false}
        style={[styles.input, styles.disabledInput]}
      />

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#aaa"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        value={dob}
        onChangeText={setDob}
        style={styles.input}
      />

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

      <TextInput
        placeholder="Thana"
        placeholderTextColor="#aaa"
        value={thana}
        onChangeText={setThana}
        style={styles.input}
      />

      <TextInput
        placeholder="City"
        placeholderTextColor="#aaa"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />

      <TextInput
        placeholder="Village/Town"
        placeholderTextColor="#aaa"
        value={village}
        onChangeText={setVillage}
        style={styles.input}
      />

      <TextInput
        placeholder="Union/Ward"
        placeholderTextColor="#aaa"
        value={union}
        onChangeText={setUnion}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveText}>Save Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: "#000",
  },
  disabledInput: {
    backgroundColor: "#ccc",
  },
  picker: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#fff",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 10,
  },
  saveText: {
    color: "#000",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
