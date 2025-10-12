import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../firebaseConfig";

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const collectionName = userType === "customer" ? "customers" : "ServiceProviders";
      const userDocRef = doc(db, collectionName, user.uid);
      const userDocSnap = await getDoc(userDocRef);

      setLoading(false);

      if (!userDocSnap.exists()) {
        Alert.alert("Error", `${userType === "customer" ? "Customer" : "Provider"} data not found`);
        return;
      }

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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo Section */}
      {/* <Image
        source={require("../assets/fixian_logo.png")} // 🔹 use your uploaded logo here
        style={styles.logo}
        resizeMode="contain"
      /> */}

      {/* Welcome Text */}
      <Text style={styles.title}>Fixian.</Text>
      <Text style={styles.subtitle}>Welcome Back!</Text>
      <Text style={styles.description}>
        Login your account using email{"\n"}and password or social media
      </Text>

      {/* Login Card */}
      <View style={styles.card}>
        {/* Email Input */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {/* Password Input */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {/* User Type Buttons */}
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            onPress={() => setUserType("customer")}
            style={[
              styles.userTypeButton,
              userType === "customer" && styles.userTypeSelected,
            ]}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === "customer" && styles.userTypeTextSelected,
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setUserType("provider")}
            style={[
              styles.userTypeButton,
              userType === "provider" && styles.userTypeSelected,
            ]}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === "provider" && styles.userTypeTextSelected,
              ]}
            >
              Service Provider
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && { backgroundColor: "#ccc" }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Login</Text>
              <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>

        {/* Google Sign-In */}
        <TouchableOpacity style={styles.googleButton} onPress={() => console.log("Google login")}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.googleText}>Sign in with Google</Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <TouchableOpacity onPress={() => router.push("/signup")} style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don’t have an account?{" "}
            <Text style={styles.signupLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    width: 160,
    height: 70,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    color: "#007BFF",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 22,
    color: "#000",
    fontWeight: "600",
    marginTop: 5,
  },
  description: {
    textAlign: "center",
    color: "#777",
    marginBottom: 24,
    marginTop: 6,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginHorizontal: 5,
  },
  userTypeSelected: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  userTypeText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
  },
  userTypeTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 12,
  },
  googleText: {
    marginLeft: 8,
    color: "#000",
    fontWeight: "500",
  },
  signupContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  signupText: {
    color: "#777",
    fontSize: 14,
  },
  signupLink: {
    color: "#007BFF",
    fontWeight: "600",
  },
});
