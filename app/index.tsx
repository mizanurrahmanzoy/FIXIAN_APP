import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Screen */}
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>Fixian</Text>
        <Text style={styles.subtitle}>
          An Intelligent Service Booking{"\n"}and Management System
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("./login")}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="black" style={styles.iconRight} />
        </TouchableOpacity>
      </View>

      {/* Mission & Vision Screen */}
      <View style={styles.missionSection}>
        <Text style={styles.sectionTitle}>
          Connecting You to{"\n"}Trusted Experts
        </Text>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/300x200.png" }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.imageLabel}>Expert Service</Text>
        </View>

        <Text style={styles.description}>
          At <Text style={styles.boldText}>Fixian</Text>, we believe everyone deserves reliable,
          professional service. Our intelligent platform connects you with verified technicians who
          can handle everything from AC repairs to computer fixes and automotive services.
        </Text>

        {/* Features List */}
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="white" style={styles.featureIcon} />
          <Text style={styles.featureText}>
            <Text style={styles.featureTitle}>Expert Technicians{"\n"}</Text>
            Verified professionals with proven track records
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="time" size={20} color="white" style={styles.featureIcon} />
          <Text style={styles.featureText}>
            <Text style={styles.featureTitle}>Quick Booking{"\n"}</Text>
            Schedule services that fit your timeline
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark" size={20} color="white" style={styles.featureIcon} />
          <Text style={styles.featureText}>
            <Text style={styles.featureTitle}>Guaranteed Quality{"\n"}</Text>
            Protected service with satisfaction guarantee
          </Text>
        </View>

        {/* Start Journey Button */}
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Start Your Journey</Text>
          <Ionicons name="arrow-forward" size={20} color="black" style={styles.iconRight} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  welcomeSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 700,
    backgroundColor: "#000",
    paddingHorizontal: 24,
  },
  title: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  iconRight: {
    marginLeft: 8,
  },
  missionSection: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  imageContainer: {
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  imageLabel: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    color: "#ccc",
    marginBottom: 32,
    lineHeight: 22,
    fontSize: 15,
  },
  boldText: {
    color: "#fff",
    fontWeight: "bold",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    color: "#ccc",
    fontSize: 14,
    flex: 1,
  },
  featureTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  secondaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});
