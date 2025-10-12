import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
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
      Alert.alert("Error", "Please fill all fields and select a role");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save role and basic info
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        isProfileComplete: false,
      });

      setLoading(false);
      Alert.alert("Success", "Account created successfully!");

      // Redirect based on role
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo / Banner */}
      {/* <Image
        source={require("../assets/logo.png")} // replace with your image name
        style={styles.logo}
        resizeMode="contain"
      /> */}

      {/* Title */}
      <Text style={styles.title}>Create Your Account</Text>

      {/* Email Field */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Field */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Role Selection */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "customer" && styles.activeRole]}
          onPress={() => setRole("customer")}
        >
          <Text
            style={[styles.roleText, role === "customer" && styles.activeRoleText]}
          >
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "provider" && styles.activeRole]}
          onPress={() => setRole("provider")}
        >
          <Text
            style={[styles.roleText, role === "provider" && styles.activeRoleText]}
          >
            Provider
          </Text>
        </TouchableOpacity>
      </View>

      {/* Signup Button */}
      <TouchableOpacity
        style={[styles.signupButton, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signupButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Navigate to Login */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.footerLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 10,
    marginTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#000",
    marginBottom: 14,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 18,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeRole: {
    backgroundColor: "#111",
  },
  roleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  activeRoleText: {
    color: "#fff",
  },
  signupButton: {
    backgroundColor: "#111",
    paddingVertical: 15,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 25,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footerText: {
    color: "#444",
    fontSize: 15,
  },
  footerLink: {
    color: "#111",
    fontWeight: "700",
  },
});
