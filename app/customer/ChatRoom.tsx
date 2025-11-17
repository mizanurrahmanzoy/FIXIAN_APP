// app/customer/ChatRoom.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { GiftedChat, Actions, Bubble } from "react-native-gifted-chat";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { CLOUD_NAME, UPLOAD_PRESET } from "../utils/cloudinary";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ChatRoom() {
  const { chatId, senderId, receiverId, receiverName } = useLocalSearchParams();

  const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId ?? "";
  const senderIdStr = Array.isArray(senderId) ? senderId[0] : senderId ?? "";
  const receiverIdStr = Array.isArray(receiverId) ? receiverId[0] : receiverId ?? "";

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [senderImage, setSenderImage] = useState<string>("");
  const [receiverImage, setReceiverImage] = useState<string>("");

  // Load avatars
  useEffect(() => {
    async function loadImages() {
      try {
        const senderRef = doc(db, "customers", senderIdStr);
        const receiverRef = doc(db, "serviceProviders", receiverIdStr);

        const senderSnap = await getDoc(senderRef);
        const receiverSnap = await getDoc(receiverRef);

        if (senderSnap.exists()) setSenderImage(senderSnap.data().profileImage || "");
        if (receiverSnap.exists()) setReceiverImage(receiverSnap.data().profileImage || "");
      } catch (err) {
        console.log("Avatar fetch error:", err);
      }
    }
    loadImages();
  }, []);

  // Load messages
  useEffect(() => {
    if (!chatIdStr) return;

    const messagesRef = collection(db, "chats", chatIdStr, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc")); // ascending for bottom scroll

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          _id: docSnap.id,
          text: data.text || "",
          image: data.image || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          user: {
            _id: data.user._id,
            avatar: data.user._id === senderIdStr ? senderImage : receiverImage,
            name: data.user.name || "",
          },
        };
      });
      setMessages(all);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatIdStr, senderImage, receiverImage]);

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (uri: string) => {
    const data = new FormData();
    data.append("file", {
      uri,
      name: "chat_image.jpg",
      type: "image/jpeg",
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", "chat_images");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    return result.secure_url;
  };

  // Pick Image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const imgUri = result.assets[0].uri;
      const uploadedUrl = await uploadImageToCloudinary(imgUri);
      sendImage(uploadedUrl);
    }
  };

  // Send Image Message
  const sendImage = async (imageUrl: string) => {
    const messagesRef = collection(db, "chats", chatIdStr, "messages");
    await addDoc(messagesRef, {
      image: imageUrl,
      createdAt: serverTimestamp(),
      user: { _id: senderIdStr, avatar: senderImage },
    });
  };

  // Send Text Message
  const onSend = useCallback(
    async (messagesArray: any[] = []) => {
      const msg = messagesArray[0];
      if (!msg) return;

      const messagesRef = collection(db, "chats", chatIdStr, "messages");
      await addDoc(messagesRef, {
        text: msg.text,
        createdAt: serverTimestamp(),
        user: { _id: senderIdStr, avatar: senderImage },
      });
    },
    [chatIdStr, senderIdStr, senderImage]
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008069" />
          <Text>Loading chat…</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: receiverImage }} style={styles.headerAvatar} />
          <Text style={styles.headerText}>{receiverName}</Text>
        </View>

        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{ _id: senderIdStr, avatar: senderImage }}
          renderAvatar={(props) => (
            <Image
              source={{ uri: props.currentMessage.user.avatar }}
              style={styles.avatar}
            />
          )}
          renderActions={() => (
            <Actions
              icon={() => (
                <Image
                  source={{ uri: "https://img.icons8.com/ios-filled/50/000000/camera.png" }}
                  style={{ width: 28, height: 28 }}
                />
              )}
              onPressActionButton={pickImage}
            />
          )}
          alwaysShowSend
          inverted={false} // bottom to top scroll like WhatsApp
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                right: { backgroundColor: "#DCF8C6" },
                left: { backgroundColor: "#FFF" },
              }}
              textStyle={{
                right: { color: "#000" },
                left: { color: "#000" },
              }}
            />
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECE5DD" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ECE5DD" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#075E54",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerText: { fontSize: 18, color: "#fff", fontWeight: "600" },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 6 },
});
