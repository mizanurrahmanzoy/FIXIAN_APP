import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
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

      // Save to "customers" collection instead of "users"
      await setDoc(doc(db, "customers", user.uid), {
        customerId: user.uid,
        name,
        email,
        phone,
        dob,
        location: { district, thana, city, village, union },
        createdAt: serverTimestamp(),
        isProfileComplete: true,
        role: "customer",
      }, { merge: true }); // merge:true ensures existing data is not overwritten

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
    <View className="flex-1 bg-black justify-center items-center px-6">
      <Text className="text-white text-2xl font-bold mb-6">Complete Customer Profile</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        className="bg-white w-full p-4 rounded-lg mb-3 text-black"
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        editable={false}
        className="bg-gray-300 w-full p-4 rounded-lg mb-3 text-black"
      />

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#aaa"
        value={phone}
        onChangeText={setPhone}
        className="bg-white w-full p-4 rounded-lg mb-3 text-black"
      />

      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        value={dob}
        onChangeText={setDob}
        className="bg-white w-full p-4 rounded-lg mb-3 text-black"
      />

      {/* District Dropdown */}
      <Picker
        selectedValue={district}
        onValueChange={(value) => setDistrict(value)}
        style={{ backgroundColor: "white", marginBottom: 10, width: "100%" }}
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
        className="bg-white w-full p-4 rounded-lg mb-3 text-black"
      />

      <TextInput
        placeholder="City"
        placeholderTextColor="#aaa"
        value={city}
        onChangeText={setCity}
        className="bg-white w-full p-4 rounded-lg mb-3 text-black"
      />

      <TextInput
        placeholder="Village/Town"
        placeholderTextColor="#aaa"
        value={village}
        onChangeText={setVillage}
        className="bg-white w-full p-4 rounded-lg mb-3 text-black"
      />

      <TextInput
        placeholder="Union/Ward"
        placeholderTextColor="#aaa"
        value={union}
        onChangeText={setUnion}
        className="bg-white w-full p-4 rounded-lg mb-4 text-black"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <TouchableOpacity onPress={handleSave} className="bg-white w-full py-4 rounded-full">
          <Text className="text-black text-center text-lg font-semibold">Save Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
