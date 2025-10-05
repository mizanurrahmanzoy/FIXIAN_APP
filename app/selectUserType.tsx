import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SelectUserType() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleSelectRole = async (role: "customer" | "provider") => {
    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No user logged in!");
        setLoading(false);
        return;
      }

      // Save role + email + name + createdAt to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          role: role,
          email: user.email,
          name: name || "", // if user didn’t type name yet, fallback to empty
          createdAt: serverTimestamp(),
        },
        { merge: true } // ✅ so we don’t overwrite existing fields
      );

      setLoading(false);

      // Navigate to respective dashboard
      if (role === "customer") {
        router.replace("/customerDashboard");
      } else {
        router.replace("/providerDashboard");
      }
    } catch (error) {
      setLoading(false);
      console.error("Role selection error:", error);
      Alert.alert("Error", "Failed to save role. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center px-6">
      <Text className="text-white text-2xl font-bold mb-8 text-center">
        Choose Your Account Type
      </Text>

      {/* Input for Name */}
      <TextInput
        placeholder="Enter your full name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        className="bg-white w-full p-4 rounded-lg mb-6 text-black"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          {/* Customer Button */}
          <TouchableOpacity
            onPress={() => handleSelectRole("customer")}
            className="bg-white w-full py-4 rounded-full mb-4"
          >
            <Text className="text-black text-center text-lg font-semibold">
              Continue as Customer
            </Text>
          </TouchableOpacity>

          {/* Provider Button */}
          <TouchableOpacity
            onPress={() => handleSelectRole("provider")}
            className="bg-gray-800 w-full py-4 rounded-full"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Continue as Service Provider
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
