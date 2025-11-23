// app/customer/ChatRoom.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, ScrollView, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GiftedChat, Bubble, Actions, MessageImageProps } from "react-native-gifted-chat";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebaseConfig";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../utils/cloudinary";
import ImageViewer from "react-native-image-zoom-viewer";

export default function ChatRoom() {
  const { chatId, senderId, receiverId, receiverName } = useLocalSearchParams();
  const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId ?? "";
  const senderIdStr = Array.isArray(senderId) ? senderId[0] : senderId ?? "";
  const receiverIdStr = Array.isArray(receiverId) ? receiverId[0] : receiverId ?? "";

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [senderImage, setSenderImage] = useState<string | null>(null);
  const [receiverImage, setReceiverImage] = useState<string | null>(null);
  const [receiverData, setReceiverData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const DEFAULT_AVATAR = require("../../assets/default-avatar.png");

  // -----------------------------
  // Load avatars and receiver info
  // -----------------------------
  useEffect(() => {
    async function loadUsers() {
      try {
        const senderSnap = await getDoc(doc(db, "customers", senderIdStr));
        const receiverSnap = await getDoc(doc(db, "serviceProviders", receiverIdStr));

        if (senderSnap.exists()) setSenderImage(senderSnap.data().profileImage || null);
        if (receiverSnap.exists()) {
          setReceiverImage(receiverSnap.data().profileImage || null);
          setReceiverData(receiverSnap.data());
        }
      } catch (err) {
        console.log("Avatar fetch error:", err);
      }
    }
    loadUsers();
  }, []);

  // -----------------------------
  // Load last chat from local storage
  // -----------------------------
  useEffect(() => {
    const loadLocalMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem(`lastChat_${chatIdStr}`);
        if (stored) setMessages(JSON.parse(stored));
      } catch (err) {
        console.log("Failed to load local messages", err);
      }
    };
    loadLocalMessages();
  }, [chatIdStr]);

  // -----------------------------
  // Real-time sync with Firestore
  // -----------------------------
  useEffect(() => {
    if (!chatIdStr) return;

    const messagesRef = collection(db, "chats", chatIdStr, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
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
      }).reverse();

      setMessages(all);
      setLoading(false);

      await AsyncStorage.setItem(`lastChat_${chatIdStr}`, JSON.stringify(all));
    });

    return unsubscribe;
  }, [chatIdStr, senderImage, receiverImage]);

  // -----------------------------
  // Upload image to Cloudinary
  // -----------------------------
  const uploadImageToCloudinary = async (uri: string) => {
    setUploading(true);
    const data = new FormData();
    data.append("file", { uri, name: "chat_image.jpg", type: "image/jpeg" } as any);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", "chat_images");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      return result.secure_url;
    } catch (err) {
      console.log("Upload failed:", err);
      Alert.alert("Error", "Image upload failed.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------
  // Pick Image from gallery or camera
  // -----------------------------
  const pickImage = async (fromCamera = false) => {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
    }

    if (!result.canceled && result.assets?.length) {
      const imgUri = result.assets[0].uri;
      const uploadedUrl = await uploadImageToCloudinary(imgUri);
      if (uploadedUrl) sendImage(uploadedUrl);
    }
  };

  const sendImage = async (imageUrl: string) => {
    const messagesRef = collection(db, "chats", chatIdStr, "messages");
    await addDoc(messagesRef, {
      image: imageUrl,
      createdAt: serverTimestamp(),
      user: { _id: senderIdStr, avatar: senderImage },
    });
  };

  // -----------------------------
  // Send text message
  // -----------------------------
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
        <TouchableOpacity style={styles.header} onPress={() => setModalVisible(true)}>
          <Image
            source={receiverImage ? { uri: receiverImage } : DEFAULT_AVATAR}
            style={styles.headerAvatar}
          />
          <Text style={styles.headerText}>
            {receiverData?.name || (Array.isArray(receiverName) ? receiverName[0] : receiverName) || "Chat"}
          </Text>
        </TouchableOpacity>

        {/* Uploading indicator */}
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", marginTop: 8 }}>Uploading...</Text>
          </View>
        )}

        {/* Chat */}
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{ _id: senderIdStr, avatar: senderImage || undefined }}
          inverted={true}
          alwaysShowSend
          renderAvatar={(props) => (
            <Image
              source={props.currentMessage?.user?.avatar ? { uri: props.currentMessage.user.avatar } : DEFAULT_AVATAR}
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
              onPressActionButton={() => {
                Alert.alert(
                  "Send Image",
                  "Choose an option",
                  [
                    { text: "Camera", onPress: () => pickImage(true) },
                    { text: "Gallery", onPress: () => pickImage(false) },
                    { text: "Cancel", style: "cancel" },
                  ],
                  { cancelable: true }
                );
              }}
            />
          )}
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                right: { backgroundColor: "#DCF8C6", borderRadius: 12, padding: 8 },
                left: { backgroundColor: "#FFF", borderRadius: 12, padding: 8 },
              }}
              textStyle={{
                right: { color: "#000" },
                left: { color: "#000" },
              }}
            />
          )}
          renderMessageImage={(props: MessageImageProps) => (
            <TouchableOpacity
              onPress={() => {
                const index = messages.findIndex((m) => m._id === props.currentMessage._id);
                setSelectedImageIndex(index);
                setImageViewerVisible(true);
              }}
            >
              <Image
                source={{ uri: props.currentMessage.image }}
                style={{ width: 200, height: 200, borderRadius: 12, resizeMode: "cover" }}
              />
            </TouchableOpacity>
          )}
        />

        {/* Receiver Info Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={{ alignItems: "center" }}>
                <Image
                  source={receiverImage ? { uri: receiverImage } : DEFAULT_AVATAR}
                  style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 15 }}
                />
                <Text style={styles.modalName}>{receiverData?.name || receiverName}</Text>
                <Text style={styles.modalText}>Email: {receiverData?.email || "N/A"}</Text>
                <Text style={styles.modalText}>
                  Address: {receiverData?.location ? `${receiverData.location.village}, ${receiverData.location.city}` : "N/A"}
                </Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Fullscreen Image Viewer */}
        <Modal visible={imageViewerVisible} transparent={true} onRequestClose={() => setImageViewerVisible(false)}>
          <ImageViewer
            imageUrls={messages.filter((m) => m.image).map((m) => ({ url: m.image }))}
            index={selectedImageIndex}
            enableSwipeDown
            onSwipeDown={() => setImageViewerVisible(false)}
            renderHeader={() => (
              <TouchableOpacity style={styles.backArrow} onPress={() => setImageViewerVisible(false)}>
                <Text style={{ color: "#fff", fontSize: 18 }}>← Back</Text>
              </TouchableOpacity>
            )}
          />
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECE5DD" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ECE5DD" },
  header: { flexDirection: "row", alignItems: "center", padding: 14, backgroundColor: "#075E54", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerText: { fontSize: 18, color: "#fff", fontWeight: "600" },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  modalName: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  modalText: { fontSize: 16, marginBottom: 6 },
  closeBtn: { marginTop: 20, backgroundColor: "#075E54", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  uploadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 10 },
  backArrow: { position: "absolute", top: 40, left: 20, zIndex: 20 },
});
