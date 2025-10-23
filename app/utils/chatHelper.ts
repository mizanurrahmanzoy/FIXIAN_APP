// app/utils/chatHelper.ts
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const findOrCreateChat = async (user1Id: string, user2Id: string) => {
  const chatsRef = collection(db, "Chats");

  // Check if chat exists
  const q = query(chatsRef, where("participants", "array-contains", user1Id));
  const snapshot = await getDocs(q);

  let chatId = null;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.participants.includes(user2Id)) {
      chatId = doc.id;
    }
  });

  if (chatId) return chatId; // existing chat found

  // Create new chat
  const newChat = await addDoc(chatsRef, {
    participants: [user1Id, user2Id],
    createdAt: serverTimestamp(),
    lastMessage: "",
    updatedAt: serverTimestamp(),
  });

  return newChat.id;
};
