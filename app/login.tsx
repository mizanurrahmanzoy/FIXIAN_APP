import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  setLoading(true);

  try {
    // 1️⃣ Log in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2️⃣ Fetch user data from Firestore
    const userRef = doc(db, "users", user.uid); // your Firestore structure
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      Alert.alert("Error", "User data not found in Firestore");
      setLoading(false);
      return;
    }

    const userData = userSnap.data();
    const role = userData.role; // "customer" or "provider"
    const isProfileComplete = userData.isProfileComplete;

    // 3️⃣ Save locally for Auto Login
    await AsyncStorage.setItem("role", role);
    await AsyncStorage.setItem("isProfileComplete", String(isProfileComplete));
    await AsyncStorage.setItem("userId", user.uid);

    // 4️⃣ Redirect based on role
    if (role === "customer") {
      router.replace("/customer/dashboard");
    } else {
      router.replace("/service_provider/dashboard");
    }

  } catch (error) {
    Alert.alert("Login Error", error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      

      <Text style={styles.title}>Fixian.</Text>
      <Text style={styles.sologran}>An On Demand Service Booking Platform</Text>
      <Text style={styles.subtitle}>Welcome Back!</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.5 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Login</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#000"
                style={{ marginLeft: 6 }}
              />
            </>
          )}
        </TouchableOpacity>

        {/* Signup */}
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
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
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  title: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#007BFF",
  },
  sologran: {
    fontSize: 16,
    color: "#555",
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
    marginBottom: 30,
  },
  card: {
    width: "100%",
    backgroundColor: "#F5F6F7",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    borderRadius: 10,
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  signupText: {
    textAlign: "center",
    color: "#777",
  },
  signupLink: {
    color: "#007BFF",
    fontWeight: "600",
  },
});
