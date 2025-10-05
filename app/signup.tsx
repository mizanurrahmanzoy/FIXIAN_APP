import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "provider" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !role) {
      Alert.alert("Error", "Please fill all fields and select role");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save role & email to Firestore (basic info)
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        isProfileComplete: false, // ✅ flag to check if they finished profile form
      });

      setLoading(false);
      Alert.alert("Success", "Account created successfully!");

      // Go to Profile Completion page
      if (role === "customer") {
        router.replace("/customer/completeProfile");
      } else {
        router.replace("/service_provider/completeProfile");
      }
      
    } catch (error: any) {
      setLoading(false);
      console.error("Signup error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center px-6">
      <Text className="text-white text-2xl font-bold mb-8">Create Account</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        className="bg-white w-full p-4 rounded-lg mb-4 text-black"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="bg-white w-full p-4 rounded-lg mb-4 text-black"
      />

      {/* Role Selection */}
      <View className="flex-row justify-between w-full mb-6">
        <TouchableOpacity
          onPress={() => setRole("customer")}
          className={`flex-1 py-3 mr-2 rounded-lg ${
            role === "customer" ? "bg-white" : "bg-gray-700"
          }`}
        >
          <Text className={`text-center ${role === "customer" ? "text-black" : "text-white"}`}>
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole("provider")}
          className={`flex-1 py-3 ml-2 rounded-lg ${
            role === "provider" ? "bg-white" : "bg-gray-700"
          }`}
        >
          <Text className={`text-center ${role === "provider" ? "text-black" : "text-white"}`}>
            Provider
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <TouchableOpacity
          onPress={handleSignup}
          className="bg-white w-full py-4 rounded-full"
        >
          <Text className="text-black text-center text-lg font-semibold">Sign Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
