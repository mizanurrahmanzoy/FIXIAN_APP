import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const router = useRouter();
  const pagerRef = useRef<React.ElementRef<typeof PagerView>>(null);
  const [page, setPage] = useState(0);

  // Slide to next screen
  const goToNext = () => {
    pagerRef.current?.setPage(1);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Dot Indicators */}
      <View style={styles.dotContainer}>
        <View style={[styles.dot, page === 0 && styles.activeDot]} />
        <View style={[styles.dot, page === 1 && styles.activeDot]} />
      </View>

      <PagerView
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
        ref={pagerRef}
      >
        {/* SLIDE 1 (White) */}
        <View key="1" style={[styles.page, styles.whiteBackground]}>
          <Text style={styles.titleBlack}>Fixian</Text>
          <Text style={styles.subtitleBlack}>
            An Intelligent Service Booking{"\n"}and Management System
          </Text>

          <TouchableOpacity
            style={styles.primaryButtonBlack}
            onPress={goToNext}
          >
            <Text style={styles.primaryButtonTextBlack}>Start</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.iconRight} />
          </TouchableOpacity>
        </View>

        {/* SLIDE 2 (Now White Theme) */}
        <View key="2" style={[styles.page, styles.whiteBackground]}>
          <Text style={styles.sectionTitleBlack}>
            Connecting You to{"\n"}Trusted Experts
          </Text>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: "https://via.placeholder.com/300x200.png" }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.imageLabelWhite}>Expert Service</Text>
          </View>

          <Text style={styles.descriptionBlack}>
            At <Text style={styles.boldBlack}>Fixian</Text>, we believe everyone deserves reliable,
            professional service. Our intelligent platform connects you with verified technicians who
            can handle everything from AC repairs to computer fixes and automotive services.
          </Text>

          {/* Features */}
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#000" style={styles.featureIcon} />
            <Text style={styles.featureTextBlack}>
              <Text style={styles.featureTitleBlack}>Expert Technicians{"\n"}</Text>
              Verified professionals with proven track records
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="time" size={20} color="#000" style={styles.featureIcon} />
            <Text style={styles.featureTextBlack}>
              <Text style={styles.featureTitleBlack}>Quick Booking{"\n"}</Text>
              Schedule services that fit your timeline
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={20} color="#000" style={styles.featureIcon} />
            <Text style={styles.featureTextBlack}>
              <Text style={styles.featureTitleBlack}>Guaranteed Quality{"\n"}</Text>
              Protected service with satisfaction guarantee
            </Text>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.secondaryButtonBlack}
            onPress={() => router.push("./login")}
          >
            <Text style={styles.secondaryButtonTextBlack}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.iconRight} />
          </TouchableOpacity>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  /* DOT INDICATORS */
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    marginHorizontal: 5,
    borderRadius: 50,
    backgroundColor: "#ccc",
  },
  activeDot: {
    backgroundColor: "#000",
    width: 12,
    height: 12,
  },

  /* WHITE THEME FOR BOTH SCREENS */
  whiteBackground: {
    backgroundColor: "#fff",
  },

  /* Slide 1 */
  titleBlack: {
    color: "#000",
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitleBlack: {
    color: "#444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButtonBlack: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
  },
  primaryButtonTextBlack: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  /* Slide 2 */
  sectionTitleBlack: {
    color: "#000",
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
  imageLabelWhite: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#000",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: "600",
  },

  descriptionBlack: {
    color: "#444",
    marginBottom: 32,
    lineHeight: 22,
    fontSize: 15,
  },
  boldBlack: {
    color: "#000",
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
  featureTextBlack: {
    color: "#444",
    fontSize: 14,
    flex: 1,
  },
  featureTitleBlack: {
    color: "#000",
    fontWeight: "600",
  },

  /* Get Started Button (Slide 2) */
  secondaryButtonBlack: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 20,
  },
  secondaryButtonTextBlack: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  iconRight: {
    marginLeft: 8,
  },
});
