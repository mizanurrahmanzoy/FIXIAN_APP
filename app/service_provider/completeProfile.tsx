import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";

export default function ProviderCompleteProfile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [district, setDistrict] = useState("");
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
    if (!name || !phone || !serviceCategory) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Save to "ServiceProviders" collection instead of "users"
      await setDoc(doc(db, "ServiceProviders", user.uid), {
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
      }, { merge: true });

      setLoading(false);
      Alert.alert("Success", "Profile completed successfully!");
      router.replace("/providerDashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center px-6">
      <Text className="text-white text-2xl font-bold mb-6">Complete Provider Profile</Text>

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

      {/* Service Category Dropdown */}
      <Picker
        selectedValue={serviceCategory}
        onValueChange={(value) => setServiceCategory(value)}
        style={{ backgroundColor: "white", marginBottom: 10, width: "100%" }}
      >
        <Picker.Item label="Select Service Category" value="" />
        <Picker.Item label="Electrician" value="electrician" />
        <Picker.Item label="Plumber" value="plumber" />
        <Picker.Item label="Technician" value="technician" />
        <Picker.Item label="Painter" value="painter" />
      </Picker>

      <TextInput
        placeholder="Experience (e.g. 2 years)"
        placeholderTextColor="#aaa"
        value={experience}
        onChangeText={setExperience}
        className="bg-white w-full p-4 rounded-lg mb-4 text-black"
      />

      {/* District Dropdown */}
      <Picker
        selectedValue={district}
        onValueChange={(value) => setDistrict(value)}
        style={{ backgroundColor: "white", marginBottom: 20, width: "100%" }}
      >
        <Picker.Item label="Select District" value="" />
        {districtsList.map((d, i) => (
          <Picker.Item key={i} label={d} value={d} />
        ))}
      </Picker>

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
