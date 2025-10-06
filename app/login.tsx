import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"customer" | "provider" | "">("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || !userType) {
      Alert.alert("Error", "Please fill all fields and select user type");
      return;
    }

    setLoading(true);
    try {
      // Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Determine the correct collection
      const collectionName = userType === "customer" ? "customers" : "ServiceProviders";

      // Fetch user document from Firestore
      const userDocRef = doc(db, collectionName, user.uid);
      const userDocSnap = await getDoc(userDocRef);

      setLoading(false);

      if (!userDocSnap.exists()) {
        Alert.alert("Error", `${userType === "customer" ? "Customer" : "Provider"} data not found`);
        return;
      }

      // Redirect to respective dashboard
      if (userType === "customer") {
        router.replace("./customer/dashboard");
      } else {
        router.replace("./service_provider/dashboard");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      Alert.alert("Login Error", (error as Error).message);
    }
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-bold mb-8 text-center">
        Welcome Back 👋
      </Text>

      {/* Email Input */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-4"
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-4"
      />

      {/* User Type Selection */}
      <View className="flex-row justify-around mb-6">
        <TouchableOpacity
          onPress={() => setUserType("customer")}
          className={`py-3 px-6 rounded-full ${
            userType === "customer" ? "bg-white" : "bg-gray-700"
          }`}
        >
          <Text className={`${userType === "customer" ? "text-black" : "text-white"} font-semibold`}>
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setUserType("provider")}
          className={`py-3 px-6 rounded-full ${
            userType === "provider" ? "bg-white" : "bg-gray-700"
          }`}
        >
          <Text className={`${userType === "provider" ? "text-black" : "text-white"} font-semibold`}>
            Service Provider
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className={`py-3 rounded-full mb-4 ${loading ? "bg-gray-500" : "bg-white"}`}
      >
        <Text className="text-black text-center font-semibold">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Google Sign In */}
      <TouchableOpacity
        onPress={() => console.log("Google Sign-In")}
        className="flex-row items-center justify-center border border-gray-400 py-3 rounded-full mb-6"
      >
        <Ionicons name="logo-google" size={20} color="white" />
        <Text className="text-white ml-2 font-medium">Sign in with Google</Text>
      </TouchableOpacity>

      {/* Navigate to Signup */}
      <TouchableOpacity onPress={() => router.push("/signup")} className="self-center mt-4">
        <Text className="text-gray-300 text-center">
          Don’t have an account?{" "}
          <Text className="text-white font-semibold">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
