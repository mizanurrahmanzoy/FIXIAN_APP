import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      setLoading(false);
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/selectUserType"), // ✅ redirect
        },
      ]);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed.";
      Alert.alert("Signup Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Branding Header */}
      <Text style={styles.brand}>Fixian.</Text>
      <Text style={styles.welcome}>Create an Account</Text>
      <Text style={styles.subtitle}>
        Everything You Need, One Tap Away!
      </Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Signup Button */}
      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: "#93C5FD" }]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing up..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Already have account */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text style={styles.loginBold}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  brand: { fontSize: 32, fontWeight: "bold", color: "#2563EB", marginBottom: 6 }, // Fixian. Blue
  welcome: { fontSize: 24, fontWeight: "bold", color: "#000", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#4B5563", marginBottom: 20 },
  input: { width: "100%", borderWidth: 1, borderColor: "#D1D5DB", padding: 12, marginBottom: 12, borderRadius: 8, fontSize: 16 },
  button: { width: "100%", backgroundColor: "#2563EB", padding: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  loginLink: { marginTop: 20 },
  loginText: { color: "#4B5563", fontSize: 14 },
  loginBold: { color: "#2563EB", fontWeight: "bold" },
});
