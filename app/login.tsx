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
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      // Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      setLoading(false);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        if (!userData.role) {
          // No role yet → redirect to selectUserType.tsx
          router.push({
            pathname: "/selectUserType",
            params: { userId: user.uid },
          });
        } else if (userData.role === "customer") {
          router.push("/customerDashboard");
        } else if (userData.role === "provider") {
          router.push("/providerDashboard");
        } else {
          Alert.alert("Error", "Invalid role detected");
        }
      } else {
        Alert.alert("Error", "User data not found in Firestore");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      Alert.alert("Login Error", (error as Error).message);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In pressed");
    // TODO: integrate Firebase Google auth here if needed
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-bold mb-8">
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
        className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-6"
      />

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
        onPress={handleGoogleSignIn}
        className="flex-row items-center justify-center border border-gray-400 py-3 rounded-full mb-6"
      >
        <Ionicons name="logo-google" size={20} color="white" />
        <Text className="text-white ml-2 font-medium">Sign in with Google</Text>
      </TouchableOpacity>

      {/* Navigate to Signup */}
      <TouchableOpacity
        onPress={() => router.push("/signup")}
        className="self-center mt-4"
      >
        <Text className="text-gray-300 text-center">
          Don’t have an account?{" "}
          <Text className="text-white font-semibold">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
