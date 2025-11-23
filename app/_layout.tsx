import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Listen to auth state
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Get stored role
            const role = await AsyncStorage.getItem("role");

            if (role === "customer") {
              router.replace("/customer/dashboard");
            } else if (role === "provider") {
              router.replace("/service_provider/dashboard");
            } else {
              // If role not found, go to home
              router.replace("/login"); // your home/intro slider
            }
          } else {
            // Not logged in, go to home
            router.replace("/login"); 
          }
        });
      } catch (err) {
        console.error("Auth check error:", err);
        // Always fallback to home
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Minimal splash while checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="selectUserType" options={{ headerShown: true }} />
      <Stack.Screen name="customer/dashboard" />
      <Stack.Screen name="service_provider/dashboard" />
    </Stack>
  );
}
